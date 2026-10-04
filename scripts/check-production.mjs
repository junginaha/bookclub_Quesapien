import { appendFile } from 'node:fs/promises';

const base = new URL(process.env.QSAPIENS_URL || 'https://www.qsapiens.com');
if (base.protocol !== 'https:' && base.hostname !== 'localhost') {
  throw new Error('Production checks require HTTPS');
}

const checks = [
  { path: '/', expected: 200, text: 'Qsapiens' },
  { path: '/bookclub/met-guard', expected: 200, text: '패트릭 브링리' },
  { path: '/giants', expected: 200, text: '발제' },
  { path: '/archive', expected: 200, text: '기록' },
  // Empty input must stop before any AI call or application/database write.
  { path: '/api/discussion/generate', expected: 400, code: 'missing_input', body: {} },
];

async function check(spec) {
  const started = Date.now();
  const response = await fetch(new URL(spec.path, base), {
    method: spec.body ? 'POST' : 'GET',
    headers: spec.body ? { 'Content-Type': 'application/json' } : {},
    body: spec.body ? JSON.stringify(spec.body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status !== spec.expected) throw new Error(`HTTP ${response.status}; expected ${spec.expected}`);
  const text = await response.text();
  if (spec.text && !text.includes(spec.text)) throw new Error('Expected page content missing');
  if (spec.code && JSON.parse(text).code !== spec.code) throw new Error('Expected validation response missing');
  return `${Date.now() - started}ms`;
}

const results = await Promise.all(checks.map(async spec => {
  try {
    return { path: spec.path, ok: true, detail: await check(spec) };
  } catch {
    // One retry reduces transient alerts. Do not expose response bodies or user data.
    try {
      return { path: spec.path, ok: true, detail: `${await check(spec)} (retry)` };
    } catch (error) {
      return { path: spec.path, ok: false, detail: error.message };
    }
  }
}));

const lines = results.map(result => `${result.ok ? 'PASS' : 'FAIL'} ${result.path}: ${result.detail}`);
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `Qsapiens availability checks — ${new Date().toISOString()}\n\n${lines.map(line => `- ${line}`).join('\n')}\n\nNo AI generation, booking or payment was performed. These checks do not establish that successful generation or payment works.\n`);
}
if (results.some(result => !result.ok)) process.exitCode = 1;

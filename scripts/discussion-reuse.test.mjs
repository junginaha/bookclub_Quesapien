import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicDiscussionInput, singleFlight } from '../src/lib/discussionReuse.ts';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');

function reuseHarness() {
  const cache = new Map();
  const env = {};
  let calls = 0;
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL('../src/lib/reusableDiscussion.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(code, {
    module, exports: module.exports, process: { env },
    require(name) {
      if (name === 'next/cache') return { unstable_cache: fn => async (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = await fn(...args);
        cache.set(key, result);
        return result;
      } };
      if (name === '@/lib/discussionReuse') return { publicDiscussionInput, singleFlight };
      if (name === '@/lib/discussionEngine') return { buildDiscussion: async () => {
        calls++;
        return { questions: ['fixture'], call: calls };
      } };
      throw new Error(name);
    },
  });
  return { reuse: module.exports.reusableDiscussion, env, calls: () => calls };
}

test('paused generation serves a stored result and blocks a new book', async () => {
  const h = reuseHarness();
  const input = { title: '책', author: '작가' };
  const result = await h.reuse(input);
  h.env.DISCUSSION_GENERATION_ENABLED = 'false';
  assert.deepEqual(await h.reuse(input), result);
  await assert.rejects(h.reuse({ ...input, title: '새 책' }), /paused/);
  assert.equal(h.calls(), 1);
});

test('cache version isolates changed engine policy and private input stays uncached', async () => {
  const h = reuseHarness();
  const input = { title: '책', author: '작가' };
  await h.reuse(input);
  await h.reuse(input);
  assert.equal(h.calls(), 1);
  h.env.DISCUSSION_CACHE_VERSION = '2';
  await h.reuse(input);
  assert.equal(h.calls(), 2);
  await h.reuse({ ...input, description: '개인 기록' });
  await h.reuse({ ...input, description: '개인 기록' });
  assert.equal(h.calls(), 4);
});

test('custom descriptions and free-form requests are never shared', () => {
  assert.equal(publicDiscussionInput({ title: '책', author: '', description: '' }), null);
  assert.equal(publicDiscussionInput({ title: '책', author: '작가', description: '내 개인 기록' }), null);
});

test('identical books normalize while depth and direction remain distinct', () => {
  const input = { title: ' 책 ', author: ' 작가 ' };
  const result = publicDiscussionInput(input);
  assert.deepEqual(result, { title: '책', author: '작가', depth: 'general', direction: 'free' });
  assert.notDeepEqual(result, publicDiscussionInput({ ...input, depth: 'deep' }));
  assert.notDeepEqual(result, publicDiscussionInput({ ...input, direction: 'life' }));
});

test('simultaneous identical requests invoke expensive work once', async () => {
  const share = singleFlight();
  let calls = 0;
  const run = async () => { calls++; await new Promise(resolve => setTimeout(resolve, 10)); return 42; };
  assert.deepEqual(await Promise.all([share('book', run), share('book', run), share('book', run)]), [42, 42, 42]);
  assert.equal(calls, 1);
});

test('a rejected request is released so a retry can succeed', async () => {
  const share = singleFlight();
  await assert.rejects(share('book', async () => { throw new Error('quota'); }), /quota/);
  assert.equal(await share('book', async () => 'saved'), 'saved');
});

test('concurrency limit rejects distinct work but still shares existing work', async () => {
  const share = singleFlight(1);
  let finish;
  const first = share('one', () => new Promise(resolve => { finish = resolve; }));
  const same = share('one', async () => 'unexpected');
  await assert.rejects(share('two', async () => 'two'), /discussion_busy/);
  finish('one');
  assert.deepEqual(await Promise.all([first, same]), ['one', 'one']);
});

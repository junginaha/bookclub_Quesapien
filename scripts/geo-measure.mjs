// 월 1회 AI 인용 측정: node scripts/geo-measure.mjs
// 환경변수(있는 것만 측정): OPENAI_API_KEY, PERPLEXITY_API_KEY, GEMINI_API_KEY
// 네이버 AI 브리핑은 공개 API가 없어 수동 확인.
import { writeFileSync } from "node:fs";

const BRAND = ["qsapiens", "큐사피엔스", "질문하는 사람들"];
const QUERIES = [
  "서울 40대 독서모임 추천", "서울 50대 독서모임 추천", "4050 독서모임 서울",
  "40대 혼자 독서모임 가도 되나요", "50대 처음 독서모임 어색한가요", "독서모임에서 친구 사귈 수 있나요",
  "말주변 없어도 독서토론 할 수 있나요", "독서모임 분위기 어떤가요", "나이 많은 사람도 독서모임 환영하나요",
  "책 안 읽고 독서모임 가도 되나요", "독서모임 처음 갈 때 준비물", "독서모임 책은 누가 고르나요",
  "강남 직장인 독서모임 평일 저녁", "퇴근 후 독서모임 서울", "서초 독서모임 추천",
  "주말 오후 서울 독서모임", "독서모임 한 달에 몇 번 하나요", "소규모 독서모임 정원 몇 명",
  "질문으로 토론하는 독서모임", "인문학 독서모임 서울 중장년", "중년 취미 모임 독서 추천",
  "서울 독서모임 참가비 얼마", "유료 독서모임 돈 낼 가치 있나요", "독서모임 중간에 그만둬도 되나요",
  "중년 독서모임 어디서 찾나요", "독서모임 신청 방법", "독서모임 첫날 어떻게 진행되나요",
  "은퇴 앞둔 50대 모임 추천", "50대 새로운 사람 만나는 방법", "서울 북클럽 혼자 가도 편안한 곳",
];
const hit = (t) => BRAND.some((b) => t.toLowerCase().includes(b.toLowerCase()));

async function openai(q) {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4.1-mini", tools: [{ type: "web_search" }], input: q }),
  });
  return JSON.stringify(await r.json());
}
async function perplexity(q) {
  const r = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content: q }] }),
  });
  return JSON.stringify(await r.json());
}
async function gemini(q) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: q }] }], tools: [{ google_search: {} }] }) }
  );
  return JSON.stringify(await r.json());
}

const engines = [
  ["chatgpt", process.env.OPENAI_API_KEY && openai],
  ["perplexity", process.env.PERPLEXITY_API_KEY && perplexity],
  ["gemini", process.env.GEMINI_API_KEY && gemini],
].filter(([, f]) => f);

const rows = [["date", "engine", "query", "cited"]];
const date = new Date().toISOString().slice(0, 10);
for (const q of QUERIES) {
  for (const [name, f] of engines) {
    try { rows.push([date, name, q, hit(await f(q)) ? 1 : 0]); }
    catch { rows.push([date, name, q, "error"]); }
  }
  rows.push([date, "naver_ai_briefing(manual)", q, ""]);
}
const file = `geo-${date}.csv`;
writeFileSync(file, rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n"));
for (const [name] of engines) {
  const n = rows.filter((r) => r[1] === name);
  console.log(name, `${n.filter((r) => r[3] === 1).length}/${n.length}`);
}
console.log("saved", file);

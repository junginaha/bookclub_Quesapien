// Exact legacy demo rows from /api/admin/run-migrations are not customer evidence.
// Keep the database intact; exclude only known demo author/content pairs.
const LEGACY_DEMOS = new Map([
  ["채현 · UX 디자이너 · 30", "처음으로 모르는 사람 앞에서 솔직한 대화를 했어요. 그 밤이 한 달 동안 저를 흔들고 있었습니다."],
  ["진우 · 개발자 · 34", "사람은 아직 믿을 만하다는 감각을 4년 만에 다시 느꼈습니다. 그게 가장 큰 회복이었어요."],
  ["윤서 · 에디터 · 28", "질문 하나가 삶을 흔들었습니다. 그 후로 일을 그만두고 6개월을 쉬었어요. 후회하지 않습니다."],
  ["도연 · 대학원생 · 26", "대답을 잘 하려 애쓰지 않게 된 첫 번째 자리였어요. 정답 없이 머무는 법을 배웠습니다."],
  ["하린 · 교사 · 39", "우리 반 아이들에게도 이런 자리를 만들어주고 싶다고 생각했습니다. 그게 변화의 시작이었어요."],
]);
export function excludeDemoReviews<T extends { author_name: string; content: string }>(rows: T[]): T[] {
  return rows.filter(row => LEGACY_DEMOS.get(row.author_name) !== row.content);
}

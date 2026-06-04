/**
 * 스팸/잘못된 데이터 정리 엔드포인트
 * GET /api/admin/cleanup  → 스팸 질문·답변 일괄 삭제
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// 삭제할 키워드 패턴 (landing_questions.content에 포함된 경우 삭제)
const SPAM_KEYWORDS = [
  "캐나다의 사법",
  "수도권 ICT 교육",
  "안양과천상공회의소",
  "zoom 링크",
  "LMS 수강코드",
  "고인의 명복",
  "고인을 명복",
  "비엠씨랩",
  "goor.me",
  "삼가",
];

// 삭제할 작성자 이름 (landing_questions.author_name)
const SPAM_AUTHORS = ["박상현"];

// 삭제할 정확한 내용 (완전 일치 또는 포함)
const SPAM_EXACT = [
  "사랑이란... 인생의 반짝이는 별과 같은 것 생명을 가진 것들의 축복",
];

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any;

  const { data: all } = await db
    .from("landing_questions")
    .select("id, content, author_name");

  if (!all) return NextResponse.json({ error: "DB 조회 실패" }, { status: 500 });

  const toDelete: string[] = [];

  for (const q of all) {
    const content: string = q.content ?? "";
    const author: string = q.author_name ?? "";

    const isSpamKeyword = SPAM_KEYWORDS.some((k) => content.includes(k));
    const isSpamAuthor = SPAM_AUTHORS.includes(author);
    const isSpamExact = SPAM_EXACT.some((s) => content.includes(s));

    if (isSpamKeyword || isSpamAuthor || isSpamExact) {
      toDelete.push(q.id);
    }
  }

  if (toDelete.length === 0) {
    return NextResponse.json({ message: "삭제할 항목이 없습니다.", deleted: 0 });
  }

  // 답변·반응 먼저 삭제
  for (const id of toDelete) {
    await db.from("landing_question_answers").delete().eq("question_id", id);
    await db.from("landing_question_reactions").delete().eq("question_id", id);
  }

  const { error } = await db
    .from("landing_questions")
    .delete()
    .in("id", toDelete);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    message: `${toDelete.length}개 항목이 삭제됐습니다.`,
    deleted: toDelete.length,
    ids: toDelete,
  });
}

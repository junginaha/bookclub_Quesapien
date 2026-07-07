/**
 * 강제 삭제 — Supabase ilike로 내용 검색 후 즉시 삭제 (운영자 전용, EMERGENCY HOTFIX로
 * 인증 추가됨, docs/PROJECT_AUDIT.md 참고)
 * GET /api/admin/force-delete  → 스팸 내용 DB에서 즉시 삭제
 */
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/admin";

// DB 레벨 ilike 패턴 (content ILIKE '%pattern%')
const FORCE_PATTERNS = [
  "박상현",
  "캐나다의 사법",
  "수도권 ICT",
  "안양과천상공",
  "zoom 링크",
  "LMS 수강",
  "goor.me",
  "비엠씨랩",
  "고인의 명복",
  "고인을 명복",
  "에스트로겐",
  "에겐남",
  "사랑이란",
  "반짝이는 별과 같은 것",
];

export async function GET() {
  if (!(await isOperator(await createClient()))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any;

  const deleted: string[] = [];
  const errors: string[] = [];

  // landing_questions: 패턴별로 검색 후 삭제
  for (const pattern of FORCE_PATTERNS) {
    const { data: found, error: findErr } = await db
      .from("landing_questions")
      .select("id")
      .ilike("content", `%${pattern}%`);

    if (findErr) { errors.push(`find(${pattern}): ${findErr.message}`); continue; }
    if (!found || found.length === 0) continue;

    const ids = (found as { id: string }[]).map((r) => r.id);

    // 답변·반응 먼저 삭제
    for (const id of ids) {
      await db.from("landing_question_answers").delete().eq("question_id", id);
      await db.from("landing_question_reactions").delete().eq("question_id", id);
    }

    const { error: delErr } = await db
      .from("landing_questions")
      .delete()
      .in("id", ids);

    if (delErr) errors.push(`del(${pattern}): ${delErr.message}`);
    else deleted.push(...ids.map((id: string) => `${pattern}:${id}`));
  }

  // author_name 기준 삭제 (박상현, 에겐남 등)
  const authorPatterns = ["박상현", "에겐남"];
  for (const author of authorPatterns) {
    const { data: found } = await db
      .from("landing_questions")
      .select("id")
      .ilike("author_name", `%${author}%`);

    if (!found || found.length === 0) continue;
    const ids = (found as { id: string }[]).map((r) => r.id);
    for (const id of ids) {
      await db.from("landing_question_answers").delete().eq("question_id", id);
      await db.from("landing_question_reactions").delete().eq("question_id", id);
    }
    await db.from("landing_questions").delete().in("id", ids);
    deleted.push(...ids.map((id: string) => `author:${author}:${id}`));
  }

  // landing_question_answers에 박상현 관련 답변도 삭제
  for (const pattern of ["박상현", "캐나다의 사법", "수도권 ICT", "goor.me", "비엠씨랩", "에스트로겐"]) {
    const { data: found } = await db
      .from("landing_question_answers")
      .select("id")
      .ilike("content", `%${pattern}%`);

    if (!found || found.length === 0) continue;
    const ids = (found as { id: string }[]).map((r) => r.id);
    await db.from("landing_question_answers").delete().in("id", ids);
    deleted.push(...ids.map((id: string) => `answer:${pattern}:${id}`));
  }

  return NextResponse.json({
    ok: true,
    message: deleted.length > 0
      ? `총 ${deleted.length}건 즉시 삭제됐습니다.`
      : "삭제할 항목이 없습니다 (이미 정리됐거나 데이터가 없음).",
    deleted_count: deleted.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}

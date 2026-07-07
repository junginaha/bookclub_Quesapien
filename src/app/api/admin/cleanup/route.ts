/**
 * 스팸/중복 데이터 정리 (운영자 전용 — EMERGENCY HOTFIX로 인증 추가됨, docs/PROJECT_AUDIT.md 참고)
 * GET  /api/admin/cleanup         → 스팸 질문·답변 일괄 삭제
 * POST /api/admin/cleanup         → 중복 질문·답변 정리
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isOperator } from "@/lib/admin";

// ── 스팸 키워드 ────────────────────────────────────────────────
const SPAM_KEYWORDS = [
  "캐나다의 사법", "수도권 ICT 교육", "안양과천상공회의소",
  "zoom 링크", "LMS 수강코드", "고인의 명복", "고인을 명복",
  "비엠씨랩", "goor.me", "삼가", "에스트로겐",
];
const SPAM_AUTHORS = ["박상현", "에겐남"];
const SPAM_EXACT   = ["사랑이란... 인생의 반짝이는 별과 같은 것 생명을 가진 것들의 축복"];

// ── GET: 스팸 삭제 ─────────────────────────────────────────────
export async function GET() {
  if (!(await isOperator(await createClient()))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any;

  const { data: all } = await db.from("landing_questions").select("id, content, author_name");
  if (!all) return NextResponse.json({ error: "DB 조회 실패" }, { status: 500 });

  const toDelete = (all as { id: string; content: string; author_name: string }[])
    .filter((q) =>
      SPAM_KEYWORDS.some((k) => q.content?.includes(k)) ||
      SPAM_AUTHORS.includes(q.author_name ?? "") ||
      SPAM_EXACT.some((s) => q.content?.includes(s))
    )
    .map((q) => q.id);

  if (toDelete.length === 0) {
    return NextResponse.json({ message: "삭제할 스팸 항목이 없습니다.", deleted: 0 });
  }

  for (const id of toDelete) {
    await db.from("landing_question_answers").delete().eq("question_id", id);
    await db.from("landing_question_reactions").delete().eq("question_id", id);
  }
  const { error } = await db.from("landing_questions").delete().in("id", toDelete);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: `스팸 ${toDelete.length}개 삭제됐습니다.`, deleted: toDelete.length });
}

// ── POST: 중복 정리 (운영자 전용) ──────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await isOperator(await createClient()))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any;
  const body = await req.json().catch(() => ({})) as { action?: string };

  // 중복 답변 삭제
  const dedupAnswers = async () => {
    const { data: answers } = await db
      .from("landing_question_answers")
      .select("id, question_id, content, created_at")
      .order("created_at", { ascending: true });
    const seen = new Map<string, boolean>();
    const toDelete: string[] = [];
    for (const a of (answers ?? [])) {
      const key = `${a.question_id}::${a.content?.trim()}`;
      if (seen.has(key)) toDelete.push(a.id);
      else seen.set(key, true);
    }
    if (toDelete.length > 0) await db.from("landing_question_answers").delete().in("id", toDelete);
    return toDelete.length;
  };

  // 중복 질문 삭제
  const dedupQuestions = async () => {
    const { data: lqs } = await db
      .from("landing_questions")
      .select("id, content, created_at")
      .order("created_at", { ascending: true });
    const seen = new Map<string, boolean>();
    const toDelete: string[] = [];
    for (const q of (lqs ?? [])) {
      const key = q.content?.trim();
      if (!key) continue;
      if (seen.has(key)) toDelete.push(q.id);
      else seen.set(key, true);
    }
    if (toDelete.length > 0) {
      for (const id of toDelete) {
        await db.from("landing_question_answers").delete().eq("question_id", id);
        await db.from("landing_question_reactions").delete().eq("question_id", id);
      }
      await db.from("landing_questions").delete().in("id", toDelete);
    }
    return toDelete.length;
  };

  if (body.action === "dedup_answers") {
    const n = await dedupAnswers();
    return NextResponse.json({ ok: true, deleted: n });
  }
  if (body.action === "dedup_questions") {
    const n = await dedupQuestions();
    return NextResponse.json({ ok: true, deleted: n });
  }

  // action 없으면 둘 다 실행
  const [answersDeleted, questionsDeleted] = await Promise.all([dedupAnswers(), dedupQuestions()]);
  return NextResponse.json({
    ok: true,
    message: `중복 답변 ${answersDeleted}개, 중복 질문 ${questionsDeleted}개 정리됐습니다.`,
    answersDeleted,
    questionsDeleted,
  });
}

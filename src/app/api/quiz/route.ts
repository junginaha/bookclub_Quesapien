import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BookMBTI } from "@/lib/supabase/types";

const SCORE_MAP: Record<string, BookMBTI> = {
  "1A": "POET", "1B": "SAGE", "1C": "SEEKER", "1D": "BRIDGE",
  "2A": "POET", "2B": "SAGE", "2C": "SEEKER", "2D": "BRIDGE",
  "3A": "POET", "3B": "SAGE", "3C": "SEEKER", "3D": "BRIDGE",
  "4A": "POET", "4B": "SAGE", "4C": "SEEKER", "4D": "BRIDGE",
  "5A": "POET", "5B": "SAGE", "5C": "SEEKER", "5D": "BRIDGE",
};

const RECOMMENDATIONS: Record<BookMBTI, string[]> = {
  POET:   ["다정함의-발명", "오늘-저녁-당신께", "밤에만-편지를-씁니다", "어머니의-문장들"],
  SAGE:   ["혼자라는-감각", "인간이라는-풍경", "철학이-필요한-저녁", "흐린-날의-사유"],
  SEEKER: ["최신간-북토크", "아무것도-하지-않는-연습", "외국어로-읽는-한국-소설", "도시의-올랜-해"],
  BRIDGE: ["아무도-보지-않는-오후", "제자리로-돌아오는-밤에", "헤어진-이들의-재회", "이름-없는-감정들에게"],
};

function calculateMBTI(answers: Record<string, string>): BookMBTI {
  const counts: Record<BookMBTI, number> = { POET: 0, SAGE: 0, SEEKER: 0, BRIDGE: 0 };
  for (const [q, a] of Object.entries(answers)) {
    const type = SCORE_MAP[`${q}${a}`];
    if (type) counts[type]++;
  }
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as BookMBTI);
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { answers: Record<string, string>; session_key?: string };
  const { answers, session_key } = body;

  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json({ error: "답변이 없습니다." }, { status: 400 });
  }

  const mbti_type = calculateMBTI(answers);
  const recommended_slugs = RECOMMENDATIONS[mbti_type];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("quiz_results").insert({
      user_id: user?.id ?? null,
      session_key: session_key ?? null,
      mbti_type,
      answers,
      recommended_slugs,
    });
  } catch {
    // Supabase not configured — result still returned
  }

  return NextResponse.json({ mbti_type, recommended_slugs }, { status: 200 });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SELECT_COLUMNS = "id, giant_slug, giant_name, book_title, topic, statement, discussion_questions, icebreaker_questions, recommended_books, author_name, likes, created_at";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const giantSlug = searchParams.get("giant")?.trim() ?? "";
  const limit = Math.min(Number(searchParams.get("limit")) || 40, 100);

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    let query = sb
      .from("giant_discussions")
      .select(SELECT_COLUMNS)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (giantSlug) query = query.eq("giant_slug", giantSlug);
    if (q) {
      const escaped = q.replace(/[%_]/g, "\\$&");
      query = query.or(
        `book_title.ilike.%${escaped}%,topic.ilike.%${escaped}%,giant_name.ilike.%${escaped}%,statement.ilike.%${escaped}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ discussions: data ?? [] });
  } catch (err) {
    console.error("Discussions search error:", err);
    return NextResponse.json({ discussions: [] });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const giantSlug = typeof body.giant_slug === "string" ? body.giant_slug.trim() : "";
  const giantName = typeof body.giant_name === "string" ? body.giant_name.trim() : "";
  const statement = typeof body.statement === "string" ? body.statement.trim() : "";
  const discussionQuestions = Array.isArray(body.discussion_questions)
    ? body.discussion_questions.filter((q: unknown): q is string => typeof q === "string").slice(0, 10)
    : [];

  if (!giantSlug || !giantName || !statement || discussionQuestions.length === 0) {
    return NextResponse.json({ error: "필수 항목이 없습니다." }, { status: 400 });
  }

  const bookTitle = typeof body.book_title === "string" ? body.book_title.trim().slice(0, 200) || null : null;
  const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 200) || null : null;
  const icebreakerQuestions = Array.isArray(body.icebreaker_questions)
    ? body.icebreaker_questions.filter((q: unknown): q is string => typeof q === "string").slice(0, 10)
    : [];
  const recommendedBooks = Array.isArray(body.recommended_books)
    ? body.recommended_books
        .filter((b: unknown): b is Record<string, unknown> => !!b && typeof b === "object")
        .slice(0, 10)
        .map((b: Record<string, unknown>) => ({
          title: typeof b.title === "string" ? b.title.slice(0, 200) : "",
          author: typeof b.author === "string" ? b.author.slice(0, 100) : "",
          description: typeof b.description === "string" ? b.description.slice(0, 500) : "",
        }))
    : [];
  const authorName = (typeof body.author_name === "string" ? body.author_name.trim() : "").slice(0, 50) || "익명";
  const isPublic = body.is_public !== false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    const { data, error } = await sb
      .from("giant_discussions")
      .insert({
        giant_slug: giantSlug,
        giant_name: giantName,
        book_title: bookTitle,
        topic,
        statement: statement.slice(0, 2000),
        discussion_questions: discussionQuestions,
        icebreaker_questions: icebreakerQuestions,
        recommended_books: recommendedBooks,
        author_id: user?.id ?? null,
        author_name: authorName,
        is_public: isPublic,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data?.id, success: true });
  } catch (err) {
    console.error("Discussion save error:", err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}

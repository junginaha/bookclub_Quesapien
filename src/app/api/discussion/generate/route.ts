import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildDiscussion,
  DiscussionEngineError,
  type BookInput,
  type Depth,
  type Direction,
} from "@/lib/discussionEngine";

const DIRECTIONS: Direction[] = ["free", "life", "society", "philosophy"];
const DEPTHS: Depth[] = ["first", "general", "deep"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    mode?: "book" | "free";
    title?: string;
    author?: string;
    description?: string;
    input?: string;
    direction?: string;
    depth?: string;
  };

  const mode = body.mode === "free" ? "free" : "book";
  const direction: Direction = DIRECTIONS.includes(body.direction as Direction) ? (body.direction as Direction) : "free";
  const depth: Depth = DEPTHS.includes(body.depth as Depth) ? (body.depth as Depth) : "general";

  let bookInput: BookInput;
  if (mode === "free") {
    const input = typeof body.input === "string" ? body.input.trim().slice(0, 300) : "";
    if (!input) {
      return NextResponse.json({ error: "책 제목이나 문장을 입력해주세요.", code: "missing_input" }, { status: 400 });
    }
    bookInput = { title: input, author: "", direction, depth };
  } else {
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    const author = typeof body.author === "string" ? body.author.trim().slice(0, 60) : "";
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 800) : "";
    if (!title || !author) {
      return NextResponse.json({ error: "책 제목과 작가를 입력해주세요.", code: "missing_input" }, { status: 400 });
    }
    bookInput = { title, author, description, direction, depth };
  }

  try {
    const result = await buildDiscussion(bookInput);
    const discussionId = await saveDiscussion(bookInput, result);
    return NextResponse.json({ result, discussionId });
  } catch (err) {
    if (err instanceof DiscussionEngineError) {
      const status = err.code === "config_missing" ? 503 : err.code === "insufficient_description" ? 422 : 502;
      console.error(`Discussion generate error [${err.code}]:`, err.message);
      return NextResponse.json({ error: messageFor(err.code), code: err.code }, { status });
    }
    console.error("Discussion generate error [unknown]:", err);
    return NextResponse.json({ error: "발제를 만드는 중 문제가 생겼어요.", code: "api_error" }, { status: 502 });
  }
}

function messageFor(code: DiscussionEngineError["code"]): string {
  switch (code) {
    case "insufficient_description":
      return "이 책을 확실히 식별하지 못했어요. 책 설명을 조금 더 적어주시면 정확도가 올라가요.";
    case "config_missing":
      return "AI 발제 생성 기능이 아직 설정되지 않았어요. 운영자 확인이 필요합니다.";
    case "timeout":
      return "응답이 너무 오래 걸려서 멈췄어요. 다시 시도해주세요.";
    case "rate_limited":
      return "지금 요청이 몰려서 잠시 후 다시 시도해주세요.";
    case "invalid_json":
      return "발제 생성 결과를 해석하지 못했어요. 다시 시도해주세요.";
    case "network_error":
      return "네트워크 오류로 발제를 만들지 못했어요. 다시 시도해주세요.";
    default:
      return "발제를 만드는 중 문제가 생겼어요. 다시 시도해주세요.";
  }
}

async function saveDiscussion(input: BookInput, result: Awaited<ReturnType<typeof buildDiscussion>>): Promise<string | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data } = await sb
      .from("giant_discussions")
      .insert({
        giant_slug: result.giants.map((g) => g.slug).join(","),
        giant_name: result.giants.map((g) => g.name).join(", ") || "여러 사유자의 시선",
        book_title: result.analysis.confirmed_title || input.title,
        topic: input.author,
        statement: `발제 생성기 — 「${result.analysis.confirmed_title || input.title}」을 두고 나눌 열 가지 질문`,
        discussion_questions: result.questions.map((q) => q.question),
        source_messages: {
          analysis: result.analysis,
          giants: result.giants,
          opening_lines: result.opening_lines,
          tensions: result.tensions,
          questions: result.questions,
          facilitator_notes: result.facilitator_notes,
          settings: { direction: input.direction, depth: input.depth },
        },
        author_name: "익명",
        is_public: true,
      })
      .select("id")
      .single();
    return data?.id ?? null;
  } catch (err) {
    console.error("Discussion save error:", err);
    return null;
  }
}

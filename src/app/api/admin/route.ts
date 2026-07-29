import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "junginaha@gmail.com,kimjungin@quesapience.com").split(",");

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json() as {
    action: string;
    id: string;
    status?: string;
    current?: boolean;
    content?: string;
    contentType?: string;
    fields?: Record<string, string>;
  };
  const { action, id } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  switch (action) {

    // ── 관리자 전용 콘텐츠 수정 프레임 ──────────────────────────
    // "글" 종류가 늘어날 때마다 케이스를 새로 안 만들고 여기 한 줄만 추가하면
    // 된다. table/editable은 화이트리스트라 클라이언트가 임의 테이블·컬럼을
    // 넘겨도 여기 없는 조합은 절대 실행되지 않는다.
    case "update_content": {
      const EDITABLE_CONTENT: Record<string, { table: string; editable: string[] }> = {
        landing_question: { table: "landing_questions", editable: ["content"] },
        question: { table: "questions", editable: ["title", "description"] },
        review: { table: "reviews", editable: ["content"] },
        landing_answer: { table: "landing_question_answers", editable: ["content"] },
      };
      const config = body.contentType ? EDITABLE_CONTENT[body.contentType] : undefined;
      if (!config) return NextResponse.json({ error: "지원하지 않는 콘텐츠 종류입니다." }, { status: 400 });

      const fields = body.fields ?? {};
      const payload: Record<string, string> = {};
      for (const key of config.editable) {
        if (key in fields) {
          const value = fields[key]?.trim();
          if (!value) return NextResponse.json({ error: `${key}을(를) 입력해주세요.` }, { status: 400 });
          payload[key] = value;
        }
      }
      if (Object.keys(payload).length === 0) {
        return NextResponse.json({ error: "수정할 내용이 없습니다." }, { status: 400 });
      }

      const { error } = await db.from(config.table).update(payload).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // ── 사용자 ──────────────────────────────────────────────────
    case "delete_user": {
      const { error } = await db.from("profiles").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // ── 발제 질문 (questions 테이블) ────────────────────────────
    case "delete_question": {
      const { error } = await db.from("questions").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "toggle_featured": {
      const { error } = await db
        .from("questions")
        .update({ is_featured: !body.current })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // ── 모임 ────────────────────────────────────────────────────
    case "delete_session": {
      const { error } = await db.from("sessions").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "set_session_status": {
      const { error } = await db
        .from("sessions")
        .update({ status: body.status })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // ── 후기 ────────────────────────────────────────────────────
    case "delete_review": {
      const { error } = await db.from("reviews").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // ── 랜딩 질문 (landing_questions 테이블) ────────────────────
    case "approve_landing_question": {
      const { error } = await db
        .from("landing_questions")
        .update({ is_approved: true })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "reject_landing_question":
    case "delete_landing_question": {
      // 답변·반응도 함께 삭제
      await db.from("landing_question_answers").delete().eq("question_id", id);
      await db.from("landing_question_reactions").delete().eq("question_id", id);
      const { error } = await db.from("landing_questions").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "update_landing_question": {
      if (!body.content?.trim()) return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
      const { error } = await db
        .from("landing_questions")
        .update({ content: body.content.trim() })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "toggle_landing_featured": {
      const { error } = await db
        .from("landing_questions")
        .update({ is_featured: !body.current })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "toggle_landing_today": {
      if (!body.current) {
        // 기존 today 해제
        await db.from("landing_questions").update({ is_today: false }).eq("is_today", true);
      }
      const { error } = await db
        .from("landing_questions")
        .update({ is_today: !body.current })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "toggle_landing_approved": {
      const { error } = await db
        .from("landing_questions")
        .update({ is_approved: !body.current })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // ── 북클럽 신청 ─────────────────────────────────────────────
    case "confirm_application": {
      const { error } = await db
        .from("bookclub_applications")
        .update({ status: "confirmed" })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // ── 중복 정리 ──────────────────────────────────────────────
    case "dedup_answers": {
      // 같은 question_id + 같은 content의 답변 중복 제거 (최초 1개만 유지)
      const { data: answers } = await db
        .from("landing_question_answers")
        .select("id, question_id, content, created_at")
        .order("created_at", { ascending: true });

      const seen = new Map<string, string>(); // key → first id
      const toDelete: string[] = [];
      for (const a of (answers ?? [])) {
        const key = `${a.question_id}::${a.content?.trim()}`;
        if (seen.has(key)) {
          toDelete.push(a.id);
        } else {
          seen.set(key, a.id);
        }
      }
      if (toDelete.length > 0) {
        await db.from("landing_question_answers").delete().in("id", toDelete);
      }
      return NextResponse.json({ ok: true, deleted: toDelete.length });
    }

    case "dedup_questions": {
      // 같은 content의 landing_questions 중복 제거 (최초 1개만 유지)
      const { data: lqs } = await db
        .from("landing_questions")
        .select("id, content, created_at")
        .order("created_at", { ascending: true });

      const seen2 = new Map<string, string>();
      const toDelete2: string[] = [];
      for (const q of (lqs ?? [])) {
        const key = q.content?.trim();
        if (!key) continue;
        if (seen2.has(key)) {
          toDelete2.push(q.id);
        } else {
          seen2.set(key, q.id);
        }
      }
      if (toDelete2.length > 0) {
        for (const qid of toDelete2) {
          await db.from("landing_question_answers").delete().eq("question_id", qid);
          await db.from("landing_question_reactions").delete().eq("question_id", qid);
        }
        await db.from("landing_questions").delete().in("id", toDelete2);
      }
      return NextResponse.json({ ok: true, deleted: toDelete2.length });
    }

    default:
      return NextResponse.json({ error: "알 수 없는 액션입니다." }, { status: 400 });
  }
}

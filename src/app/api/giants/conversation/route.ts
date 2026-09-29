import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const MAX_MESSAGES_JSON_BYTES = 250_000;

function validConversationInput(
  giantSlug: unknown,
  sessionKey: unknown,
  messages: unknown,
): giantSlug is string {
  if (typeof giantSlug !== "string" || giantSlug.length < 1 || giantSlug.length > 120) return false;
  if (typeof sessionKey !== "string" || sessionKey.length < 6 || sessionKey.length > 160) return false;
  if (!Array.isArray(messages)) return false;

  try {
    return Buffer.byteLength(JSON.stringify(messages), "utf8") <= MAX_MESSAGES_JSON_BYTES;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const giantSlug = searchParams.get("slug");
  const sessionKey = searchParams.get("session");

  if (!giantSlug || !sessionKey) {
    return NextResponse.json({ conversation: null });
  }

  try {
    // Cookie-backed client is used only to identify the caller.
    // Database access itself is server-only so the table can remain closed to
    // anon/authenticated Data API roles.
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    const db = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (db as any)
      .from("giants_conversations")
      .select("id, messages, updated_at")
      .eq("giant_slug", giantSlug)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.is("user_id", null).eq("session_key", sessionKey);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error("Conversation load error:", error);
      return NextResponse.json({ conversation: null }, { status: 500 });
    }

    return NextResponse.json({ conversation: data ?? null });
  } catch (err) {
    console.error("Conversation load error:", err);
    return NextResponse.json({ conversation: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { giantSlug, giantName, sessionKey, messages, conversationId } = await req.json();

    if (!validConversationInput(giantSlug, sessionKey, messages)) {
      return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    const db = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = db as any;

    if (conversationId) {
      let updateQuery = sb
        .from("giants_conversations")
        .update({ messages, updated_at: new Date().toISOString() })
        .eq("id", conversationId)
        .eq("giant_slug", giantSlug);

      // Never authorize an update by conversation id alone.
      if (user) {
        updateQuery = updateQuery.eq("user_id", user.id);
      } else {
        updateQuery = updateQuery.is("user_id", null).eq("session_key", sessionKey);
      }

      const { data, error } = await updateQuery.select("id").maybeSingle();
      if (error) {
        console.error("Conversation update error:", error);
        return NextResponse.json({ error: "저장 실패" }, { status: 500 });
      }
      if (!data?.id) {
        return NextResponse.json({ error: "대화를 찾을 수 없음" }, { status: 404 });
      }

      return NextResponse.json({ id: data.id });
    }

    const { data, error } = await sb
      .from("giants_conversations")
      .insert({
        session_key: sessionKey,
        giant_slug: giantSlug,
        giant_name: typeof giantName === "string" && giantName.length <= 160 ? giantName : giantSlug,
        user_id: user?.id ?? null,
        messages,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Conversation insert error:", error);
      return NextResponse.json({ error: "저장 실패" }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (err) {
    console.error("Conversation save error:", err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }
}

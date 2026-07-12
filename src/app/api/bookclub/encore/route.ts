import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { hashContact } from "@/lib/bookclub-server";
import { DEFAULT_ENCORE_THRESHOLD, encoreCopy } from "@/lib/bookclub";

interface EncoreBody {
  clubSlug: string;
  contactMethod?: "email" | "phone";
  contactValue?: string;
  privacyConsent?: boolean;
  preferredArea?: string;
  preferredTime?: string;
  participationIntent?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveClub(db: any, clubSlug: string) {
  const { data } = await (db as any)
    .from("landing_book_clubs")
    .select("id, encore_threshold")
    .eq("slug", clubSlug)
    .maybeSingle();
  return data as { id: string; encore_threshold?: number } | null;
}

// 앵콜 요청 등록 — 로그인 사용자는 user_id로, 게스트는 연락처 해시로 중복을 막는다.
export async function POST(request: NextRequest) {
  let body: EncoreBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!body.clubSlug) {
    return NextResponse.json({ error: "clubSlug가 필요합니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const db = createServiceClient();

  const club = await resolveClub(db, body.clubSlug);
  if (!club) return NextResponse.json({ error: "북클럽을 찾을 수 없습니다." }, { status: 404 });

  let contactHash: string | null = null;
  if (!user) {
    if (!body.contactMethod || !body.contactValue?.trim()) {
      return NextResponse.json({ error: "연락처(이메일 또는 전화번호)를 입력해주세요." }, { status: 400 });
    }
    if (!body.privacyConsent) {
      return NextResponse.json({ error: "개인정보 수집에 동의해주세요." }, { status: 400 });
    }
    contactHash = hashContact(body.contactValue);
  }

  // 중복 확인 (활성 요청만)
  const dupQuery = (db as any)
    .from("landing_book_club_encore_requests")
    .select("id")
    .eq("club_id", club.id)
    .eq("status", "active");
  const { data: existing } = user
    ? await dupQuery.eq("user_id", user.id).maybeSingle()
    : await dupQuery.eq("contact_hash", contactHash).maybeSingle();

  if (!existing) {
    const { error: insertError } = await (db as any).from("landing_book_club_encore_requests").insert({
      club_id: club.id,
      user_id: user?.id ?? null,
      contact_method: user ? null : body.contactMethod,
      contact_hash: contactHash,
      privacy_consented_at: user ? null : new Date().toISOString(),
      preferred_area: body.preferredArea ?? null,
      preferred_time: body.preferredTime ?? null,
      participation_intent: body.participationIntent ?? null,
    });
    if (insertError) {
      return NextResponse.json({ error: "앵콜 요청 저장에 실패했어요. 다시 시도해주세요." }, { status: 500 });
    }
  }

  const { count } = await (db as any)
    .from("landing_book_club_encore_requests")
    .select("id", { count: "exact", head: true })
    .eq("club_id", club.id)
    .eq("status", "active");

  const threshold = club.encore_threshold ?? DEFAULT_ENCORE_THRESHOLD;
  return NextResponse.json({
    status: "ok",
    alreadyRequested: !!existing,
    count: count ?? 0,
    threshold,
    message: existing
      ? "이미 앵콜 요청을 남기셨어요."
      : "앵콜 요청이 접수되었습니다.\n새 일정이 열리면 가장 먼저 알려드릴게요.",
    thresholdCopy: encoreCopy(count ?? 0, threshold),
  });
}

// 앵콜 요청 취소 — 로그인 사용자는 세션으로, 게스트는 연락처를 다시 입력해 본인 확인.
export async function DELETE(request: NextRequest) {
  let body: EncoreBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!body.clubSlug) {
    return NextResponse.json({ error: "clubSlug가 필요합니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const db = createServiceClient();

  const club = await resolveClub(db, body.clubSlug);
  if (!club) return NextResponse.json({ error: "북클럽을 찾을 수 없습니다." }, { status: 404 });

  if (!user && !body.contactValue?.trim()) {
    return NextResponse.json({ error: "취소하려면 신청 시 입력한 연락처가 필요합니다." }, { status: 400 });
  }

  const cancelQuery = (db as any)
    .from("landing_book_club_encore_requests")
    .update({ status: "canceled" })
    .eq("club_id", club.id)
    .eq("status", "active");

  const { error } = user
    ? await cancelQuery.eq("user_id", user.id)
    : await cancelQuery.eq("contact_hash", hashContact(body.contactValue!));

  if (error) return NextResponse.json({ error: "취소에 실패했어요." }, { status: 500 });
  return NextResponse.json({ status: "ok" });
}

// 로그인 사용자 본인의 신청 여부 확인 (게스트는 클라이언트 localStorage로 낙관적 처리)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clubSlug = searchParams.get("clubSlug");
  if (!clubSlug) return NextResponse.json({ error: "clubSlug가 필요합니다." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ requested: false });

  const { data: club } = await supabase.from("landing_book_clubs").select("id").eq("slug", clubSlug).maybeSingle();
  if (!club) return NextResponse.json({ requested: false });

  const { data } = await supabase
    .from("landing_book_club_encore_requests")
    .select("id")
    .eq("club_id", (club as { id: string }).id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return NextResponse.json({ requested: !!data });
}

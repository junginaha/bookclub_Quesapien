import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { hashContact } from "@/lib/bookclub-server";
import { JOURNEY_SLUG, type InterestKind } from "@/lib/journey/hitchhiker";

// 독서여행 참여 의향/관심 표시 — 저장(POST), 공개 인원 집계(GET), 본인 상태 확인(POST action=status).
// 연락처 원문은 응답에 절대 포함하지 않는다.

type Channel = "email" | "sms" | "call";
const CHANNELS: Channel[] = ["email", "sms", "call"];
const KINDS: InterestKind[] = ["journey", "quiet"];
const JOURNEYS = new Set([JOURNEY_SLUG]);
const TABLE = "reading_journey_interests";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^01[016789]\d{7,8}$/;

function normalize(raw: string): { channelHint: "email" | "phone"; value: string } | null {
  const v = raw.trim();
  if (v.includes("@")) return EMAIL_RE.test(v) && v.length <= 254 ? { channelHint: "email", value: v.toLowerCase() } : null;
  const digits = v.replace(/\D/g, "");
  return PHONE_RE.test(digits) ? { channelHint: "phone", value: digits } : null;
}

const STATUS_LABEL: Record<string, string> = {
  interested: "참여 의향 접수",
  applied: "정식 신청 접수",
  confirmed: "참가 확정",
};

export async function GET(request: NextRequest) {
  const journey = new URL(request.url).searchParams.get("journey") ?? JOURNEY_SLUG;
  if (!JOURNEYS.has(journey)) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const db = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data, error } = await db.from("reading_journey_interest_counts").select("kind, interest_count").eq("journey_slug", journey);
    if (error) throw error;
    const counts: Record<InterestKind, number> = { journey: 0, quiet: 0 };
    for (const row of (data ?? []) as Array<{ kind: InterestKind; interest_count: number }>) counts[row.kind] = row.interest_count;
    return NextResponse.json({ counts }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // 집계 불가 시 null — 화면은 숫자를 숨긴다(임의 숫자 금지).
    return NextResponse.json({ counts: null }, { status: 503 });
  }
}

interface Body {
  action?: "register" | "status";
  journey?: string;
  kind?: InterestKind;
  notifyChannel?: Channel;
  contactValue?: string;
  name?: string;
  privacyConsent?: boolean;
  website?: string; // 허니팟
}

export async function POST(request: NextRequest) {
  let body: Body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 }); }

  const journey = body.journey ?? JOURNEY_SLUG;
  if (!JOURNEYS.has(journey)) return NextResponse.json({ error: "독서여행을 찾을 수 없습니다." }, { status: 404 });
  const contact = normalize(body.contactValue ?? "");
  if (!contact) return NextResponse.json({ error: "이메일 또는 휴대전화 번호를 확인해 주세요." }, { status: 400 });
  const contactHash = hashContact(contact.value);
  const db = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // ── 신청 상태 확인 ──────────────────────────────
  if (body.action === "status") {
    try {
      const { data, error } = await db.from(TABLE).select("kind, status, created_at")
        .eq("journey_slug", journey).eq("contact_hash", contactHash).neq("status", "canceled");
      if (error) throw error;
      const rows = (data ?? []) as Array<{ kind: InterestKind; status: string; created_at: string }>;
      return NextResponse.json({
        found: rows.length > 0,
        items: rows.map((r) => ({ kind: r.kind, status: r.status, label: STATUS_LABEL[r.status] ?? r.status, createdAt: r.created_at })),
      }, { headers: { "Cache-Control": "no-store" } });
    } catch {
      return NextResponse.json({ error: "지금은 확인할 수 없어요. 잠시 후 다시 시도해 주세요." }, { status: 503 });
    }
  }

  // ── 의향/관심 등록 ──────────────────────────────
  if (body.website) return NextResponse.json({ status: "ok", alreadyRegistered: false }); // 봇
  const kind = body.kind && KINDS.includes(body.kind) ? body.kind : null;
  if (!kind) return NextResponse.json({ error: "참여 종류를 선택해 주세요." }, { status: 400 });
  const channel = body.notifyChannel && CHANNELS.includes(body.notifyChannel) ? body.notifyChannel : null;
  if (!channel) return NextResponse.json({ error: "연락 받을 방법을 선택해 주세요." }, { status: 400 });
  if (channel === "email" && contact.channelHint !== "email") return NextResponse.json({ error: "이메일 주소를 입력해 주세요." }, { status: 400 });
  if (channel !== "email" && contact.channelHint !== "phone") return NextResponse.json({ error: "휴대전화 번호를 입력해 주세요." }, { status: 400 });
  if (body.privacyConsent !== true) return NextResponse.json({ error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const { data: existing } = await db.from(TABLE).select("id, status")
      .eq("journey_slug", journey).eq("kind", kind).eq("contact_hash", contactHash).neq("status", "canceled").maybeSingle();
    if (!existing) {
      const { error } = await db.from(TABLE).insert({
        journey_slug: journey,
        kind,
        user_id: user?.id ?? null,
        notify_channel: channel,
        contact_value: contact.value,
        contact_hash: contactHash,
        contact_name: typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 40) : null,
        privacy_consented_at: new Date().toISOString(),
      });
      if (error && error.code !== "23505") throw error;
    }
    const { count } = await db.from(TABLE).select("id", { count: "exact", head: true })
      .eq("journey_slug", journey).eq("kind", kind).neq("status", "canceled");
    return NextResponse.json({
      status: "ok",
      alreadyRegistered: !!existing,
      count: count ?? null,
      message: existing
        ? "이미 남겨주셨어요. 일정이 확정되면 선택하신 방법으로 안내드릴게요."
        : kind === "quiet"
        ? "관심 표시가 접수되었습니다.\n조용히 읽는 모임 일정이 정해지면 안내드릴게요."
        : "참여 의향이 접수되었습니다.\n일정·장소가 확정되면 선택하신 방법으로 안내드릴게요.",
    });
  } catch {
    return NextResponse.json({ error: "저장하지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}

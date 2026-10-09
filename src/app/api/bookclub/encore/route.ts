import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { hashContact } from "@/lib/bookclub-server";
import { ENCORE_THRESHOLD, encoreCopy, isPast } from "@/lib/bookclub/selectors";
import { getSession } from "@/lib/bookclub/data";
import { sendEncoreThresholdEmail } from "@/lib/email";
import { ADMIN_EMAILS } from "@/lib/admin";

// "다시 함께 읽어요" 앵콜 신청 — 세션 slug 기준(data.ts 단일 출처).
// 연락처 원문은 개인정보 동의 후에만 저장하고, 응답·클라이언트에는 절대 돌려주지 않는다.

type Channel = "email" | "sms" | "call";
const CHANNELS: Channel[] = ["email", "sms", "call"];
const TABLE = "landing_book_club_encore_requests";

interface EncoreBody {
  clubSlug?: string;
  notifyChannel?: Channel;
  contactMethod?: "email" | "phone"; // 구 클라이언트 호환
  contactValue?: string;
  name?: string;
  privacyConsent?: boolean;
  preferredArea?: string;
  preferredTime?: string;
  participationIntent?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^01[016789]\d{7,8}$/;

function normalizeContact(channel: Channel, raw: string): string | null {
  const value = raw.trim();
  if (channel === "email") return EMAIL_RE.test(value) && value.length <= 254 ? value.toLowerCase() : null;
  const digits = value.replace(/\D/g, "");
  return PHONE_RE.test(digits) ? digits : null;
}

function clip(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v ? v.slice(0, max) : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function activeCount(db: any, slug: string): Promise<number> {
  const { count } = await db.from(TABLE).select("id", { count: "exact", head: true }).eq("club_slug", slug).eq("status", "active");
  return count ?? 0;
}

/** 기준 인원에 처음 도달한 순간 운영자에게 한 번만 메일. 실패해도 신청 자체는 성공. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function maybeNotifyOperator(db: any, slug: string, count: number) {
  if (count < ENCORE_THRESHOLD) return;
  try {
    const { data: round } = await db.from("bookclub_encore_rounds").select("operator_notified_at").eq("club_slug", slug).maybeSingle();
    if (round?.operator_notified_at) return;
    const session = getSession(slug);
    const result = await sendEncoreThresholdEmail({
      to: ADMIN_EMAILS.filter(Boolean),
      bookTitle: session?.bookTitle ?? slug,
      slug,
      count,
      threshold: ENCORE_THRESHOLD,
    });
    if (result.success) {
      await db.from("bookclub_encore_rounds").upsert({ club_slug: slug, operator_notified_at: new Date().toISOString(), notified_count: count });
    }
  } catch {
    /* 알림 실패는 다음 신청 때 재시도된다 */
  }
}

export async function POST(request: NextRequest) {
  let body: EncoreBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const slug = typeof body.clubSlug === "string" ? body.clubSlug : "";
  const session = slug ? getSession(slug) : undefined;
  if (!session) return NextResponse.json({ error: "북클럽을 찾을 수 없습니다." }, { status: 404 });
  if (!isPast(session)) {
    return NextResponse.json({ error: "아직 진행 중인 모임입니다. 참여 신청을 이용해 주세요." }, { status: 409 });
  }

  const channel: Channel | undefined =
    body.notifyChannel && CHANNELS.includes(body.notifyChannel)
      ? body.notifyChannel
      : body.contactMethod === "email" ? "email" : body.contactMethod === "phone" ? "sms" : undefined;
  if (!channel) return NextResponse.json({ error: "연락 받을 방법을 선택해 주세요." }, { status: 400 });

  const contact = normalizeContact(channel, body.contactValue ?? "");
  if (!contact) {
    return NextResponse.json(
      { error: channel === "email" ? "이메일 주소를 확인해 주세요." : "휴대전화 번호를 확인해 주세요. (예: 010-1234-5678)" },
      { status: 400 }
    );
  }
  if (body.privacyConsent !== true) {
    return NextResponse.json({ error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const db = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const contactHash = hashContact(contact);

  try {
    const { data: existing } = await db
      .from(TABLE).select("id")
      .eq("club_slug", slug).eq("status", "active").eq("contact_hash", contactHash)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await db.from(TABLE).insert({
        club_slug: slug,
        user_id: user?.id ?? null,
        contact_method: channel === "email" ? "email" : "phone",
        notify_channel: channel,
        contact_value: contact,
        contact_hash: contactHash,
        contact_name: clip(body.name, 40),
        privacy_consented_at: new Date().toISOString(),
        preferred_area: clip(body.preferredArea, 40),
        preferred_time: clip(body.preferredTime, 40),
        participation_intent: clip(body.participationIntent, 60),
      });
      if (insertError) {
        // 동시 요청으로 유니크 인덱스에 걸린 경우는 '이미 신청'으로 취급.
        if (insertError.code !== "23505") throw insertError;
      }
    }

    const count = await activeCount(db, slug);
    if (!existing) await maybeNotifyOperator(db, slug, count);

    return NextResponse.json({
      status: "ok",
      alreadyRequested: !!existing,
      count,
      threshold: ENCORE_THRESHOLD,
      message: existing
        ? "이미 함께 읽기 신청을 남기셨어요."
        : `신청이 접수되었습니다.\n${ENCORE_THRESHOLD}명이 모이면 선택하신 방법으로 연락드릴게요.`,
      thresholdCopy: encoreCopy(count, ENCORE_THRESHOLD),
    });
  } catch {
    return NextResponse.json({ error: "신청을 저장하지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}

// 신청 취소 — 신청 시 입력한 연락처로 본인 확인.
export async function DELETE(request: NextRequest) {
  let body: EncoreBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const slug = typeof body.clubSlug === "string" ? body.clubSlug : "";
  if (!slug || !getSession(slug)) return NextResponse.json({ error: "북클럽을 찾을 수 없습니다." }, { status: 404 });
  const raw = body.contactValue?.trim();
  if (!raw) return NextResponse.json({ error: "취소하려면 신청 시 입력한 연락처가 필요합니다." }, { status: 400 });
  const contact = normalizeContact(raw.includes("@") ? "email" : "sms", raw);
  if (!contact) return NextResponse.json({ error: "연락처를 확인해 주세요." }, { status: 400 });

  const db = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error } = await db.from(TABLE).update({ status: "canceled" })
    .eq("club_slug", slug).eq("status", "active").eq("contact_hash", hashContact(contact));
  if (error) return NextResponse.json({ error: "취소에 실패했어요." }, { status: 500 });
  return NextResponse.json({ status: "ok", count: await activeCount(db, slug) });
}

// 공개 집계 — ?slugs=a,b,c → { counts: { a: 3, ... }, threshold } (개수만, 개인정보 없음)
export async function GET(request: NextRequest) {
  const slugs = (new URL(request.url).searchParams.get("slugs") ?? "")
    .split(",").map((s) => s.trim()).filter((s) => s && getSession(s)).slice(0, 50);
  if (!slugs.length) return NextResponse.json({ counts: {}, threshold: ENCORE_THRESHOLD });
  try {
    const db = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { data, error } = await db.from("bookclub_encore_counts").select("club_slug, encore_count").in("club_slug", slugs);
    if (error) throw error;
    const counts: Record<string, number> = Object.fromEntries(slugs.map((s) => [s, 0]));
    for (const row of (data ?? []) as Array<{ club_slug: string; encore_count: number }>) counts[row.club_slug] = row.encore_count;
    return NextResponse.json({ counts, threshold: ENCORE_THRESHOLD }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ counts: null, threshold: ENCORE_THRESHOLD }, { status: 503 });
  }
}

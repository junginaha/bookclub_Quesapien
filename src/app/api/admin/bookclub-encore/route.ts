import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/bookclub/data";
import { ENCORE_THRESHOLD } from "@/lib/bookclub/selectors";

// 다시 함께 읽어요 신청자 목록 — 운영자 전용.
// 연락처 원문을 내보내므로 저장소에 하드코딩된 기본 키로는 열리지 않는다:
// 환경변수 ADMIN_KEY가 실제로 설정돼 있어야만 응답한다.
function checkKey(req: NextRequest): boolean {
  const key = process.env.ADMIN_KEY;
  if (!key || key.length < 12) return false;
  return req.headers.get("x-admin-key") === key;
}

interface EncoreRow {
  id: string;
  club_slug: string | null;
  status: string;
  notify_channel: string | null;
  contact_name: string | null;
  contact_value: string | null;
  preferred_area: string | null;
  preferred_time: string | null;
  participation_intent: string | null;
  created_at: string;
}

const CHANNEL_LABEL: Record<string, string> = { email: "이메일", sms: "문자", call: "전화" };

function toCsv(rows: EncoreRow[]): string {
  const header = "slug,book,status,channel,name,contact,preferred_area,preferred_time,intent,created_at";
  const lines = rows.map((r) =>
    [
      r.club_slug ?? "", getSession(r.club_slug ?? "")?.bookTitle ?? "", r.status,
      CHANNEL_LABEL[r.notify_channel ?? ""] ?? "", r.contact_name ?? "", r.contact_value ?? "",
      r.preferred_area ?? "", r.preferred_time ?? "", r.participation_intent ?? "", r.created_at,
    ]
      // CSV 수식 주입 방지: = + - @ 로 시작하면 작은따옴표 접두.
      .map((v) => `"${String(v).replace(/^([=+\-@])/, "'$1").replace(/"/g, '""')}"`)
      .join(",")
  );
  return "﻿" + [header, ...lines].join("\n");
}

export async function GET(request: NextRequest) {
  if (!checkKey(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const format = searchParams.get("format");

  try {
    const db = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    let query = db
      .from("landing_book_club_encore_requests")
      .select("id, club_slug, status, notify_channel, contact_name, contact_value, preferred_area, preferred_time, participation_intent, created_at")
      .not("club_slug", "is", null)
      .order("created_at", { ascending: false });
    if (slug) query = query.eq("club_slug", slug);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as EncoreRow[];

    if (format === "csv") {
      return new NextResponse(toCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="encore-requests${slug ? `-${slug}` : ""}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const bySlug: Record<string, { book: string; active: number; ready: boolean }> = {};
    for (const r of rows) {
      if (r.status !== "active" || !r.club_slug) continue;
      const entry = (bySlug[r.club_slug] ??= { book: getSession(r.club_slug)?.bookTitle ?? r.club_slug, active: 0, ready: false });
      entry.active += 1;
      entry.ready = entry.active >= ENCORE_THRESHOLD;
    }

    return NextResponse.json(
      { threshold: ENCORE_THRESHOLD, bySlug, requests: rows },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "023 마이그레이션 적용 여부를 확인해 주세요.", requests: [] }, { status: 503 });
  }
}

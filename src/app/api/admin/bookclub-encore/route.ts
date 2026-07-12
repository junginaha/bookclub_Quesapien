import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "quesapience2024";

function checkKey(req: NextRequest) {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

interface EncoreRow {
  id: string;
  club_id: string;
  status: string;
  preferred_area: string | null;
  preferred_time: string | null;
  participation_intent: string | null;
  created_at: string;
}

function toCsv(rows: EncoreRow[]): string {
  const header = "id,club_id,status,preferred_area,preferred_time,participation_intent,created_at";
  const lines = rows.map((r) =>
    [r.id, r.club_id, r.status, r.preferred_area ?? "", r.preferred_time ?? "", r.participation_intent ?? "", r.created_at]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...lines].join("\n");
}

// 앵콜 요청 목록·통계·CSV 내보내기 — 운영자 전용. 연락처 원문/해시는 응답에 포함하지 않는다.
export async function GET(request: NextRequest) {
  if (!checkKey(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const format = searchParams.get("format");

  try {
    const db = createServiceClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    let clubId: string | undefined;
    if (slug) {
      const { data: club } = await db.from("landing_book_clubs").select("id").eq("slug", slug).maybeSingle();
      if (!club) return NextResponse.json({ error: "북클럽을 찾을 수 없습니다." }, { status: 404 });
      clubId = club.id;
    }

    let query = db
      .from("landing_book_club_encore_requests")
      .select("id, club_id, status, preferred_area, preferred_time, participation_intent, created_at")
      .order("created_at", { ascending: false });
    if (clubId) query = query.eq("club_id", clubId);

    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as EncoreRow[];

    if (format === "csv") {
      return new NextResponse(toCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="encore-requests${slug ? `-${slug}` : ""}.csv"`,
        },
      });
    }

    const areaStats: Record<string, number> = {};
    const timeStats: Record<string, number> = {};
    for (const r of rows) {
      if (r.status !== "active") continue;
      if (r.preferred_area) areaStats[r.preferred_area] = (areaStats[r.preferred_area] ?? 0) + 1;
      if (r.preferred_time) timeStats[r.preferred_time] = (timeStats[r.preferred_time] ?? 0) + 1;
    }

    return NextResponse.json({
      requests: rows,
      activeCount: rows.filter((r) => r.status === "active").length,
      areaStats,
      timeStats,
    });
  } catch {
    // 011 마이그레이션 미적용 상태(테이블 없음) 등 — 빈 결과로 응답
    return NextResponse.json({ requests: [], activeCount: 0, areaStats: {}, timeStats: {} });
  }
}

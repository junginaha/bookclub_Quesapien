import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// §C3 M1 — 내 근처 북클럽. 위경도가 있으면 ST_DWithin(기본 5km), 없으면(위치 거부)
// 지역명 텍스트 검색으로 폴백한다. 서버 컴포넌트/라우트에서만 호출(§C4).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const q = searchParams.get("q"); // 지역명 검색 폴백
  const radiusKm = Number(searchParams.get("radius_km") ?? "5");

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  if (lat && lng) {
    const { data, error } = await db.rpc("clubs_within", {
      p_lat: Number(lat),
      p_lng: Number(lng),
      p_radius_m: radiusKm * 1000,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ clubs: data ?? [] });
  }

  let query = db.from("clubs").select("*").order("created_at", { ascending: false });
  if (q?.trim()) {
    query = query.ilike("location_name", `%${q.trim()}%`);
  }
  const { data, error } = await query.limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clubs: data ?? [] });
}

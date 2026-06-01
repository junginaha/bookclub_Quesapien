import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("radius") ?? "10");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat/lng 필요" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    // PostGIS RPC 함수 호출
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("nearby_book_clubs", {
      user_lat: lat,
      user_lng: lng,
      radius_km: radius,
    });

    if (error) throw error;
    return NextResponse.json({ clubs: data ?? [] });
  } catch (err) {
    console.error("Nearby clubs error:", err);
    return NextResponse.json({ clubs: [] });
  }
}

import { createClient } from "@/lib/supabase/server";

/** 현재 요청의 로그인 사용자(쿠키 세션) — 예약 시트 프리필용. 미로그인·연결 실패 시 null. */
export interface Viewer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export async function getViewer(): Promise<Viewer | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) return null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("name, nickname, phone")
      .eq("id", user.id)
      .maybeSingle();
    const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
    return {
      id: user.id,
      name: profile?.nickname || profile?.name || meta.nickname || meta.name || meta.full_name || user.email?.split("@")[0] || "",
      phone: profile?.phone ?? "",
      email: user.email ?? "",
    };
  } catch {
    return null;
  }
}

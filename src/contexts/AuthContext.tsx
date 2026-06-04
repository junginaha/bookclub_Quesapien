"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";

const AuthContext = createContext({});
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const setSupabaseUser = useAppStore((s) => s.setSupabaseUser);

  useEffect(() => {
    const supabase = createClient();

    async function syncUser(userId: string, email: string, meta: Record<string, string>) {
      // profiles 테이블에서 전체 프로필 조회
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("name, avatar_url, bio, joined_at, session_count")
        .eq("id", userId)
        .single();

      setSupabaseUser({
        id: userId,
        email,
        name: profile?.name ?? meta?.name ?? email.split("@")[0],
        avatar_url: profile?.avatar_url ?? undefined,
        bio: profile?.bio ?? undefined,
        joined_at: profile?.joined_at ?? new Date().toISOString(),
        session_count: profile?.session_count ?? 0,
      });
    }

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUser(session.user.id, session.user.email ?? "", session.user.user_metadata ?? {});
      }
    });

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        await syncUser(session.user.id, session.user.email ?? "", session.user.user_metadata ?? {});
      } else if (event === "SIGNED_OUT") {
        setSupabaseUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSupabaseUser]);

  return <>{children}</>;
}

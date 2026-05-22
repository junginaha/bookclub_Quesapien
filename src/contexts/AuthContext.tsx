"use client";

// AuthContext는 useAppStore로 대체됨
// 하위 호환을 위해 useAuth hook은 스토어를 래핑
import { createContext, useContext, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";

interface AuthContextValue {
  user: { id: string; name: string; email: string; avatar_url?: string } | null;
  profile: { name: string; avatar_url?: string | null; session_count: number } | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, profile: null, loading: false, refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth(): AuthContextValue {
  const currentUser = useAppStore((s) => s.currentUser);
  return {
    user: currentUser,
    profile: currentUser,
    loading: false,
    refresh: async () => {},
  };
}

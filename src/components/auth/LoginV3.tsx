"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSession } from "@/lib/bookclub/data";
import { formatMonthDay, formatWeekdayFull } from "@/lib/bookclub/selectors";
import LoginForm from "./LoginForm";
import "@/components/home/v3/home-v3.css";
import "./login-v3.css";

/**
 * 로그인 v3 (MASTER_v3.md §7) — 카카오·구글 두 버튼.
 * 안내 문구는 실제 동의 화면과 같아야 한다 — 카카오 동의 화면은 닉네임이 필수,
 * 프로필 사진·이메일이 선택으로 뜬다(2026-10-29 비즈 앱 전환 후 확인).
 * next 경로가 북클럽이면 어디로 돌아가는지 보여준다. 이메일 로그인은 접어둔다(기존 회원용).
 */
export default function LoginV3() {
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/";
  const next = rawNext.startsWith("/") ? rawNext : "/";
  const callbackError = params.get("error");
  const reason = params.get("reason");
  const [busy, setBusy] = useState<"kakao" | "google" | null>(null);
  const [error, setError] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  const slug = next.match(/^\/bookclub\/([^/?#]+)/)?.[1];
  const target = slug ? getSession(decodeURIComponent(slug)) : null;

  async function oauth(provider: "kakao" | "google") {
    setBusy(provider);
    setError("");
    const supabase = createClient();
    // 돌아갈 곳은 쿠키로(10분). redirectTo는 허용 목록과 정확히 일치하는 /auth/callback 그대로.
    document.cookie = `qs_next=${encodeURIComponent(next)}; path=/; max-age=600; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (e) {
      setError(`로그인에 실패했어요. 다시 시도해 주세요. (${e.message})`);
      setBusy(null);
    }
  }

  return (
    <div className="qv3 qv3-login">
      <div className="qv3-login-top">
        <Link href={next === "/" ? "/" : next.split("?")[0]} aria-label="닫기" className="qv3-icon-btn">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </Link>
      </div>

      <div className="qv3-login-body">
        <div className="qv3-login-head">
          <span className="qv3-login-brand">질문하는 사람들</span>
          <h1>{target ? <>예약하려면<br />이름만 있으면 돼요.</> : <>이름만 있으면<br />시작할 수 있어요.</>}</h1>
          <p>카카오·구글 계정에서 이름을 받아옵니다.<br />프로필 사진과 이메일은 선택이며, 동의하지 않아도 로그인됩니다.</p>
        </div>

        {target && (
          <div className="qv3-login-return">
            <span className="qv3-login-return-label">로그인하면 돌아갈 곳</span>
            <b>{formatMonthDay(target.startsAt)} {formatWeekdayFull(target.startsAt)} · {target.bookTitle}</b>
            <span>{target.leadQuestion || target.title}</span>
          </div>
        )}

        {(callbackError || error) && (
          <p className="qv3-error" role="alert">{error || "로그인이 완료되지 않았어요. 다시 시도해 주세요."}{!error && reason ? <><br /><small>사유: {reason}</small></> : null}</p>
        )}
      </div>

      <div className="qv3-login-actions">
        <button type="button" className="qv3-login-kakao" disabled={busy != null} onClick={() => oauth("kakao")}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.7 1.8 5.1 4.5 6.5l-1 3.8c-.1.3.3.6.6.4l4.4-2.9c.5.1 1 .1 1.5.1 5.5 0 10-3.5 10-7.9S17.5 3 12 3z" /></svg>
          {busy === "kakao" ? "연결 중…" : "카카오로 계속하기"}
        </button>
        <button type="button" className="qv3-login-google" disabled={busy != null} onClick={() => oauth("google")}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          {busy === "google" ? "연결 중…" : "Google로 계속하기"}
        </button>
        <p className="qv3-login-terms">계속하면 <a href="/terms" target="_blank" rel="noreferrer">이용약관</a>과 <a href="/privacy" target="_blank" rel="noreferrer">개인정보 처리방침</a>에 동의하는 거예요.</p>
        <button type="button" className="qv3-login-email-toggle" onClick={() => setShowEmail((v) => !v)} aria-expanded={showEmail}>
          {showEmail ? "접기" : "이메일로 가입한 분이세요?"}
        </button>
        {showEmail && <div className="qv3-login-email"><LoginForm /></div>}
      </div>
    </div>
  );
}

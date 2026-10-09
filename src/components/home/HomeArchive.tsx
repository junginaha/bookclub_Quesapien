"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BookClubSession } from "@/lib/bookclub/types";
import { formatMonthDay } from "@/lib/bookclub/selectors";
import styles from "./home-tools.module.css";
import rt from "./read-together.module.css";

/** 유튜브 URL만 허용(youtube.com / youtu.be) — 다른 도메인 링크는 노출하지 않는다. */
function safeYoutube(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)(youtube\.com|youtu\.be)$/.test(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

export default function HomeArchive({ sessions = [] }: { sessions?: BookClubSession[] }) {
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const sending = useRef(false);

  // 북클럽별 유튜브 영상 — data.ts의 youtubeUrl이 채워진 모임만, 최신순.
  const videos = sessions
    .map((s) => ({ s, url: safeYoutube(s.youtubeUrl) }))
    .filter((v): v is { s: BookClubSession; url: string } => !!v.url)
    .sort((a, b) => Date.parse(b.s.startsAt) - Date.parse(a.s.startsAt));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() || sending.current) return;
    sending.current = true; setBusy(true); setMessage(""); setSaved(false);
    try {
      if (!isPublic) {
        const { data, error } = await createClient().auth.getUser();
        if (error || !data.user) throw new Error("나만 보기 기록은 로그인 후 저장할 수 있습니다.");
      }
      const response = await fetch("/api/archive/review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", content: content.trim(), author_name: name.trim() || "익명", photo_url: null, video_url: null, is_public: isPublic }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || "저장하지 못했습니다. 다시 시도해 주세요.");
      setSaved(true); setMessage("기록을 저장했습니다."); setContent("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다."); }
    finally { sending.current = false; setBusy(false); }
  }

  return <section className={styles.section} id="testify" aria-labelledby="archive-title">
    <div className={styles.sectionHead}><h2 id="archive-title">아카이빙</h2><Link className={styles.secondary} href="/archive">기록 보기</Link></div>

    {/* 1 · 텍스트 기록 — 한 줄 소감부터 긴 기록까지, 글만 심플하게 */}
    <details className={styles.disclosure}>
      <summary>글로 기록 남기기</summary>
      <form className={styles.form} onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>내용<textarea value={content} onChange={event => setContent(event.target.value)} required maxLength={4000} rows={4} placeholder="오늘 모임에서 남은 질문 하나, 마음에 걸린 문장 하나" /></label>
          <div className={styles.formRow}>
            <label>이름<input value={name} onChange={event => setName(event.target.value)} maxLength={50} placeholder="미입력 시 익명" autoComplete="nickname" /></label>
            <label>공개 범위<select value={String(isPublic)} onChange={event => setIsPublic(event.target.value === "true")}><option value="true">공개</option><option value="false">나만 보기 · 로그인 필요</option></select></label>
          </div>
          <div className={styles.actions}><button className={styles.primary} type="submit" disabled={busy || !content.trim()}>{busy ? "저장 중…" : "기록 저장"}</button></div>
        </fieldset>
        {message && <p role={saved ? "status" : "alert"} className={styles.notice}>{message} {saved && <Link href={isPublic ? "/archive" : "/archive?mine=true"}>저장된 기록 보기</Link>}</p>}
      </form>
    </details>

    {/* 2 · 영상 기록 — 북클럽별 유튜브 링크. 대화는 영상 댓글에서 이어간다. */}
    <div className={rt.block} aria-labelledby="archive-video-title" style={{ marginTop: 32 }}>
      <div className={rt.blockHead}><h3 id="archive-video-title">영상으로 이어가는 이야기</h3></div>
      <p className={rt.blockLead}>모임이 끝난 뒤 북클럽별 영상을 올립니다. 못다 한 질문과 감상은 영상 댓글로 이어가 주세요.</p>
      {videos.length ? (
        <ul className={rt.videoList}>
          {videos.map(({ s, url }) => (
            <li key={s.slug}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <strong>{s.bookTitle}</strong>
                <span>{formatMonthDay(s.startsAt)} 모임 · 영상 보고 댓글 남기기 ↗</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.muted}>첫 북클럽 영상을 준비하고 있습니다.</p>
      )}
    </div>
  </section>;
}

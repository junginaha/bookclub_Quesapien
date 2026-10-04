"use client";
import { useState } from "react";
import { youtubeId } from "@/lib/youtube";
import styles from "./archive-video.module.css";

export default function ArchiveVideo({ url, title = "북클럽 영상 기록" }: { url: string; title?: string }) {
  const [loaded, setLoaded] = useState(false);
  const id = youtubeId(url);
  if (id) return <div className={styles.media}>
    {loaded ? <iframe title={title} src={`https://www.youtube-nocookie.com/embed/${id}`} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
      : <button type="button" className={styles.preview} onClick={() => setLoaded(true)} aria-label={`${title} YouTube 플레이어 열기`}><span className={styles.label}>YOUTUBE · 모임의 기록</span><span className={styles.play} aria-hidden="true">▶</span><span>함께 나눈 이야기를 영상으로</span><small>누르면 YouTube 플레이어가 연결됩니다</small></button>}
    <a className={styles.watch} href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">YouTube에서 보기 ↗</a>
  </div>;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    if (parsed.pathname.startsWith("/storage/v1/object/public/reviews/") && parsed.hostname.endsWith(".supabase.co")) return <video className={styles.native} src={url} controls preload="none" aria-label={title} />;
    if (["vimeo.com", "player.vimeo.com"].includes(parsed.hostname)) return <a className={styles.watch} href={url} target="_blank" rel="noopener noreferrer">Vimeo에서 영상 보기 ↗</a>;
  } catch { /* Invalid historical links remain text-only. */ }
  return null;
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Copy, MapPin } from "lucide-react";
import type { BookClubVenue } from "@/lib/bookclub/types";
import styles from "./VenueCard.module.css";

/** Clipboard API 실패(권한 거부/비보안 컨텍스트 등) 시 textarea+execCommand 폴백. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** 모든 모임에서 공유하는 장소 안내. 지도는 공개 지도 링크로 연다. */
export default function VenueCard({ venue }: { venue: BookClubVenue }) {
  const headingId = useId();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  async function handleCopy() {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    const ok = await copyText(venue.address);
    setCopyState(ok ? "copied" : "failed");
    copyTimer.current = setTimeout(() => setCopyState("idle"), 3000);
  }

  const address = venue.address.trim();
  const hasCoordinates = Number.isFinite(venue.lat) && Number.isFinite(venue.lng)
    && Math.abs(venue.lat) <= 90 && Math.abs(venue.lng) <= 180;
  const kakaoUrl = hasCoordinates
    ? `https://map.kakao.com/link/to/${encodeURIComponent(venue.name)},${venue.lat},${venue.lng}`
    : `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
  const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(address)}`;

  return (
    <section id="venue" className={styles.card} aria-labelledby={headingId}>
      <div className={styles.header}>
        <span className={styles.eyebrow}><MapPin size={15} aria-hidden="true" /> 모임 장소</span>
        {address && <button type="button" className={styles.copy} onClick={handleCopy} aria-label="주소 복사">
          {copyState === "copied" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          <span>{copyState === "copied" ? "복사 완료" : "주소 복사"}</span>
        </button>}
      </div>
      <h2 id={headingId} className={styles.name}>{venue.name}</h2>
      {venue.detail && <p className={styles.detail}>{venue.detail}</p>}
      {address ? <p className={styles.address}>{address}</p> : !venue.detail && <p className={styles.address}>상세 장소는 추후 안내해 드려요.</p>}
      {venue.nearestStation && <p className={styles.station}>{venue.nearestStation}</p>}
      <div role="status" className={copyState === "failed" ? styles.feedback : "sr-only"}>
        {copyState === "copied" ? "주소를 복사했어요." : copyState === "failed" ? "주소를 길게 눌러 복사해 주세요." : ""}
      </div>
      {address && <details className={styles.mapDisclosure}>
        <summary className={styles.mapToggle}>지도 보기<ChevronDown size={15} aria-hidden="true" /></summary>
        <nav className={styles.directions} aria-label="지도와 길찾기">
        <a href={kakaoUrl} target="_blank" rel="noopener noreferrer" aria-label={hasCoordinates ? "카카오맵 길찾기 (새 창)" : "카카오맵에서 위치 보기 (새 창)"}>
          <span>카카오맵</span><ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <a href={naverUrl} target="_blank" rel="noopener noreferrer" aria-label="네이버지도에서 위치 보기 (새 창)">
          <span>네이버지도</span><ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </nav>
      </details>}
    </section>
  );
}

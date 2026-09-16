"use client";

import { useState } from "react";
import type { BookClubVenue } from "@/lib/bookclub/types";
import VenueMap from "./VenueMap";

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

/**
 * 장소 카드 — 지도(기존 Leaflet+CARTO, 신규 SDK 의존성 추가 없음) + 주소 복사 +
 * 길찾기 딥링크(카카오맵/네이버지도, API 키 불필요한 공개 웹 URL 스킴만 사용).
 */
export default function VenueCard({ venue }: { venue: BookClubVenue }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    const ok = await copyText(venue.address);
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  const kakaoUrl = `https://map.kakao.com/link/to/${encodeURIComponent(venue.name)},${venue.lat},${venue.lng}`;
  const naverUrl = `https://map.naver.com/p/search/${encodeURIComponent(venue.address)}`;

  return (
    <div className="qd-block">
      <div className="qd-block-label">장소</div>
      <div className="qd-block-main">
        {venue.name}{venue.detail ? ` · ${venue.detail}` : ""}
      </div>
      <div className="qd-block-sub">{venue.address}</div>
      {venue.nearestStation && <div className="qd-block-sub">{venue.nearestStation}</div>}

      <div className="qd-venue-actions">
        <button type="button" className="qd-venue-btn" onClick={handleCopy}>
          {copyState === "copied" ? "주소 복사됨" : copyState === "failed" ? "복사 실패 — 길게 눌러 복사해주세요" : "주소 복사"}
        </button>
        <a className="qd-venue-btn" href={kakaoUrl} target="_blank" rel="noreferrer">카카오맵 길찾기</a>
        <a className="qd-venue-btn" href={naverUrl} target="_blank" rel="noreferrer">네이버지도 길찾기</a>
      </div>

      <VenueMap lat={venue.lat} lng={venue.lng} label={venue.name} />
    </div>
  );
}

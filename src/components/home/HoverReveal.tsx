"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * sternberg-press.com 상호작용 원리(작업지시서 Phase 3) — 정보를 기본 숨김,
 * 마우스는 hover/focus로, 터치는 탭 토글로 그 자리에서 펼친다.
 *
 * 접근성: detail은 항상 DOM에 남아있다(display:none/aria-hidden 금지 — 화면
 * 낭독기는 hover 상태와 무관하게 항상 읽는다). 시각적으로만 max-height+opacity로
 * 접었다 편다.
 */
export default function HoverReveal({
  summary,
  detail,
  className = "",
}: {
  summary: ReactNode;
  detail: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDownOutside(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDownOutside);
    return () => document.removeEventListener("pointerdown", onPointerDownOutside);
  }, [open]);

  return (
    <div
      ref={ref}
      className={`lp-reveal-info${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      tabIndex={0}
      onPointerDown={(e) => {
        // 터치/펜에서만 탭 토글 — 마우스는 CSS :hover/:focus-within이 처리한다.
        if (e.pointerType === "touch" || e.pointerType === "pen") {
          e.stopPropagation();
          setOpen((v) => !v);
        }
      }}
    >
      <div className="lp-reveal-summary">{summary}</div>
      <div className="lp-reveal-detail">{detail}</div>
    </div>
  );
}

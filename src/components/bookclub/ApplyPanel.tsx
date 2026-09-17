"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * 신청 패널 — 데스크톱은 항상 보이는 sticky 인라인 패널, 모바일은 하단 고정
 * 트리거 + 바텀시트(작업지시서 Phase 2). 같은 children을 두 곳 다 렌더링해서
 * (CSS로만 노출 전환) 폼 상태가 미디어쿼리 경계에서 사라지지 않게 한다.
 * 바텀시트는 role=dialog + focus trap + Esc + 배경 스크롤 락 + 닫을 때 트리거로
 * 포커스 복귀(작업지시서 Phase 4 접근성 요건 겸용).
 */
export default function ApplyPanel({
  triggerLabel,
  variant = "primary",
  disabled = false,
  children,
}: {
  triggerLabel: string;
  /** 참여신청(주 CTA) vs 대기신청/마감(보조 CTA) — 하나의 Button 컴포넌트로 통일. */
  variant?: "primary" | "outline";
  disabled?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {/* 데스크톱(≥768px): 항상 보이는 sticky 패널 — CSS(.qd-apply-desktop)가 담당 */}
      <div className="qd-apply-desktop">{children}</div>

      {/* 모바일(<768px): 하단 고정 트리거 */}
      <div className="qd-apply-mobile-bar">
        <Button
          ref={triggerRef}
          type="button"
          variant={variant}
          className="w-full min-h-[48px] text-[15px]"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {triggerLabel}
        </Button>
      </div>

      {open && !disabled && (
        <div className="qd-sheet-overlay" onClick={close}>
          <div
            className="qd-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={triggerLabel}
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="qd-sheet-handle" aria-hidden="true" />
            <button type="button" className="qd-sheet-close" onClick={close} aria-label="닫기">✕</button>
            {children}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const SEEN_KEY = "qp-intro-seen";
const WORDMARKS = ["질문하는 사람들", "Quesapience"] as const;
const AUTO_ADVANCE_MS = 10000;

export default function IntroSplash({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [wordmarkIdx, setWordmarkIdx] = useState(0);
  const [wordmarkFading, setWordmarkFading] = useState(false);
  const dismissedRef = useRef(false);

  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setLeaving(true);
    setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      onEnter();
    }, 450);
  };

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) {
      setVisible(false);
      onEnter();
      return;
    }
    // 헤더와 동일한 워드마크 자동 전환(질문하는 사람들 ↔ Quesapience)
    const wordmarkInterval = setInterval(() => {
      setWordmarkFading(true);
      setTimeout(() => {
        setWordmarkIdx((i) => (i + 1) % WORDMARKS.length);
        setWordmarkFading(false);
      }, 350);
    }, 3200);
    // 10초 내 버튼 반응이 없으면 자동으로 메인 전환
    const autoAdvance = setTimeout(dismiss, AUTO_ADVANCE_MS);
    return () => {
      clearInterval(wordmarkInterval);
      clearTimeout(autoAdvance);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`lp-intro${leaving ? " lp-intro-leaving" : ""}`}
      role="dialog"
      aria-label="질문하는 사람들 인트로"
    >
      {/* 배경 떠다니는 점들 — 스플래시에 생동감을 주는 장식용 움직임 */}
      <div aria-hidden="true" className="lp-intro-float lp-intro-float-1" />
      <div aria-hidden="true" className="lp-intro-float lp-intro-float-2" />
      <div aria-hidden="true" className="lp-intro-float lp-intro-float-3" />
      <div aria-hidden="true" className="lp-intro-float lp-intro-float-4" />
      <div aria-hidden="true" className="lp-intro-float lp-intro-float-5" />

      {/* 헤더 로고와 동일한 ?/! 마크 + 워드마크 교차 애니메이션 (확대) */}
      <div className="lp-intro-mark">
        <span
          style={{
            color: "var(--accent)",
            fontFamily: '"EB Garamond", Georgia, serif',
            fontStyle: "normal",
            animation: "markBreathe 3.8s ease-in-out infinite",
            transformOrigin: "center",
          }}
        >
          ?
        </span>
        <span
          style={{
            color: "var(--ink)",
            fontFamily: '"EB Garamond", Georgia, serif',
            fontStyle: "normal",
            animation: "markBob 2.6s ease-in-out infinite",
            transformOrigin: "center",
          }}
        >
          !
        </span>
      </div>

      <span className="lp-intro-wordmark">
        {WORDMARKS.map((wm, i) => (
          <span
            key={wm}
            className={i === 1 ? "lp-intro-wordmark-en" : "lp-intro-wordmark-ko"}
            style={{
              gridArea: "1 / 1",
              opacity: wordmarkIdx === i && !wordmarkFading ? 1 : 0,
              transform: wordmarkIdx === i && !wordmarkFading
                ? "translateY(0)"
                : wordmarkIdx === i ? "translateY(-4px)" : "translateY(4px)",
            }}
          >
            {wm}
          </span>
        ))}
      </span>

      <p className="lp-intro-notice">괜찮은 북클럽 베타 테스트 중...</p>

      <a
        href="#"
        className="lp-hero-bookclub-btn"
        onClick={(e) => {
          e.preventDefault();
          dismiss();
        }}
      >
        <span>북클럽에 나가요</span>
      </a>
    </div>
  );
}

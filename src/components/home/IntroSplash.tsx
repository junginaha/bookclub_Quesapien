"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SEEN_KEY = "qp-intro-seen";
const WORDMARKS = ["질문하는 사람들", "Quesapience"] as const;
const AUTO_ADVANCE_MS = 10000;

export default function IntroSplash({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [pressed, setPressed] = useState(false);
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

  // 키캡을 실제로 누른 것처럼 눌림 애니메이션을 먼저 재생한 뒤 스킵
  const pressAndDismiss = () => {
    if (dismissedRef.current) return;
    setPressed(true);
    setTimeout(dismiss, 160);
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
      {/* 메인 비주얼 — 3D 백라이트 키캡, 실제로 눌리는 버튼 (클릭 시 눌림 애니메이션 후 스킵) */}
      <div className={`lp-intro-keycap-wrap${pressed ? " lp-intro-keycap-wrap-pressed" : ""}`}>
        <button
          type="button"
          className={`lp-intro-keycap-btn${pressed ? " is-pressed" : ""}`}
          onClick={pressAndDismiss}
          aria-label="북클럽 둘러보기 — 눌러서 시작하기"
        >
          <Image
            src="/intro/keycap-bookclub.png"
            alt="북클럽 둘러보기 키캡"
            width={964}
            height={1012}
            priority
          />
        </button>
      </div>

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

      {/* 나머지 — 안내문구 + 헤더와 동일한 ?/! 마크·워드마크, 하단에 작게 묶어서 배치 */}
      <div className="lp-intro-footer">
        <p className="lp-intro-notice">괜찮은 북클럽 베타 테스트 중...</p>

        <div className="lp-intro-logo">
          <span className="lp-intro-logo-mark">
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
          </span>
          <span className="lp-intro-logo-wordmark">
            {WORDMARKS.map((wm, i) => (
              <span
                key={wm}
                style={{
                  gridArea: "1 / 1",
                  whiteSpace: "nowrap",
                  fontFamily: i === 1
                    ? '"EB Garamond", Georgia, serif'
                    : "var(--font-noto-serif-kr), Georgia, serif",
                  fontSize: i === 1 ? 14.5 : 13.5,
                  fontWeight: i === 1 ? 400 : 500,
                  color: "var(--ink)",
                  letterSpacing: i === 1 ? "0.06em" : "0.03em",
                  fontStyle: i === 1 ? "italic" : "normal",
                  transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(.2,.8,.2,1)",
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
        </div>
      </div>
    </div>
  );
}

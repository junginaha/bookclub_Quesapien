"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// layout.tsx의 차단 스크립트, landing.css의 CSS와 반드시 같은 값을 써야 한다.
const SEEN_KEY = "qp-intro-seen";
const PENDING_ATTR = "data-intro";
const WORDMARKS = ["질문하는 사람들", "Quesapience"] as const;
const AUTO_ADVANCE_MS = 10000;

// 이 컴포넌트는 재방문자에게도 항상 마운트된다(LandingPage.tsx 참고) — 실제
// 노출 여부는 React 렌더 타이밍이 아니라 layout.tsx의 차단 스크립트가 첫
// 페인트 전에 세팅하는 html[data-intro="pending"] 속성 + landing.css의
// `html:not([data-intro="pending"]) .lp-intro { display: none }` 규칙이
// 결정한다. 하이드레이션 이후에 도달하는 아래 useEffect/dismiss()는 그
// 결정을 "확정"만 할 뿐이라 화면 번쩍임이 생기지 않는다 — React 상태로
// 초기 노출을 결정하면(구 로직) 첫 페인트와 useEffect 사이에 반드시 한
// 프레임의 시차가 생겨, 첫 방문자에게는 랜딩 화면이, 재방문자에게는
// 인트로가 잠깐 번쩍이는 문제가 있었다.

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
      // sessionStorage는 탭 단위라 새 탭·브라우저 재시작마다 다시 떴다 —
      // localStorage로 브라우저 단위(=한 번 보면 계속 안 봄)로 바꾼다.
      // 저장이 막힌 브라우저(사파리 강한 프라이버시 모드 등)에서도 진입 자체는
      // 막히면 안 되므로 에러는 무시한다.
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {}
      // 같은 세션에서 홈으로 다시 클라이언트 내비게이션했을 때(새로고침 없이)
      // 이번 로드 때 세팅된 pending 속성이 남아있으면 다시 떠 보이므로 제거한다.
      try {
        document.documentElement.removeAttribute(PENDING_ATTR);
      } catch {}
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
    let seen = false;
    try {
      seen = !!localStorage.getItem(SEEN_KEY);
    } catch {}
    if (seen) {
      try {
        document.documentElement.removeAttribute(PENDING_ATTR);
      } catch {}
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

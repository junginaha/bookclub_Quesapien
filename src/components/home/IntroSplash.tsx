"use client";

import { useEffect, useState } from "react";
import { QIMark } from "@/components/common/QIMark";

const SEEN_KEY = "qp-intro-seen";

export default function IntroSplash({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) {
      setVisible(false);
      onEnter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      onEnter();
    }, 450);
  };

  return (
    <div
      className={`lp-intro${leaving ? " lp-intro-leaving" : ""}`}
      role="dialog"
      aria-label="질문하는 사람들 인트로"
    >
      <div className="lp-intro-mark">
        <QIMark size="xl" />
      </div>
      <span className="eyebrow lp-intro-eyebrow">질문하는 사람들</span>
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

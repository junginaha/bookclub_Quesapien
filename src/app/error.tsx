"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body style={{ margin: 0, background: "#F4EFE5", fontFamily: "sans-serif" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 60, marginBottom: 20, opacity: 0.4 }}>!</div>

          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7B7268", marginBottom: 14 }}>
            오류가 발생했습니다
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 400, color: "#1C1F26", marginBottom: 10 }}>
            잠시 문제가 생겼어요.
          </h1>

          <p style={{ fontSize: 14, color: "#7B7268", lineHeight: 1.75, maxWidth: 360, marginBottom: 36 }}>
            일시적인 오류입니다. 다시 시도하거나<br />홈으로 돌아가 주세요.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "11px 22px", borderRadius: 9999,
                background: "#1C1F26", color: "#ECE3CF",
                border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
              }}
            >
              다시 시도
            </button>
            <Link
              href="/"
              style={{
                padding: "11px 22px", borderRadius: 9999,
                border: "1px solid #D9CFBC", color: "#2A2E37",
                textDecoration: "none", fontSize: 14,
              }}
            >
              홈으로
            </Link>
          </div>

          {error.digest && (
            <p style={{ fontSize: 11, color: "#A39A8C", marginTop: 24 }}>
              오류 코드: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}

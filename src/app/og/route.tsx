import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "질문하는 사람들";
  const sub = searchParams.get("sub") ?? "좋은 질문은 좋은 사람을 데려옵니다.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#1C1F26",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "60%",
            height: "60%",
            background: "radial-gradient(ellipse at top right, rgba(176,138,74,0.25), transparent 70%)",
          }}
        />
        {/* Mark */}
        <div
          style={{
            position: "absolute",
            top: 64,
            left: 80,
            fontSize: 56,
            color: "#B08A4A",
            fontStyle: "italic",
            fontFamily: "serif",
            letterSpacing: "-2px",
          }}
        >
          ?!
        </div>
        {/* Brand */}
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 148,
            fontSize: 18,
            color: "rgba(236,227,207,0.6)",
            fontFamily: "sans-serif",
            letterSpacing: "2px",
          }}
        >
          질문하는 사람들
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 30 ? 48 : 60,
            color: "rgba(236,227,207,0.95)",
            fontFamily: "serif",
            lineHeight: 1.25,
            marginBottom: 20,
            maxWidth: "85%",
          }}
        >
          {title}
        </div>
        {/* Sub */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(163,154,140,0.7)",
            fontFamily: "sans-serif",
            lineHeight: 1.5,
          }}
        >
          {sub}
        </div>
        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #B08A4A, #5E4632, transparent)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

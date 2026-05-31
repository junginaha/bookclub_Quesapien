import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#1C1F26",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          borderRadius: 100,
          position: "relative",
        }}
      >
        <div style={{
          position: "absolute",
          top: 48,
          right: 48,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(176,138,74,0.12)",
        }} />
        <div style={{
          fontSize: 200,
          color: "#B08A4A",
          fontStyle: "italic",
          fontFamily: "serif",
          lineHeight: 1,
          letterSpacing: -12,
        }}>
          ?!
        </div>
        <div style={{
          fontSize: 32,
          color: "rgba(236,227,207,0.35)",
          fontFamily: "sans-serif",
          letterSpacing: 6,
          marginTop: -16,
        }}>
          질문하는 사람들
        </div>
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          background: "linear-gradient(90deg, #B08A4A, #5E4632)",
          borderRadius: "0 0 100px 100px",
        }} />
      </div>
    ),
    { width: 512, height: 512 }
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "#2B1D14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          borderRadius: 40,
          position: "relative",
        }}
      >
        {/* Accent circle */}
        <div style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(198, 138, 30,0.15)",
        }} />
        {/* Mark */}
        <div style={{
          fontSize: 72,
          color: "#C68A1E",
          fontStyle: "italic",
          fontFamily: "serif",
          lineHeight: 1,
          letterSpacing: -4,
        }}>
          ?!
        </div>
        {/* Bottom bar */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 5,
          background: "linear-gradient(90deg, #C68A1E, #A4481C)",
          borderRadius: "0 0 40px 40px",
        }} />
      </div>
    ),
    { width: 192, height: 192 }
  );
}

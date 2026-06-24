import { ImageResponse } from "next/og";

export const alt = "Milktree — Your creative department. On demand.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          padding: "80px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#FFDC04",
            letterSpacing: "-0.02em",
          }}
        >
          milktree
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              maxWidth: 920,
            }}
          >
            Your creative department. On demand.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.6)",
              marginTop: 28,
            }}
          >
            Embedded brand &amp; design team — senior, on-brand, fast.
          </div>
        </div>
        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.5)" }}>
          200+ brands built · 5 years · Book a free brand audit
        </div>
      </div>
    ),
    { ...size },
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bug Reporter — Developer-ready bug reports in one click";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #090d16 0%, #0f172a 50%, #020617 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
            }}
          >
            🐛
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#f8fafc",
              letterSpacing: "-0.03em",
            }}
          >
            Bug Reporter
          </span>
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: "24px",
            maxWidth: "960px",
            letterSpacing: "-0.03em",
          }}
        >
          Turn &ldquo;It&apos;s broken&rdquo; into a ready-to-fix issue
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "820px",
            lineHeight: 1.4,
          }}
        >
          Lightweight browser SDK capturing WebP screenshots, console errors, network failures &amp; click breadcrumbs in under 20 KB.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

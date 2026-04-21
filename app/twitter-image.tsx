/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "que compramos";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export default function TwitterImage() {
  const logoUrl = new URL("/icon.png", siteUrl()).toString();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 56,
          background: "#f4efe3",
          color: "#1a1714",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 40,
            border: "1px solid rgba(26, 23, 20, 0.10)",
            background: "#fffaf2",
            padding: 44,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 700 }}>
            <img
              src={logoUrl}
              alt="que compramos"
              width={160}
              height={160}
              style={{
                width: 160,
                height: 160,
                borderRadius: 40,
                border: "1px solid rgba(26, 23, 20, 0.10)",
                objectFit: "cover",
              }}
            />
            <div style={{ fontSize: 58, lineHeight: 0.95, fontWeight: 700 }}>
              que compramos
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.35, color: "#6d6458" }}>
              La lista compartida para compras de todos.
            </div>
          </div>

          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: 60,
              background:
                "linear-gradient(135deg, rgba(79,114,81,0.18), rgba(79,114,81,0.02))",
              border: "1px solid rgba(79,114,81,0.14)",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

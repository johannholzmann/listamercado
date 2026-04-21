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

export default function OpenGraphImage() {
  const logoUrl = new URL("/icon.png", siteUrl()).toString();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 64,
          background:
            "linear-gradient(135deg, #f4efe3 0%, #fffaf2 45%, #e8f0e0 100%)",
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
            border: "1px solid rgba(26, 23, 20, 0.10)",
            borderRadius: 48,
            background: "rgba(255, 251, 244, 0.78)",
            boxShadow: "0 24px 80px rgba(44, 30, 17, 0.12)",
            padding: 48,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 660 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <img
                src={logoUrl}
                alt="que compramos"
                width={192}
                height={192}
                style={{
                  width: 192,
                  height: 192,
                  borderRadius: 48,
                  border: "1px solid rgba(26, 23, 20, 0.10)",
                  objectFit: "cover",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 28, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6d6458" }}>
                  que compramos
                </div>
                <div style={{ fontSize: 68, lineHeight: 0.95, fontWeight: 700 }}>
                  La lista compartida
                </div>
              </div>
            </div>

            <div style={{ fontSize: 28, lineHeight: 1.35, color: "#4f7251" }}>
              Simple, persistente y lista para varias personas sin login complejo.
            </div>
          </div>

          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 999,
              background: "radial-gradient(circle at 30% 30%, rgba(79,114,81,0.28), rgba(79,114,81,0.04) 60%, rgba(79,114,81,0.0) 72%)",
              border: "1px solid rgba(79,114,81,0.16)",
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

import { ImageResponse } from "next/og";
import { COPY } from "@/content/copy";

/** Round 17: the social preview card — plain headline + the honesty badge. */

export const alt = "Keel — the bank, risk desk, and safety net behind AI agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#090d13",
          color: "#e7ecf3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>Keel</span>
          <span style={{ fontSize: 18, color: "#66748a", letterSpacing: 4 }}>PRIME</span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 20,
              color: "#f5c04a",
              border: "1px solid #f5c04a55",
              borderRadius: 6,
              padding: "6px 14px",
            }}
          >
            DEMO · SIMULATED DATA ONLY
          </span>
        </div>
        <div style={{ fontSize: 52, fontWeight: 600, lineHeight: 1.25, maxWidth: 1000 }}>
          {COPY.landing.headline}
        </div>
        <div style={{ fontSize: 24, color: "#97a3b6", maxWidth: 900 }}>
          {COPY.landing.subhead}
        </div>
      </div>
    ),
    size,
  );
}

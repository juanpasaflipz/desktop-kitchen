import { ImageResponse } from "@vercel/og";
import type { NextApiRequest } from "next";

export default function handler(req: NextApiRequest) {
  const searchParams = new URLSearchParams(req.url?.split("?")[1] || "");
  const locale = searchParams.get("locale") || "en";
  const isSpanish = locale === "es";

  const title = isSpanish ? "TU COCINA. TUS REGLAS." : "YOUR KITCHEN. YOUR RULES.";
  const subtitle = isSpanish
    ? "Sistema punto de venta para restaurantes y ghost kitchens en México"
    : "The all-in-one POS platform for QSR & fast-casual restaurants";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #171717 50%, #0a0a0a 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#0d9488",
            display: "flex",
          }}
        />

        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "#0d1726",
            marginBottom: 40,
            border: "2px solid rgba(45,212,191,0.3)",
          }}
        >
          <span style={{ color: "#2dd4bf", fontSize: 36, fontWeight: 700 }}>DK</span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
            }}
          >
            {title.split(".")[0]}.
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#0d9488",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              marginTop: 8,
            }}
          >
            {title.split(".")[1]?.trim()}.
          </span>
        </div>

        {/* Subtitle */}
        <span
          style={{
            marginTop: 32,
            fontSize: 24,
            color: "rgba(255,255,255,0.4)",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </span>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, fontWeight: 600 }}>
            desktop.kitchen
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

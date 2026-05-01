import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const revalidate = 3600; // Revalidate every hour

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
          background: "linear-gradient(135deg, #2E3192 0%, #1b1e72 55%, #00AEEF 100%)",
          color: "white",
          padding: "56px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#00AEEF",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            TML
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1 }}>Total Serve</span>
            <span style={{ fontSize: 18, opacity: 0.88, letterSpacing: 1.2 }}>Maintenance Ltd</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.05, maxWidth: 980 }}>
            Find Trusted Tradespeople Across the UK
          </div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>
            Submit an enquiry. Total Serve assigns the right professional.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 26, fontWeight: 700 }}>UK-wide maintenance support</span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              backgroundColor: "#ED1C24",
              borderRadius: 999,
              padding: "10px 20px",
            }}
          >
            Submit Enquiry
          </span>
        </div>
      </div>
    ),
    size
  );
}

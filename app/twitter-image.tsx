import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

export const revalidate = 3600; // Revalidate every hour

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(120deg, #2E3192 0%, #00AEEF 100%)",
          color: "white",
          padding: "48px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800 }}>Total Serve Maintenance Ltd</div>
        <div style={{ fontSize: 64, fontWeight: 900, maxWidth: 980, lineHeight: 1.05 }}>
          Trusted Tradespeople Across the UK
        </div>
        <div style={{ fontSize: 28, opacity: 0.92 }}>
          Search by service and city, submit enquiry, get matched.
        </div>
      </div>
    ),
    size
  );
}

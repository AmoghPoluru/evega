import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Tab icon: green rounded square with a bold Z (readable at 16px). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1F6B4A",
          borderRadius: 8,
          color: "#F7F1E8",
          fontSize: 22,
          fontWeight: 900,
          fontFamily: "Arial Black, Helvetica, Arial, sans-serif",
          lineHeight: 1,
        }}
      >
        Z
      </div>
    ),
    { ...size },
  );
}

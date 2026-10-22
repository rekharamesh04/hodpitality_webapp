import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS — same "E" brand mark as app/icon.svg. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          color: "#FFFFFF",
          fontSize: 110,
          fontWeight: 700,
        }}
      >
        E
      </div>
    ),
    size,
  );
}

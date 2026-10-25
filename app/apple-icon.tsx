import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS — the EntryFlow mark from app/icon.svg, full-bleed (iOS rounds the corners). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #818CF8, #8B5CF6)" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <g fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 8.5H9.75v15H22.5" />
            <path d="M9.75 16h6.3" />
            <circle cx="19.6" cy="16" r="2.9" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}

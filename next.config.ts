import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** The API's origin, so a local .env.local pointing elsewhere keeps working. */
function apiOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "https://9zid3fs6h0.execute-api.us-east-2.amazonaws.com").origin;
  } catch {
    return "https://9zid3fs6h0.execute-api.us-east-2.amazonaws.com";
  }
}

/**
 * Content-Security-Policy: where this site may load code and data from.
 *
 * - scripts: our own, plus Google's sign-in script. 'unsafe-inline' is still needed because
 *   Next.js inlines its hydration data; 'unsafe-eval' only in development.
 * - connect: our API (us-east-2), the uploads bucket (presigned PUT/GET), and Google/Microsoft
 *   sign-in.
 * - images: our own, data:/blob: (QR codes, camera stills), and https: for signed S3 photo URLs.
 * - frames: only Google/Microsoft sign-in, and blob: for in-page PDF previews.
 * - frame-ancestors 'none': no other site may embed EntryFlow (clickjacking).
 */
function contentSecurityPolicy(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      apiOrigin(),
      "https://*.execute-api.us-east-2.amazonaws.com",
      "https://*.s3.us-east-2.amazonaws.com",
      "https://s3.us-east-2.amazonaws.com",
      "https://accounts.google.com",
      "https://login.microsoftonline.com",
      ...(isDev ? ["ws:", "http://localhost:*"] : []),
    ],
    "media-src": ["'self'", "blob:", "mediastream:"],
    "frame-src": ["'self'", "blob:", "https://accounts.google.com", "https://login.microsoftonline.com"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const policy = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`);
  if (!isDev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  // HTTPS only, for a year. No preload: amplifyapp.com is a shared domain.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The camera is used by the kiosk and face enrolment, on this site only. Location, on this site
  // only, for organisations that limit desk staff to their clinics (a phone off the clinic's Wi-Fi
  // proves it is at the clinic; the position is compared once and never stored). Nothing else.
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(self), payment=(), usb=(), serial=(), bluetooth=(), interest-cohort=()",
  },
  // Google and Microsoft sign-in open pop-ups that report back to this window.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  // next/image is not used; with no remote patterns the image optimizer cannot be
  // pointed at outside hosts.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

import type { Metadata, Viewport } from "next";
import { Crimson_Pro, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/providers";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import "./globals.css";

/* Modern Editorial type system: serif headlines, sans body, mono labels. */
const crimson = Crimson_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-crimson",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EntryFlow Admin",
    template: "%s | EntryFlow Admin",
  },
  description:
    "Premium Hospitality & Event Management Dashboard — manage guests, check-ins, venues and events with ease.",
  keywords: ["hospitality", "event management", "admin dashboard", "check-in", "guest management"],
  authors: [{ name: "EntryFlow Corp" }],
  creator: "EntryFlow Corp",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F8F6" },
    { media: "(prefers-color-scheme: dark)",  color: "#0B0C0E" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(crimson.variable, jakarta.variable, jetbrains.variable)}
    >
      <body className="font-sans antialiased">
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

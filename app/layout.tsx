import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

// "Console" type: Plex Sans for the interface, Plex Mono for counts, codes and timestamps.
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
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
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)",  color: "#11151C" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(plexSans.variable, plexMono.variable)}>
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

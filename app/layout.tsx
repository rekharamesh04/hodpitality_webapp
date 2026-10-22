import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/providers";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

// Geometric sans with friendly terminals: 800 for display, 700 headings, 600 titles, 400–500 body.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
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
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)",  color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
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

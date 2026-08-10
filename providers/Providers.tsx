"use client";

import type { ReactNode } from "react";
import QueryProvider from "./QueryProvider";
import ThemeProvider from "./ThemeProvider";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: { borderRadius: "12px" },
            duration: 4000,
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  );
}

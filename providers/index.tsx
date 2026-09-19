'use client';

import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { Toaster } from 'sonner';
import { MotionConfig } from 'framer-motion';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        {/* Honour the OS "reduce motion" setting for every framer-motion animation. */}
        <MotionConfig reducedMotion="user">
          {children}
        </MotionConfig>
        <Toaster position="top-right" richColors closeButton toastOptions={{ style: { borderRadius: '12px' } }} />
      </QueryProvider>
    </ThemeProvider>
  );
}

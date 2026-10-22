'use client';

import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { PopupHost } from '@/components/ui/popup';
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
          {/* Every app message (success, failure, warning, info) surfaces here as a modal popup. */}
          <PopupHost />
        </MotionConfig>
      </QueryProvider>
    </ThemeProvider>
  );
}

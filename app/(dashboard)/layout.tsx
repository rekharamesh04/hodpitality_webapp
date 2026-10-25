'use client';

import { motion } from 'framer-motion';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileNavDrawer, MobileTabBar } from '@/components/layout/MobileNav';
import { CommandPalette } from '@/components/common/CommandPalette';
import { Loading } from '@/components/common/Loading';
import { ModuleGate } from '@/components/layout/ModuleGate';
import { useAuthStore } from '@/store';
import { useSyncIdentity } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  // Picks up a reclassification made while this session was open, so the
  // vocabulary does not stay stale until the next sign-in.
  useSyncIdentity();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <AppSidebar />
      <MobileNavDrawer />

      <div className="flex min-h-screen flex-col">
        <AppHeader />
        {/* Bottom padding on phones keeps content clear of the fixed tab bar. */}
        <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8"
          >
            <ModuleGate>{children}</ModuleGate>
          </motion.div>
        </main>
      </div>

      <MobileTabBar />
      <CommandPalette />
    </div>
  );
}

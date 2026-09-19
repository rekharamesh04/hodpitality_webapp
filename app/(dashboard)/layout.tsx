'use client';

import { motion } from 'framer-motion';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileNavDrawer, MobileTabBar } from '@/components/layout/MobileNav';
import { CommandPalette } from '@/components/common/CommandPalette';
import { Loading } from '@/components/common/Loading';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <MobileNavDrawer />

      {/* Bottom padding on phones keeps content clear of the fixed tab bar. */}
      <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>

      <MobileTabBar />
      <CommandPalette />
    </div>
  );
}

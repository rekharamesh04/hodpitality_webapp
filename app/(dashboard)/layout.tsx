'use client';

import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { CommandPalette } from '@/components/common/CommandPalette';
import { Loading } from '@/components/common/Loading';
import { useAuthStore, useUIStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { sidebarCollapsed } = useUIStore();
  const { isAuthenticated, isLoading } = useAuthStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return null;

  const marginLeft = isDesktop
    ? sidebarCollapsed ? 'var(--sidebar-collapsed-w)' : 'var(--sidebar-w)'
    : '0px';

  return (
    <div className="relative flex min-h-screen">
      <Sidebar />

      <motion.div
        initial={false}
        animate={{ marginLeft }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex min-h-screen flex-1 flex-col overflow-x-hidden"
      >
        <TopNav />

        <main className="flex-1 bg-background">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6"
          >
            {children}
          </motion.div>
        </main>
      </motion.div>

      <CommandPalette />
    </div>
  );
}

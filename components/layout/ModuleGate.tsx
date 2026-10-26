'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, Lock } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { useTerminology } from '@/hooks';
import { PLATFORM_HOME, isPlatformModePath, moduleForPath } from '@/constants/navigation';
import { usePlatformMode } from '@/store/platform-scope-store';

/**
 * Keeps a page out of reach when it does not belong where the user is.
 *
 * - An organisation whose industry does not include the page's module — a
 *   salon opening /prescriptions by URL, say. The menu already hides the
 *   entry; this stops the page rendering and calling an API the industry has
 *   no business with.
 * - A super admin or reseller in platform mode (no single organisation open)
 *   on a page that belongs to one organisation's daily work. The dashboard,
 *   where sign-in lands, becomes the platform overview; anything else says to
 *   open an organisation first, instead of mixing every company's records in
 *   no company's words.
 */
export function ModuleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const t = useTerminology();
  const platformMode = usePlatformMode();
  const pageModule = moduleForPath(pathname);
  const offPlatform = platformMode && !isPlatformModePath(pathname);
  const toPlatformHome = offPlatform && pathname === '/dashboard';

  useEffect(() => {
    if (toPlatformHome) router.replace(PLATFORM_HOME);
  }, [toPlatformHome, router]);

  if (toPlatformHome) return null;

  if (offPlatform) {
    return (
      <EmptyState
        icon={Building2}
        title="Open an organisation first"
        description="This screen is part of one organisation's daily work. Choose which organisation to open — its screens and words then match its industry."
        action={{ label: 'Choose an organisation', onClick: () => router.push(PLATFORM_HOME) }}
        className="py-16"
      />
    );
  }

  if (!pageModule || t.has(pageModule)) return <>{children}</>;

  return (
    <EmptyState
      icon={Lock}
      title="Not part of your account"
      description={`This page isn't included for ${t.label.toLowerCase()} organisations. Ask your account manager if you need it.`}
      action={{ label: 'Go to dashboard', onClick: () => router.push('/dashboard') }}
      className="py-16"
    />
  );
}

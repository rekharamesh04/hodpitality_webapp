'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { useTerminology } from '@/hooks';
import { moduleForPath } from '@/constants/navigation';

/**
 * Keeps a page out of reach when this organisation's industry does not include
 * its module — a salon opening /prescriptions by URL, say. The menu already
 * hides the entry; this stops the page rendering and calling an API the
 * industry has no business with.
 *
 * Super admins and resellers have no company, so their vocabulary is the
 * neutral one, which includes every module: they are never stopped here.
 */
export function ModuleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTerminology();
  const pageModule = moduleForPath(pathname ?? '');

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

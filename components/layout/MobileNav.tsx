'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, CheckCircle2, Users, ClipboardList, CreditCard, Menu, Globe2, Briefcase, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store';
import { PLATFORM_HOME, isNavItemActive } from '@/constants/navigation';
import { getWorkflow } from '@/constants/workflow';
import { industryPack, type IndustryModule } from '@/constants/industry';
import { useIndustry } from '@/hooks';
import { usePlatformMode } from '@/store/platform-scope-store';
import { cn } from '@/lib/utils';
import { BrandMark, SearchButton, SidebarNav } from '@/components/layout/AppSidebar';

interface TabItem { label: string; short?: string; href: string; icon: LucideIcon }

/**
 * Most-used front-desk destinations, one tap away on phones, in the tenant's
 * vocabulary. Registrations is left out for an industry not offered it (a
 * retailer), as its nav entry is.
 */
function defaultTabItems(industry: unknown): TabItem[] {
  const t = industryPack(industry);
  return [
    { label: 'Home',       href: '/dashboard',     icon: LayoutDashboard },
    { label: 'Check-ins',  href: '/check-ins',     icon: CheckCircle2 },
    { label: t.person.many, href: '/guests',       icon: Users },
    ...((t.modules as readonly IndustryModule[]).includes('registrations')
      ? [{ label: 'Registrations', short: 'Sign-ups', href: '/registrations', icon: ClipboardList }]
      : []),
  ];
}

/**
 * With a workflow, the tabs are the two busiest steps of it — the last two
 * required ones between registering someone and taking payment — plus
 * Payments, so the end of the flow is always one tap away.
 */
function tabItemsFor(industry: unknown): TabItem[] {
  const workflow = getWorkflow(industry);
  const defaults = defaultTabItems(industry);
  if (workflow.length === 0) return defaults;
  const middle = workflow.filter((s) => !s.optional && s.href !== '/guests' && s.href !== '/payments').slice(-2);
  const payments = workflow.find((s) => s.href === '/payments');
  return [
    defaults[0],
    ...middle.map((s) => ({ label: s.label, short: s.short, href: s.href, icon: s.icon })),
    ...(payments ? [{ label: 'Payments', href: payments.href, icon: CreditCard }] : []),
  ];
}

/** Platform mode: the platform's own destinations, the same for every industry. */
const PLATFORM_TABS: TabItem[] = [
  { label: 'Overview', href: PLATFORM_HOME, icon: Globe2 },
  { label: 'Companies', href: '/companies', icon: Briefcase },
  { label: 'Analytics', href: '/analytics', icon: TrendingUp },
];

/** Slide-out drawer with the full navigation (below the `lg` breakpoint) — the sidebar's list. */
export function MobileNavDrawer() {
  const pathname = usePathname();
  const { sidebarMobileOpen: open, closeMobileSidebar: close } = useUIStore();

  // Close after navigating, and on Escape.
  useEffect(() => { close(); }, [pathname, close]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-sidebar-border bg-sidebar shadow-[var(--shadow-floating)] lg:hidden"
          >
            <div className="flex h-14 shrink-0 items-center justify-between px-4">
              <BrandMark alwaysShowName />
              <Button
                variant="ghost"
                size="icon"
                onClick={close}
                className="-mr-1.5 h-9 w-9 text-muted-foreground"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="shrink-0 px-3 pb-3">
              <SearchButton />
            </div>
            <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
              <SidebarNav />
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** Fixed bottom tab bar on phones (below `md`). "More" opens the full drawer. */
export function MobileTabBar() {
  const pathname = usePathname();
  const industry = useIndustry();
  const { toggleMobileSidebar } = useUIStore();
  const platformMode = usePlatformMode();
  const tabs = platformMode ? PLATFORM_TABS : tabItemsFor(industry);

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/85 md:hidden"
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isNavItemActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-primary" aria-hidden="true" />}
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="max-w-full truncate px-1">{tab.short ?? tab.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          More
        </button>
      </div>
    </nav>
  );
}

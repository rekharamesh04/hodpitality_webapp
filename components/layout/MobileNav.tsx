'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, CheckCircle2, Users, ClipboardList, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useUIStore } from '@/store';
import { useNotifications } from '@/hooks/use-notifications';
import { getVisibleNavSections, isNavItemActive } from '@/constants/navigation';
import { useIndustry } from '@/hooks';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/layout/AppHeader';

/** Most-used front-desk destinations, one tap away on phones. */
const TAB_ITEMS = [
  { label: 'Home',       href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Check-ins',  href: '/check-ins',     icon: CheckCircle2 },
  { label: 'Guests',     href: '/guests',        icon: Users },
  { label: 'Registrations', short: 'Sign-ups', href: '/registrations', icon: ClipboardList },
];

/** Slide-out drawer with the full navigation (below the `lg` breakpoint). */
export function MobileNavDrawer() {
  const pathname = usePathname();
  const industry = useIndustry();
  const { user } = useAuthStore();
  const { sidebarMobileOpen: open, closeMobileSidebar: close } = useUIStore();
  const { data: notifications } = useNotifications();
  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;
  const sections = getVisibleNavSections(user?.role, industry);

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
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden"
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
            className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-card shadow-[var(--shadow-floating)] lg:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between bg-nav bg-gradient-to-r from-nav to-nav-to px-4">
              <BrandMark alwaysShowName />
              <Button
                variant="ghost"
                size="icon"
                onClick={close}
                className="h-9 w-9 text-nav-muted hover:bg-nav-accent hover:text-nav-foreground"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Main">
              {sections.map((section) => (
                <div key={section.label}>
                  <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.label}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isNavItemActive(pathname, item.href);
                      const badge = item.href === '/notifications' ? unreadCount : 0;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                            active ? 'bg-primary/10 font-semibold text-primary' : 'font-medium text-foreground hover:bg-accent'
                          )}
                        >
                          <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="flex-1">{item.label}</span>
                          {badge > 0 && <Badge className="h-5 px-1.5 text-[10px]">{badge > 99 ? '99+' : badge}</Badge>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
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
  const { toggleMobileSidebar } = useUIStore();

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/85 md:hidden"
    >
      <div className="grid grid-cols-5">
        {TAB_ITEMS.map((tab) => {
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
              {tab.short ?? tab.label}
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

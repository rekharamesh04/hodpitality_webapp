'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Command, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LogoMark } from '@/components/brand/LogoMark';
import { UserMenu } from '@/components/layout/UserMenu';
import { useAuthStore, useUIStore } from '@/store';
import { useNotifications } from '@/hooks/use-notifications';
import { getVisibleNavSections, isNavItemActive, type NavItem, type NavSection } from '@/constants/navigation';
import { useIndustry } from '@/hooks';
import { cn } from '@/lib/utils';

export function BrandMark({ className, alwaysShowName }: { className?: string; alwaysShowName?: boolean }) {
  return (
    <Link href="/dashboard" className={cn('flex shrink-0 items-center gap-2.5', className)} aria-label="EntryFlow Admin — Dashboard">
      <LogoMark className="h-8 w-8 rounded-lg" />
      <span className={cn('text-[15px] font-semibold tracking-tight text-foreground', alwaysShowName ? 'inline' : 'hidden sm:inline')}>
        EntryFlow <span className="font-normal text-muted-foreground">Admin</span>
      </span>
    </Link>
  );
}

/** Opens the ⌘K command palette. */
export function SearchButton({ className }: { className?: string }) {
  const { openCommandPalette } = useUIStore();
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className={cn(
        'flex h-9 w-full items-center gap-2 rounded-md border border-sidebar-border bg-background px-2.5 text-sm text-muted-foreground transition-colors',
        'hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 text-left">Search</span>
      <kbd className="flex h-5 items-center gap-0.5 rounded border border-sidebar-border px-1.5 font-mono text-[10px]">
        <Command className="h-3 w-3" />K
      </kbd>
    </button>
  );
}

interface NavGroup { label?: string; items: NavItem[]; flow?: boolean }

/**
 * Sections as the sidebar lists them. The workflow steps get a group of their
 * own, in order and numbered, so the day's flow is always on screen; the rest
 * of Operations follows under its own heading.
 */
function toGroups(sections: NavSection[]): NavGroup[] {
  return sections.flatMap((section): NavGroup[] => {
    if (section.items.length === 1 && section.menuLabel === 'Dashboard') return [{ items: section.items }];
    const steps = section.items.filter((i) => i.step);
    if (steps.length === 0) return [{ label: section.label, items: section.items }];
    const others = section.items.filter((i) => !i.step);
    return [
      { label: 'Daily workflow', items: steps, flow: true },
      ...(others.length ? [{ label: 'Operations', items: others }] : []),
    ];
  });
}

/** The full navigation as a vertical list — the desktop sidebar and the phone drawer both use it. */
export function SidebarNav() {
  const pathname = usePathname();
  const industry = useIndustry();
  const { user } = useAuthStore();
  const { data: notifications } = useNotifications();
  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;
  const groups = toGroups(getVisibleNavSections(user?.role, industry));

  return (
    <div className="space-y-5">
      {groups.map((group, gi) => (
        <div key={group.label ?? gi}>
          {group.label && (
            <p className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">{group.label}</p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item, i) => {
              const Icon = item.icon;
              const active = isNavItemActive(pathname, item.href);
              const badge = item.href === '/notifications' ? unreadCount : 0;
              return (
                <li key={item.href} className="relative">
                  {/* The thread joining one step to the next. */}
                  {group.flow && i < group.items.length - 1 && (
                    <span className="absolute left-[19.5px] top-[28px] h-[18px] w-px bg-sidebar-border" aria-hidden="true" />
                  )}
                  <Link
                    href={item.href}
                    title={item.description}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'bg-sidebar-active font-medium text-sidebar-active-foreground'
                        : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground',
                    )}
                  >
                    {item.step ? (
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums',
                          active ? 'border-primary bg-primary text-primary-foreground' : 'border-sidebar-border bg-sidebar text-sidebar-muted',
                        )}
                      >
                        <span className="sr-only">Step </span>{item.step}
                      </span>
                    ) : (
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.optional && <span className="text-[10px] text-sidebar-muted">Optional</span>}
                    {badge > 0 && <Badge className="h-5 px-1.5 text-[10px]">{badge > 99 ? '99+' : badge}</Badge>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** The desktop sidebar (from `lg`); phones get the same list in a drawer. */
export function AppSidebar() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex"
      aria-label="Sidebar"
    >
      <div className="flex h-14 shrink-0 items-center px-4">
        <BrandMark alwaysShowName />
      </div>
      <div className="shrink-0 px-3 pb-3">
        <SearchButton />
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        <SidebarNav />
      </nav>
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <UserMenu variant="sidebar" />
      </div>
    </aside>
  );
}

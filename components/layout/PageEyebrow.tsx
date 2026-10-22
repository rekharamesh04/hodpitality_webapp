'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useIndustry } from '@/hooks';
import { getVisibleNavSections, isNavItemActive, type NavItem } from '@/constants/navigation';

/**
 * Editorial eyebrow above every dashboard page: a gold rule, then "SECTION / PAGE" in mono.
 *
 * Read from the navigation itself, so it is always in the tenant's words and never names a
 * page the role cannot see. The dashboard draws its own (the date), and a page with no menu
 * entry gets none.
 */
export function PageEyebrow() {
  const pathname = usePathname() ?? '';
  const industry = useIndustry();
  const role = useAuthStore((s) => s.user?.role);

  if (pathname === '/dashboard') return null;

  // Most specific entry wins (e.g. /guests/123 → Guests).
  let match: { section: string; item: NavItem } | undefined;
  for (const section of getVisibleNavSections(role, industry)) {
    for (const item of section.items) {
      if (isNavItemActive(pathname, item.href) && (!match || item.href.length > match.item.href.length)) {
        // A one-page section is named for its page in the menu; fall back to its group name.
        match = { section: section.menuLabel === item.label ? section.label : section.menuLabel, item };
      }
    }
  }
  if (!match) return null;
  const { section, item } = match;

  return (
    <p className="editorial-label mb-5 flex min-w-0 items-center gap-3 text-muted-foreground">
      <span className="h-px w-8 shrink-0 bg-primary" aria-hidden="true" />
      <span className="shrink-0 text-primary">{section}</span>
      {section !== item.label && (
        <>
          <span aria-hidden="true">/</span>
          <span className="truncate">
            {item.step ? `Step ${String(item.step).padStart(2, '0')} · ` : ''}
            {item.label}
          </span>
        </>
      )}
    </p>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Check, ChevronDown, Globe2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuthStore } from '@/store';
import {
  ALL_ORGANISATIONS, scopeKey, usePlatformScopeStore, type PlatformScope,
} from '@/store/platform-scope-store';
import { industryHasModule, industryPack, normalizeIndustry, type IndustrySlug } from '@/constants/industry';
import { moduleForPath } from '@/constants/navigation';
import { isPlatformRole } from '@/constants/roles';
import { cn } from '@/lib/utils';
import type { Company } from '@/types';

/** Above this many companies the list gets a search box. */
const SEARCH_THRESHOLD = 8;

/**
 * "Viewing: All organisations ▾" — the super admin's (and reseller's) lens on the platform.
 *
 * Pick an industry to see every company of that kind together, or one company to see the portal
 * exactly as it does, in its words and with its modules. Renders nothing for anyone else.
 *
 * A strip under the header rather than a button in it: the header row is already full for these
 * roles, and a filtered view must be impossible to forget — every number on the page depends on it.
 */
export function PlatformScopeSwitcher() {
  const role = useAuthStore((s) => s.user?.role);
  const platform = isPlatformRole(role);
  const scope = usePlatformScopeStore((s) => s.scope);
  const setScope = usePlatformScopeStore((s) => s.setScope);
  const { data: companies } = useCompanies({ enabled: platform });
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Every cached list was fetched for the previous scope; refetch them all for the new one.
  const lastKey = useRef(scopeKey(scope));
  useEffect(() => {
    const key = scopeKey(scope);
    if (key === lastKey.current) return;
    lastKey.current = key;
    qc.resetQueries();
  }, [scope, qc]);

  const groups = useMemo(() => groupByIndustry(companies ?? [], search), [companies, search]);

  if (!platform) return null;

  function choose(next: PlatformScope) {
    setScope(next);
    setOpen(false);
    setSearch('');
    // A page the chosen industry does not offer would only show "not part of your account".
    const pageModule = moduleForPath(pathname ?? '');
    if (pageModule && next.kind !== 'all' && !industryHasModule(next.industry, pageModule)) router.push('/dashboard');
  }

  const label = scope.kind === 'company'
    ? scope.name || 'One company'
    : scope.kind === 'industry'
    ? industryPack(scope.industry).label
    : 'All organisations';

  return (
    <div className={cn('border-t border-nav-border', scope.kind !== 'all' ? 'bg-primary/[0.07]' : 'bg-background/60')}>
      <div className="mx-auto flex h-10 w-full max-w-[1600px] items-center gap-2 px-4 text-xs sm:px-6 lg:px-8">
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-nav-muted">Viewing</span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 min-w-0 gap-1.5 border px-2',
                scope.kind === 'all'
                  ? 'border-input bg-card text-nav-foreground hover:bg-nav-accent hover:text-nav-foreground'
                  : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
              )}
              aria-label={`Viewing ${label}. Change which organisations you see.`}
            >
              {scope.kind === 'company' ? <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <Globe2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              <span className="truncate font-medium">{label}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="w-80 p-0">
        <div className="border-b p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Viewing</p>
          <p className="text-xs text-muted-foreground">
            Every page shows only what you pick. Viewing one company, what you add is added to it.
          </p>
          {(companies?.length ?? 0) > SEARCH_THRESHOLD && (
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a company"
                className="h-8 pl-8 text-sm"
                aria-label="Find a company"
              />
            </div>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-1.5">
          <ScopeRow active={scope.kind === 'all'} onClick={() => choose(ALL_ORGANISATIONS)}>
            <Globe2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium">All organisations</span>
            <span className="text-xs tabular-nums text-muted-foreground">{companies?.length ?? 0}</span>
          </ScopeRow>
          {groups.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              {companies?.length ? 'No company matches.' : 'No companies yet.'}
            </p>
          )}
          {groups.map(({ industry, companies: list }) => (
            <div key={industry} className="mt-1.5">
              <ScopeRow
                active={scope.kind === 'industry' && scope.industry === industry}
                onClick={() => choose({ kind: 'industry', industry })}
              >
                <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {industryPack(industry).label}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">{list.length}</span>
              </ScopeRow>
              {list.map((c) => (
                <ScopeRow
                  key={c.tenant_id}
                  inset
                  active={scope.kind === 'company' && scope.tenantId === c.tenant_id}
                  onClick={() => choose({ kind: 'company', tenantId: c.tenant_id!, name: c.name, industry })}
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1 truncate text-sm">{c.name || c.tenant_id}</span>
                  {c.status && c.status !== 'active' && (
                    <span className="text-[10px] uppercase text-muted-foreground">{c.status}</span>
                  )}
                </ScopeRow>
              ))}
            </div>
          ))}
        </div>
          </PopoverContent>
        </Popover>
        {scope.kind === 'company' && (
          <span className="hidden truncate text-primary sm:inline">{industryPack(scope.industry).label}</span>
        )}
        {scope.kind !== 'all' && (
          <button
            type="button"
            onClick={() => choose(ALL_ORGANISATIONS)}
            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-nav-muted hover:bg-nav-accent hover:text-nav-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" aria-hidden="true" /> Show all
          </button>
        )}
      </div>
    </div>
  );
}

function ScopeRow({
  active, inset, onClick, children,
}: { active: boolean; inset?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        inset && 'pl-6',
        active && 'bg-primary/10',
      )}
    >
      {children}
      {active && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
    </button>
  );
}

/** Companies with a tenant, grouped by industry, largest group first, each alphabetical. */
function groupByIndustry(companies: Company[], search: string) {
  const term = search.trim().toLowerCase();
  const groups = new Map<IndustrySlug, Company[]>();
  for (const c of companies) {
    if (!c.tenant_id) continue;
    if (term && !(c.name ?? '').toLowerCase().includes(term)) continue;
    const industry = normalizeIndustry(c.industry);
    if (!groups.has(industry)) groups.set(industry, []);
    groups.get(industry)!.push(c);
  }
  return [...groups.entries()]
    .map(([industry, list]) => ({ industry, companies: list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')) }))
    .sort((a, b) => b.companies.length - a.companies.length || industryPack(a.industry).label.localeCompare(industryPack(b.industry).label));
}

'use client';

import { Suspense, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Building2, Lock, Mail, Plus, RefreshCw, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { usePlatformOverview } from '@/hooks/usePlatform';
import { useCompanies } from '@/hooks/useCompanies';
import { useStaff } from '@/hooks/useStaff';
import { useAuthStore } from '@/store';
import { usePlatformScopeStore, type PlatformScope } from '@/store/platform-scope-store';
import { industryPack, isIndustrySlug, type IndustrySlug } from '@/constants/industry';
import { industryIcon } from '@/constants/industry-icons';
import { isPlatformRole } from '@/constants/roles';
import { cn, getFriendlyErrorMessage } from '@/lib/utils';
import type { OverviewCompany, OverviewCounts } from '@/services/platform.service';

/** Someone who can sign in as an organisation's admin. */
interface Admin { name: string; email: string; pending?: boolean }

export default function PlatformOverviewPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <PlatformOverviewInner />
    </Suspense>
  );
}

/**
 * The super admin's (or reseller's) console: one workspace per industry.
 *
 * Each industry the platform serves is a card; choosing one lists its organisations with their
 * admins and numbers. "Open workspace" switches the whole portal into that organisation — its
 * screens, its words — so the super admin can do its daily work without signing in as anyone.
 * What they do is saved to that organisation, its own staff see it when they sign in, and the
 * organisation is notified who did it (the backend's _platform_action_notice).
 */
function PlatformOverviewInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = useAuthStore((s) => s.user?.role);
  const platform = isPlatformRole(role);
  const setScope = usePlatformScopeStore((s) => s.setScope);
  const { data, isLoading, isError, error, refetch, isFetching } = usePlatformOverview({ enabled: platform });
  const { data: companies } = useCompanies({ enabled: platform });
  const { data: adminStaff } = useStaff({ role: 'company_admin' });

  // The organisation's admins: the address it was created with (invited as its admin), and any
  // admin added since. Keyed by tenant.
  const adminsByTenant = useMemo(() => {
    const map = new Map<string, Admin[]>();
    const add = (tenant: string | undefined, admin: Admin) => {
      if (!tenant || !admin.email) return;
      const list = map.get(tenant) ?? [];
      if (!list.some((a) => a.email.toLowerCase() === admin.email.toLowerCase())) list.push(admin);
      map.set(tenant, list);
    };
    for (const s of adminStaff ?? []) {
      if (s.role === 'company_admin') add(s.tenant_id, { name: s.name, email: s.email ?? '', pending: s.status === 'pending' });
    }
    for (const c of companies ?? []) add(c.tenant_id, { name: '', email: c.email ?? '' });
    return map;
  }, [adminStaff, companies]);

  const industries = data?.industries ?? [];
  const wanted = searchParams.get('industry');
  const selected: IndustrySlug | null =
    wanted && isIndustrySlug(wanted) && industries.some((i) => i.slug === wanted)
      ? wanted
      : industries[0]?.slug ?? null;

  if (!platform) {
    return (
      <EmptyState
        icon={Lock}
        title="Platform administrators only"
        description="This page shows every organisation on the platform."
        action={{ label: 'Go to dashboard', onClick: () => router.push('/dashboard') }}
        className="py-16"
      />
    );
  }

  function selectIndustry(slug: IndustrySlug) {
    router.replace(`${pathname}?industry=${slug}`, { scroll: false });
  }

  /** Switch the portal into one organisation (its own screens), or one industry's numbers. */
  function open(scope: PlatformScope) {
    setScope(scope);
    router.push(scope.kind === 'company' ? '/dashboard' : '/analytics');
  }

  const unassignedTotal = data ? Object.values(data.unassigned).reduce((sum, n) => sum + n, 0) : 0;
  const inIndustry = (data?.companies ?? []).filter((c) => c.industry === selected);
  const current = industries.find((i) => i.slug === selected);
  const pack = industryPack(selected ?? undefined);
  const CurrentIcon = industryIcon(selected);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Platform overview</h1>
          <p className="text-muted-foreground">
            One workspace per industry. Open an organisation to work inside it — what you do is saved to it,
            and its admins are told.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button size="sm" onClick={() => router.push('/companies?action=add')}>
            <Plus className="h-4 w-4" aria-hidden="true" /> New organisation
          </Button>
        </div>
      </div>

      {isError ? (
        <ErrorState title="Unable to load the overview" message={getFriendlyErrorMessage(error)} onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <TableSkeleton rows={8} />
      ) : data.totals.companies === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organisations yet"
          description="Create a company and choose its industry — it gets its own workspace here."
          action={{ label: 'New organisation', onClick: () => router.push('/companies?action=add') }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Organisations" value={data.totals.companies} />
            <Stat label="Industries" value={industries.length} />
            <Stat label="People" value={data.totals.people} />
            <Stat label="Staff" value={data.totals.staff} />
          </div>

          {/* The industries the platform serves, each its own workspace. */}
          <section aria-label="Industries">
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Industries</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {industries.map((i) => {
                const Icon = industryIcon(i.slug);
                const words = industryPack(i.slug);
                const active = i.slug === selected;
                return (
                  <button
                    key={i.slug}
                    type="button"
                    onClick={() => selectIndustry(i.slug)}
                    aria-pressed={active}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors',
                      'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active && 'border-primary bg-primary/5 ring-1 ring-primary/30',
                    )}
                  >
                    <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{i.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {i.companies} {i.companies === 1 ? 'organisation' : 'organisations'} · {i.people} {words.person.many.toLowerCase()}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {current && selected && (
            <Card>
              <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CurrentIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-lg">{current.label} workspace</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {current.companies} {current.companies === 1 ? 'organisation' : 'organisations'} ·{' '}
                      {current.people} {pack.person.many.toLowerCase()} · {current.appointments} {pack.visit.many.toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => open({ kind: 'industry', industry: selected })}>
                    {current.label} analytics <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/companies?action=add&industry=${selected}`)}>
                    <Plus className="h-4 w-4" aria-hidden="true" /> New {pack.org.toLowerCase()}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {inIndustry.map((c) => (
                  <OrganisationRow
                    key={c.tenantId}
                    company={c}
                    admins={adminsByTenant.get(c.tenantId) ?? []}
                    onOpen={() => open({ kind: 'company', tenantId: c.tenantId, name: c.name, industry: c.industry })}
                    onInvite={() => router.push('/companies')}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {unassignedTotal > 0 && (
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {unassignedTotal} record{unassignedTotal === 1 ? '' : 's'} belong to no organisation — older data written
              before records were tied to a company. They appear in no workspace.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** One organisation in its industry's workspace: who runs it, how busy it is, and the way in. */
function OrganisationRow({
  company: c, admins, onOpen, onInvite,
}: { company: OverviewCompany; admins: Admin[]; onOpen: () => void; onInvite: () => void }) {
  const pack = industryPack(c.industry);
  const counts: { key: keyof OverviewCounts; label: string }[] = [
    { key: 'people', label: pack.person.many },
    { key: 'staff', label: 'Staff' },
    { key: 'appointments', label: pack.visit.many },
    { key: 'checkIns', label: 'Check-ins' },
  ];
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold">{c.name || c.tenantId}</p>
          {c.status && c.status !== 'active' && <StatusBadge status={c.status} />}
        </div>
        {/* The admins who sign in to this organisation and see what is done here. */}
        {admins.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {admins.map((a) => (
              <li key={a.email} className="max-w-full">
                <Badge variant="outline" className="max-w-full gap-1 font-normal">
                  <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{a.name ? `${a.name} · ` : ''}{a.email}</span>
                  {a.pending && <span className="text-muted-foreground">(invited)</span>}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <button type="button" onClick={onInvite} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> No admin yet — invite one
          </button>
        )}
      </div>
      <dl className="grid shrink-0 grid-cols-4 gap-4 text-center">
        {counts.map(({ key, label }) => (
          <div key={key}>
            <dt className="text-[11px] text-muted-foreground">{label}</dt>
            <dd className="text-base font-semibold tabular-nums">{c[key]}</dd>
          </div>
        ))}
      </dl>
      <Button className="shrink-0" onClick={onOpen}>
        Open workspace <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="px-4 pb-3 pt-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

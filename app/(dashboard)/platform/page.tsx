'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, Globe2, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { usePlatformOverview } from '@/hooks/usePlatform';
import { useAuthStore } from '@/store';
import { usePlatformScopeStore, type PlatformScope } from '@/store/platform-scope-store';
import { industryPack } from '@/constants/industry';
import { isPlatformRole } from '@/constants/roles';
import { cn, getFriendlyErrorMessage } from '@/lib/utils';
import type { OverviewCounts } from '@/services/platform.service';

/** The columns both tables share, in order. */
const COLUMNS: { key: keyof OverviewCounts; label: string }[] = [
  { key: 'staff', label: 'Staff' },
  { key: 'people', label: 'People' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'appointments', label: 'Visits' },
  { key: 'checkIns', label: 'Check-ins' },
  { key: 'prescriptions', label: 'Prescriptions' },
];

/**
 * The whole platform at a glance, for a super admin (or a reseller's own companies).
 *
 * Counts are per industry and per company, in one request, and ignore the current scope —
 * this is where a scope is chosen from. "View" narrows every page to that industry or company.
 */
export default function PlatformOverviewPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const platform = isPlatformRole(role);
  const setScope = usePlatformScopeStore((s) => s.setScope);
  const { data, isLoading, isError, error, refetch, isFetching } = usePlatformOverview({ enabled: platform });

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

  function view(scope: PlatformScope) {
    setScope(scope);
    router.push('/dashboard');
  }

  const unassignedTotal = data ? Object.values(data.unassigned).reduce((sum, n) => sum + n, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Platform overview</h1>
          <p className="text-muted-foreground">
            {role === 'reseller' ? 'Your organisations' : 'Every organisation'}, by industry. View one to see the portal as it does.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
        </Button>
      </div>

      {isError ? (
        <ErrorState title="Unable to load the overview" message={getFriendlyErrorMessage(error)} onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <TableSkeleton rows={8} />
      ) : data.totals.companies === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organisations yet"
          description="Create a company and choose its industry to get started."
          action={{ label: 'Go to companies', onClick: () => router.push('/companies') }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <Stat label="Organisations" value={data.totals.companies} />
            {COLUMNS.map((c) => <Stat key={c.key} label={c.label} value={data.totals[c.key]} />)}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe2 className="h-4 w-4 text-primary" aria-hidden="true" /> By industry
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                &ldquo;People&rdquo; is what each industry calls them — patients, guests, clients.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Industry</TableHead>
                      <TableHead className="text-right">Organisations</TableHead>
                      {COLUMNS.map((c) => <TableHead key={c.key} className="text-right">{c.label}</TableHead>)}
                      <TableHead className="text-right"><span className="sr-only">View</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.industries.map((i) => {
                      const pack = industryPack(i.slug);
                      return (
                        <TableRow key={i.slug}>
                          <TableCell className="font-medium">{i.label}</TableCell>
                          <TableCell className="text-right tabular-nums">{i.companies}</TableCell>
                          {COLUMNS.map((c) => (
                            <TableCell key={c.key} className="text-right tabular-nums">
                              {i[c.key]}
                              {c.key === 'people' && <span className="block text-[10px] text-muted-foreground">{pack.person.many}</span>}
                              {c.key === 'appointments' && <span className="block text-[10px] text-muted-foreground">{pack.visit.many}</span>}
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => view({ kind: 'industry', industry: i.slug })}>
                              View <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" aria-hidden="true" /> By organisation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Industry</TableHead>
                      {COLUMNS.map((c) => <TableHead key={c.key} className="text-right">{c.label}</TableHead>)}
                      <TableHead className="text-right"><span className="sr-only">View</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.companies.map((c) => (
                      <TableRow key={c.tenantId}>
                        <TableCell>
                          <p className="font-medium">{c.name || c.tenantId}</p>
                          {c.status && c.status !== 'active' && (
                            <p className="text-[10px] uppercase text-muted-foreground">{c.status}</p>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">{industryPack(c.industry).label}</TableCell>
                        {COLUMNS.map((col) => (
                          <TableCell key={col.key} className="text-right tabular-nums">{c[col.key]}</TableCell>
                        ))}
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => view({ kind: 'company', tenantId: c.tenantId, name: c.name, industry: c.industry })}
                          >
                            View <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {unassignedTotal > 0 && (
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {unassignedTotal} record{unassignedTotal === 1 ? '' : 's'} belong to no organisation — older data written
              before records were tied to a company, or by a super admin viewing all organisations. They appear only
              under &ldquo;All organisations&rdquo;.
            </p>
          )}
        </>
      )}
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

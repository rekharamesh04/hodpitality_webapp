import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isIndustrySlug, type IndustrySlug } from '@/constants/industry';
import { isPlatformRole } from '@/constants/roles';
import { useAuthStore } from './auth-store';

/**
 * Which part of the platform a super admin (or reseller) is looking at.
 *
 * Their lists otherwise mix every company on the platform, in neutral words.
 * Choosing an industry narrows every list to the companies of that industry;
 * choosing a company narrows it to that one company, and the whole portal then
 * speaks its vocabulary and offers its modules — a hospital's OPD queue, a
 * spa's treatment board.
 *
 * The API does the narrowing (scopeTenantId / scopeIndustry on every request,
 * honoured for platform roles only), so a scope can only ever narrow what the
 * login may already see. While scoped to one company, what the super admin
 * creates belongs to that company.
 */
export type PlatformScope =
  | { kind: 'all' }
  | { kind: 'industry'; industry: IndustrySlug }
  | { kind: 'company'; tenantId: string; name: string; industry: IndustrySlug };

export const ALL_ORGANISATIONS: PlatformScope = { kind: 'all' };

/** The query parameters a request carries for this login and scope. Empty when none apply. */
export function scopeQueryParams(role: string | undefined, scope: PlatformScope): Record<string, string> {
  if (!isPlatformRole(role)) return {};
  if (scope.kind === 'company') return { scopeTenantId: scope.tenantId };
  if (scope.kind === 'industry') return { scopeIndustry: scope.industry };
  return {};
}

/** The industry whose vocabulary and modules apply, or null for the neutral, everything view. */
export function scopeIndustry(role: string | undefined, scope: PlatformScope): IndustrySlug | null {
  if (!isPlatformRole(role) || scope.kind === 'all') return null;
  return scope.industry;
}

/** A stable string for "did the scope change" checks. */
export function scopeKey(scope: PlatformScope): string {
  if (scope.kind === 'company') return `company:${scope.tenantId}`;
  if (scope.kind === 'industry') return `industry:${scope.industry}`;
  return 'all';
}

/** Whatever was persisted, as a valid scope — a corrupt or outdated value means "all". */
export function sanitizeScope(value: unknown): PlatformScope {
  if (!value || typeof value !== 'object') return ALL_ORGANISATIONS;
  const v = value as Record<string, unknown>;
  if (v.kind === 'industry' && isIndustrySlug(v.industry)) return { kind: 'industry', industry: v.industry };
  if (v.kind === 'company' && typeof v.tenantId === 'string' && v.tenantId && isIndustrySlug(v.industry)) {
    return { kind: 'company', tenantId: v.tenantId, name: typeof v.name === 'string' ? v.name : '', industry: v.industry };
  }
  return ALL_ORGANISATIONS;
}

/** Request params the API reads; stripped from a request retried after the scope was dropped. */
export const SCOPE_PARAM_NAMES = ['scopeTenantId', 'scopeIndustry'] as const;

interface PlatformScopeState {
  scope: PlatformScope;
  setScope: (scope: PlatformScope) => void;
  clear: () => void;
}

export const usePlatformScopeStore = create<PlatformScopeState>()(
  persist(
    (set) => ({
      scope: ALL_ORGANISATIONS,
      setScope: (scope) => set({ scope: sanitizeScope(scope) }),
      clear: () => set({ scope: ALL_ORGANISATIONS }),
    }),
    {
      name: 'entryflow_platform_scope',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ scope: state.scope }),
      merge: (persisted, current) => ({
        ...current,
        scope: sanitizeScope((persisted as { scope?: unknown } | undefined)?.scope),
      }),
    },
  ),
);

// Signing out — or in as someone else — starts from the whole platform again.
if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state, prev) => {
    if (prev.user?.id && state.user?.id !== prev.user.id) usePlatformScopeStore.getState().clear();
  });
}

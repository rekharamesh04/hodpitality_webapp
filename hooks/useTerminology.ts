'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store';
import { scopeIndustry, usePlatformScopeStore } from '@/store/platform-scope-store';
import {
  DEFAULT_INDUSTRY,
  industryPack,
  normalizeIndustry,
  type IndustryModule,
  type IndustryPack,
  type IndustrySlug,
} from '@/constants/industry';

export interface Terminology extends IndustryPack {
  /** The tenant's industry, already normalized. */
  slug: IndustrySlug;
  /** Whether this tenant is offered a given area of the product. */
  has: (module: IndustryModule) => boolean;
  /** "Hospital Admin", "Hotel Admin", "School Admin"… */
  adminLabel: string;
}

/**
 * The vocabulary for the signed-in user's tenant.
 *
 * The industry comes from `GET /auth/me`, which resolves it from the company
 * record. Before that call returns — and for a user whose tenant has no
 * company row — this falls back to the neutral default rather than rendering
 * a blank label, so a page never waits on the network to draw its heading.
 *
 * A super admin or reseller looking at one company or industry gets that
 * industry's words and modules; looking at the whole platform, the neutral pack.
 */
export function useTerminology(): Terminology {
  const industry = useRawIndustry();
  return useMemo(() => {
    const slug = normalizeIndustry(industry ?? DEFAULT_INDUSTRY);
    const pack = industryPack(slug);
    return {
      ...pack,
      slug,
      adminLabel: `${pack.org} Admin`,
      has: (module: IndustryModule) =>
        (pack.modules as readonly IndustryModule[]).includes(module),
    };
  }, [industry]);
}

/** The signed-in user's industry slug, normalized — or the industry a platform user is viewing. */
export function useIndustry(): IndustrySlug {
  return normalizeIndustry(useRawIndustry() ?? DEFAULT_INDUSTRY);
}

/** The scoped industry for a platform role, else the user's own. */
function useRawIndustry(): unknown {
  const own = useAuthStore((s) => s.user?.industry);
  const role = useAuthStore((s) => s.user?.role);
  const scope = usePlatformScopeStore((s) => s.scope);
  return scopeIndustry(role, scope) ?? own;
}

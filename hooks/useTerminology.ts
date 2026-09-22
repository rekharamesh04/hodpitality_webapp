'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store';
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
 */
export function useTerminology(): Terminology {
  const industry = useAuthStore((s) => s.user?.industry);
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

/** The signed-in user's industry slug, normalized. */
export function useIndustry(): IndustrySlug {
  const industry = useAuthStore((s) => s.user?.industry);
  return normalizeIndustry(industry ?? DEFAULT_INDUSTRY);
}

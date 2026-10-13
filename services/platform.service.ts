import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { IndustrySlug } from '@/constants/industry';

/** What each count in the overview measures. */
export interface OverviewCounts {
  staff: number;
  /** Guest records — what each industry calls its people (Patients, Guests, Clients…). */
  people: number;
  /** Customer records — the billing / account side. */
  accounts: number;
  appointments: number;
  checkIns: number;
  prescriptions: number;
}

export interface OverviewIndustry extends OverviewCounts {
  slug: IndustrySlug;
  label: string;
  companies: number;
}

export interface OverviewCompany extends OverviewCounts {
  id: string;
  tenantId: string;
  name: string;
  industry: IndustrySlug;
  status: string;
}

export interface PlatformOverview {
  industries: OverviewIndustry[];
  companies: OverviewCompany[];
  /** Rows that belong to no organisation — legacy data from before tenants were stamped. */
  unassigned: OverviewCounts;
  totals: OverviewCounts & { companies: number };
}

export const platformService = {
  /** GET /platform/overview — counts everything the caller may see, whatever the current scope. */
  async getOverview(): Promise<PlatformOverview> {
    const { data } = await api.get<PlatformOverview>(API_ENDPOINTS.PLATFORM_OVERVIEW);
    return data;
  },
};

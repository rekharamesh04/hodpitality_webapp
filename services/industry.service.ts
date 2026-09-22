import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import { INDUSTRY_OPTIONS, type IndustrySlug } from '@/constants/industry';

export interface IndustryOption {
  slug: IndustrySlug;
  label: string;
}

interface IndustriesResponse {
  default?: string;
  industries?: { slug?: string; label?: string }[];
}

/**
 * The industries the API will accept.
 *
 * The bundled list in constants/industry.ts is what every label renders from,
 * and it is enough on its own. This endpoint exists so the picker on the
 * company form offers exactly what the backend validates against: adding an
 * industry server-side would otherwise mean nobody could select it until the
 * portal shipped again, and a slug this build does not know would be refused
 * with a 400 the user could not act on.
 */
export const industryService = {
  async getIndustries(): Promise<IndustryOption[]> {
    const { data } = await api.get<IndustriesResponse>(API_ENDPOINTS.INDUSTRIES);
    const rows = (data?.industries ?? [])
      .filter((i): i is { slug: string; label: string } => !!i?.slug && !!i?.label)
      .map((i) => ({ slug: i.slug as IndustrySlug, label: i.label }));
    // An empty or malformed response must not empty the picker.
    return rows.length > 0 ? rows : [...INDUSTRY_OPTIONS];
  },
};

/**
 * The category vocabulary for person records.
 *
 * These used to be one fixed list — VIP, Speaker, Delegate, Staff, Press — which
 * only ever made sense for an events tenant. The options now come from the
 * tenant's industry (see ./industry), so a hospital offers Inpatient and
 * Outpatient while a hotel still offers VIP and Corporate.
 *
 * The stored value is unchanged by any of this. A row written under one
 * industry keeps its category when the tenant is reclassified, so every reader
 * here tolerates a value that is in no current list.
 */
import { badgeToneClass } from './badge-tone';
import { industryPack } from './industry';

/** The categories offered when creating or editing a record in this industry. */
export function guestCategories(industry: unknown): readonly string[] {
  return industryPack(industry).categories;
}

/** Badge classes for a stored category. Unknown values render neutral. */
export function guestCategoryBadgeClass(category: unknown, industry: unknown): string {
  return badgeToneClass(category, guestCategories(industry));
}

/**
 * The options a record may be assigned, with any value the record already
 * holds folded in. Without this a legacy category would silently vanish from
 * the picker and the next save would drop it.
 */
export function guestCategoryOptions(industry: unknown, current?: unknown): readonly string[] {
  const options = guestCategories(industry);
  if (typeof current !== 'string' || !current.trim()) return options;
  const exists = options.some((o) => o.toLowerCase() === current.trim().toLowerCase());
  return exists ? options : [...options, current.trim()];
}

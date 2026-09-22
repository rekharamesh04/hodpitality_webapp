/**
 * The tier vocabulary for person records.
 *
 * These used to be one fixed list — Founding, Signature, Standard — taken from
 * the spa customer profile. The options now come from the tenant's industry
 * (see ./industry), so an airline offers Platinum and Gold while a spa still
 * offers Founding and Signature.
 *
 * The stored value is unchanged by any of this: a row keeps its tier when the
 * tenant is reclassified, so every reader here tolerates a value that is in no
 * current list.
 */
import { badgeToneClass } from './badge-tone';
import { industryPack } from './industry';

/** The tiers offered when creating or editing a record in this industry. */
export function customerTiers(industry: unknown): readonly string[] {
  return industryPack(industry).tiers;
}

/** Badge classes for a stored tier. Unknown values render neutral. */
export function tierBadgeClass(tier: unknown, industry: unknown): string {
  return badgeToneClass(tier, customerTiers(industry));
}

/**
 * The tiers a record may be assigned, with any value the record already holds
 * folded in, so a legacy tier does not vanish from the picker and get dropped
 * on the next save.
 */
export function customerTierOptions(industry: unknown, current?: unknown): readonly string[] {
  const options = customerTiers(industry);
  if (typeof current !== 'string' || !current.trim()) return options;
  const exists = options.some((o) => o.toLowerCase() === current.trim().toLowerCase());
  return exists ? options : [...options, current.trim()];
}

/**
 * How someone prefers to be contacted. Not industry vocabulary — a phone call
 * is a phone call in every industry — so this stays a fixed list.
 */
export const PREFERRED_CONTACT_OPTIONS = ['Email', 'SMS', 'Call'] as const;

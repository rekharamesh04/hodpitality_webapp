/** The application's existing customer tier vocabulary (see lib/mock-data.ts and the legacy customer profile view). */
export const CUSTOMER_TIERS = ['Founding', 'Signature', 'Standard'] as const;

export type CustomerTierValue = (typeof CUSTOMER_TIERS)[number];

export const TIER_BADGE_CLASSES: Record<string, string> = {
  Founding:  'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  Signature: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  Standard:  'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
};

/** The application's existing preferred-contact vocabulary (see the spa Customer profile type). */
export const PREFERRED_CONTACT_OPTIONS = ['Email', 'SMS', 'Call'] as const;

/**
 * Colouring for the small vocabularies a tenant picks from — a guest's
 * category, a customer's tier.
 *
 * Those lists are per-industry (see ./industry), so the colours cannot be a
 * fixed map from value to class any more. They are assigned by position in the
 * tenant's own list instead, which keeps a list readable whatever its words.
 *
 * Two rules keep existing data looking the way it does today:
 *
 *  - values the product shipped before industries existed keep their colour,
 *    so a row still reading "Speaker" or "Signature" does not change shade;
 *  - a value that is in no list at all — a row created under a different
 *    industry, an import, a hand-edit — renders neutral rather than blank.
 */

export type BadgeTone = 'amber' | 'purple' | 'blue' | 'green' | 'cyan' | 'rose' | 'neutral';

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  amber:   'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  purple:  'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  blue:    'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  green:   'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  cyan:    'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800',
  rose:    'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800',
  neutral: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
};

/** The tone a position in a list gets. Neutral is reserved for baselines. */
const ROTATION: readonly BadgeTone[] = ['amber', 'purple', 'blue', 'green', 'cyan', 'rose'];

/**
 * Values that mean "nothing special" in any industry. They stay neutral
 * wherever they appear in a list, so the ordinary case never shouts.
 */
const BASELINE = new Set(['regular', 'standard', 'walk-in', 'economy', 'retail', 'visitor', 'temporary']);

/**
 * Colours the product used before industries existed. Kept so that rows
 * written under the old fixed vocabulary do not change shade.
 */
const LEGACY_TONES: Record<string, BadgeTone> = {
  vip: 'amber',
  speaker: 'purple',
  delegate: 'blue',
  staff: 'neutral',
  press: 'green',
  founding: 'amber',
  signature: 'purple',
};

/** The tone for `value`, given the tenant's list of options. */
export function badgeTone(value: unknown, options: readonly string[] = []): BadgeTone {
  if (typeof value !== 'string' || !value.trim()) return 'neutral';
  const key = value.trim().toLowerCase();
  if (BASELINE.has(key)) return 'neutral';
  if (key in LEGACY_TONES) return LEGACY_TONES[key];
  const index = options.findIndex((o) => o.toLowerCase() === key);
  // Not one of this tenant's options: a legacy row, an import or a hand-edit.
  if (index < 0) return 'neutral';
  return ROTATION[index % ROTATION.length];
}

/** The Tailwind classes for `value`, given the tenant's list of options. */
export function badgeToneClass(value: unknown, options: readonly string[] = []): string {
  return BADGE_TONE_CLASSES[badgeTone(value, options)];
}

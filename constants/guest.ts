/** The application's existing guest category vocabulary (see lib/mock-data.ts GUEST_CATEGORIES and the legacy Guests page). */
export const GUEST_CATEGORIES = ['VIP', 'Speaker', 'Delegate', 'Staff', 'Press', 'regular'] as const;

export type GuestCategoryValue = (typeof GUEST_CATEGORIES)[number];

export const GUEST_CATEGORY_BADGE_CLASSES: Record<string, string> = {
  VIP:      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  Speaker:  'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  Delegate: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  Staff:    'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
  Press:    'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  regular:  'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
  standard: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
};

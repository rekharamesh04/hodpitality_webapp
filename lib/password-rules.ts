/**
 * The password rule, shared by every screen that sets a password: the same rule the
 * Cognito user pool enforces (us-east-2, set 2026-11-24). Existing passwords keep
 * working; the rule applies when a password is set or changed.
 */
export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_HINT = 'At least 12 characters, with an uppercase letter, a lowercase letter, a number and a symbol.';

/** What is wrong with a new password, in plain words, or null when it is fine. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (!/[A-Z]/.test(password)) return 'Add an uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Add a lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Add a number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Add a symbol, such as ! @ # or $.';
  return null;
}

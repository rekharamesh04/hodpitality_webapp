import { industryPack } from './industry';

/**
 * The one list of login roles.
 *
 * Must stay identical to STAFF_ROLES in the backend (hospitality_lambda.py) and to
 * utils/roles.ts in the mobile app. The backend refuses any other role with 403.
 */
export const ROLES = [
  'super_admin',
  'reseller',
  'company_admin',
  'staff',
  'receptionist',
  'doctor',
  'nurse',
  // Industry-neutral equivalents of doctor/nurse, accepted alongside them so a
  // school does not have to store its teachers as doctors. The old ids keep
  // working, so no live Cognito account has to be migrated.
  'practitioner',
  'assistant',
] as const;

export type UserRole = (typeof ROLES)[number];

/**
 * Role labels that read the same in every industry.
 *
 * The three that do not are filled in per industry by `roleLabel`: a
 * `company_admin` is a Hospital Admin in healthcare and a School Admin in
 * education, and `doctor`/`nurse` are a Teacher and an Assistant in a school.
 *
 * The role IDs themselves never change. They are what Cognito stores in
 * `custom:role` and what the backend allow-lists, so renaming one would mean
 * migrating every staff login; only the label moves.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  reseller: 'Reseller',
  company_admin: 'Organisation Admin',
  staff: 'Staff',
  receptionist: 'Receptionist',
  doctor: 'Practitioner',
  nurse: 'Assistant',
  practitioner: 'Practitioner',
  assistant: 'Assistant',
};

/** Front-desk / clinical roles that belong to one hospital. */
export const DESK_ROLES: readonly UserRole[] = [
  'staff', 'receptionist', 'doctor', 'nurse', 'practitioner', 'assistant',
];

/** Roles that may add, edit and remove staff. */
export const STAFF_MANAGER_ROLES: readonly UserRole[] = ['super_admin', 'reseller', 'company_admin'];

export function isKnownRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (ROLES as readonly string[]).includes(role);
}

/**
 * What a role is called, in the vocabulary of the given industry.
 *
 * `industry` is optional so a call site that has no tenant context still gets
 * a sensible neutral label rather than a blank.
 */
export function roleLabel(role: unknown, industry?: unknown): string {
  if (!isKnownRole(role)) return typeof role === 'string' && role ? role : '—';
  const pack = industryPack(industry);
  switch (role) {
    case 'company_admin':
      return `${pack.org} Admin`;
    case 'doctor':
    case 'practitioner':
      return pack.practitioner;
    case 'nurse':
    case 'assistant':
      return pack.assistant;
    default:
      return ROLE_LABELS[role];
  }
}

/** Roles a user may hand out — never above their own level. Mirrors _assignable_roles in the backend. */
export function assignableRoles(role: string | undefined): UserRole[] {
  switch (role) {
    case 'super_admin':
      return [...ROLES];
    case 'reseller':
      return ['company_admin', ...DESK_ROLES];
    case 'company_admin':
      return [...DESK_ROLES];
    default:
      return [];
  }
}

export function canManageStaff(role: string | undefined): boolean {
  return !!role && (STAFF_MANAGER_ROLES as readonly string[]).includes(role);
}

/** A manager may only edit or remove staff whose role they could have assigned. */
export function canManageStaffMember(managerRole: string | undefined, targetRole: unknown): boolean {
  if (!canManageStaff(managerRole)) return false;
  // Legacy rows may hold an old role ("manager", "viewer"…) — treat as staff so an admin can fix them.
  const target = isKnownRole(targetRole) ? targetRole : 'staff';
  return (assignableRoles(managerRole) as string[]).includes(target);
}

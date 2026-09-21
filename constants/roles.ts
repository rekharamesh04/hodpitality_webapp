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
] as const;

export type UserRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  reseller: 'Reseller',
  company_admin: 'Hospital Admin',
  staff: 'Staff',
  receptionist: 'Receptionist',
  doctor: 'Doctor',
  nurse: 'Nurse',
};

/** Front-desk / clinical roles that belong to one hospital. */
export const DESK_ROLES: readonly UserRole[] = ['staff', 'receptionist', 'doctor', 'nurse'];

/** Roles that may add, edit and remove staff. */
export const STAFF_MANAGER_ROLES: readonly UserRole[] = ['super_admin', 'reseller', 'company_admin'];

export function isKnownRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (ROLES as readonly string[]).includes(role);
}

export function roleLabel(role: unknown): string {
  return isKnownRole(role) ? ROLE_LABELS[role] : typeof role === 'string' && role ? role : '—';
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

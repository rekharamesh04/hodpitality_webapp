import type { UserRole } from '@/types';

interface HardcodedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  /** For reseller_admin: their own reseller id. For company_admin: their company id. */
  tenantId?: string;
}

// Hard-coded credentials — replace with real auth when backend is ready
export const HARDCODED_USERS: HardcodedUser[] = [
  // ── Super Admin — sees everything ─────────────────────────────────────────
  {
    id: 'super-1',
    name: 'Manikanta (Super Admin)',
    email: 'super@admin.com',
    password: 'super123',
    role: 'super_admin',
  },

  // ── Reseller Admin — sees Companies tab only (no Resellers tab) ───────────
  {
    id: 'reseller-admin-1',
    name: 'Alex Fernandez (Reseller Admin)',
    email: 'reseller@admin.com',
    password: 'reseller123',
    role: 'reseller_admin',
    tenantId: 'reseller-1',
  },

  // ── Company Admin — sees operational tabs only ────────────────────────────
  {
    id: 'company-admin-1',
    name: 'Dr. Priya Sharma (Company Admin)',
    email: 'company@admin.com',
    password: 'company123',
    role: 'company_admin',
    tenantId: 'company-1',
  },
];

export function findUser(email: string, password: string): HardcodedUser | null {
  return (
    HARDCODED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    ) ?? null
  );
}

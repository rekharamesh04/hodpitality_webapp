import type { UserRole } from '@/types';

interface HardcodedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Hard-coded credentials — replace with real auth when backend is ready
export const HARDCODED_USERS: HardcodedUser[] = [
  // ── Admins ──────────────────────────────────────────────────────────────────
  { id: 'admin-1', name: 'Sarah Mitchell',  email: 'sarah@entryflow.com',   password: 'admin123',    role: 'admin' },
  { id: 'admin-2', name: 'James Cooper',    email: 'james@entryflow.com',    password: 'admin123',    role: 'admin' },
  { id: 'admin-3', name: 'Priya Sharma',    email: 'priya@entryflow.com',    password: 'admin123',    role: 'admin' },

  // ── Resellers ────────────────────────────────────────────────────────────────
  { id: 'reseller-1', name: 'Alex Fernandez', email: 'alex@reseller.com',   password: 'reseller123', role: 'reseller' },
  { id: 'reseller-2', name: 'Nina Walsh',      email: 'nina@reseller.com',   password: 'reseller123', role: 'reseller' },
];

export function findUser(email: string, password: string): HardcodedUser | null {
  return (
    HARDCODED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    ) ?? null
  );
}

import { useAuthStore } from '@/store/auth-store';
import { canPrescribe, isOrgAdmin } from '@/constants/roles';

/**
 * What the signed-in user may do, for deciding which controls to show.
 *
 * Hiding a control is a courtesy, not the permission: the backend refuses the
 * same actions with 403 whatever the screen offers.
 */
export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role);
  return {
    role,
    /** Delete records, refund or reverse payments, export and import in bulk. */
    isAdmin: isOrgAdmin(role),
    /** Write in a staff prescriber's name, amend, cancel or send a prescription. */
    canPrescribe: canPrescribe(role),
  };
}

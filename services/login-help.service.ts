import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Reauth } from '@/services/auth.service';

/**
 * Where someone's sign-in stands, as an administrator may see it. Never a secret.
 * `invited`: they have not signed in and chosen their own password yet.
 */
export interface LoginStatus {
  email: string;
  role: string;
  status: 'invited' | 'active' | 'disabled' | 'reset_required';
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  /** How long a temporary password works (the user pool's setting). */
  tempPasswordDays: number;
  organisation?: string;
}

export const loginHelpService = {
  async status(email: string): Promise<LoginStatus> {
    const { data } = await api.post<LoginStatus>(API_ENDPOINTS.LOGINS.STATUS, { email });
    return data;
  },

  /** A new temporary password, emailed again. Only before they have set their own. */
  async resendInvite(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(API_ENDPOINTS.LOGINS.RESEND_INVITE, { email });
    return data;
  },

  /**
   * Take the authenticator off someone who lost their phone. `proof` and `code` are the
   * ADMINISTRATOR's own password (or Google sign-in) and authenticator code.
   */
  async resetMfa(email: string, proof: Reauth, code: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(API_ENDPOINTS.LOGINS.RESET_MFA, {
      email, ...proof, ...(code ? { code } : {}),
    });
    return data;
  },
};

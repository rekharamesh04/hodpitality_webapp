import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginHelpService } from '@/services/login-help.service';
import type { Reauth } from '@/services/auth.service';

export const loginHelpKeys = {
  status: (email: string) => ['login-help', 'status', email.trim().toLowerCase()] as const,
};

/** Pass `email` only when there is one to look up. 404 is an answer ("no sign-in"), so no retries. */
export function useLoginStatus(email: string, enabled = true) {
  const clean = email.trim().toLowerCase();
  return useQuery({
    queryKey: loginHelpKeys.status(clean),
    queryFn: () => loginHelpService.status(clean),
    enabled: enabled && !!clean,
    retry: false,
    staleTime: 30_000,
  });
}

export function useResendInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => loginHelpService.resendInvite(email),
    onSuccess: (_res, email) => qc.invalidateQueries({ queryKey: loginHelpKeys.status(email) }),
  });
}

export function useResetMfa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, proof, code }: { email: string; proof: Reauth; code: string }) =>
      loginHelpService.resetMfa(email, proof, code),
    onSuccess: (_res, { email }) => qc.invalidateQueries({ queryKey: loginHelpKeys.status(email) }),
  });
}

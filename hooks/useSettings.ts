import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { popup } from '@/lib/popup';
import { settingsService } from "@/services/settings.service";
import { authService } from "@/services/auth.service";
import { QUERY_KEYS } from "@/constants";
import { getFriendlyErrorMessage } from "@/lib/utils";
import type { User, Settings } from "@/types";

export function useSettingsProfile() {
  return useQuery({
    queryKey: [...QUERY_KEYS.SETTINGS, "profile"],
    queryFn:  settingsService.getProfile,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<User>) => settingsService.updateProfile(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
      popup.success("Profile updated");
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update profile")),
  });
}

export function useUpdateOrganisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Settings["organization"]>) =>
      settingsService.updateOrganisation(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
      popup.success("Organisation settings saved");
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to save organisation settings")),
  });
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: Partial<Settings["notifications"]>) =>
      settingsService.updateNotificationPreferences(prefs),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
      popup.success("Notification preferences saved");
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to save preferences")),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string; mfaCode?: string }) =>
      settingsService.changePassword(payload),
    onSuccess: () => popup.success("Password changed successfully"),
    onError:   (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to change password")),
  });
}

const MFA_KEY = [...QUERY_KEYS.SETTINGS, "mfa"];

/** Whether the signed-in user has an authenticator app enrolled. */
export function useMfaStatus() {
  return useQuery({ queryKey: MFA_KEY, queryFn: authService.getMfaStatus, staleTime: 60_000 });
}

/** Step one of enrolling: the setup key for the authenticator app. Errors are shown by the card. */
export function useSetupMfa() {
  return useMutation({ mutationFn: (currentPassword: string) => authService.setupMfa(currentPassword) });
}

/** Step two: the first code from the app switches two-factor on. */
export function useVerifyMfa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ currentPassword, code }: { currentPassword: string; code: string }) =>
      authService.verifyMfa(currentPassword, code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MFA_KEY });
      popup.success("Two-factor authentication is on");
    },
  });
}

export function useDisableMfa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ currentPassword, code }: { currentPassword: string; code: string }) =>
      authService.disableMfa(currentPassword, code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MFA_KEY });
      popup.success("Two-factor authentication is off");
    },
  });
}

export function useOrgTimezone(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SETTINGS, "timezone"],
    queryFn: settingsService.getTimezone,
    enabled: options.enabled ?? true,
    staleTime: 10 * 60_000,
  });
}

export function useUpdateOrgTimezone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (timezone: string) => settingsService.updateTimezone(timezone),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.SETTINGS, "timezone"] });
      popup.success("Timezone saved");
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Could not save the timezone")),
  });
}

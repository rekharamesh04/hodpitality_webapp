import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsService } from "@/services/settings.service";
import { QUERY_KEYS } from "@/constants";
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
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });
}

export function useUpdateOrganisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Settings["organization"]>) =>
      settingsService.updateOrganisation(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
      toast.success("Organisation settings saved");
    },
    onError: () => toast.error("Failed to save organisation settings"),
  });
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: Partial<Settings["notifications"]>) =>
      settingsService.updateNotificationPreferences(prefs),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS });
      toast.success("Notification preferences saved");
    },
    onError: () => toast.error("Failed to save preferences"),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      settingsService.changePassword(payload),
    onSuccess: () => toast.success("Password changed successfully"),
    onError:   () => toast.error("Failed to change password"),
  });
}

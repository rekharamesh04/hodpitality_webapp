import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredentials } from "@/types";

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (creds: LoginCredentials) => authService.login(creds),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Login failed");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      qc.clear();
      router.push("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success("OTP sent! Check your email.");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to send OTP");
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyOtp(email, otp),
    onError: (err: Error) => {
      toast.error(err.message ?? "Invalid OTP");
    },
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ resetToken, password }: { resetToken: string; password: string }) =>
      authService.resetPassword(resetToken, password),
    onSuccess: () => {
      toast.success("Password reset successfully!");
      router.push("/login");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Reset failed");
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: authService.getMe,
    staleTime: 1000 * 60 * 15,
  });
}

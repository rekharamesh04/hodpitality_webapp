'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { LogoMark } from '@/components/brand/LogoMark';
import { useAuthStore } from '@/store';
import { authService } from '@/services/auth.service';
import { getFriendlyErrorMessage } from '@/lib/utils';
import { SIGN_OUT_REASON_KEY } from '@/lib/axios';
import { isKnownRole } from '@/constants/roles';
import { popup } from '@/lib/popup';
import type { AuthResponse } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const newPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Must be at least 8 characters'),
  confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

const mfaSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
type MfaFormData = z.infer<typeof mfaSchema>;

/** A step Cognito asks for before it issues a session. */
interface PendingChallenge {
  kind: 'new_password' | 'mfa';
  session: string;
  email: string;
}

/**
 * Staff accounts are created by an administrator (Staff page, or a company or reseller invite), so
 * there is no self sign-up: the backend has no such route. Google sign-in is offered only where it
 * is configured, and only signs in an account that already exists.
 */
const GOOGLE_ENABLED = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<PendingChallenge | null>(null);
  // Why the app ended the last session (e.g. the organisation was suspended), shown once.
  const [signOutReason, setSignOutReason] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const newPwForm = useForm<NewPasswordFormData>({ resolver: zodResolver(newPasswordSchema) });
  const mfaForm = useForm<MfaFormData>({ resolver: zodResolver(mfaSchema) });

  useEffect(() => {
    try {
      const reason = sessionStorage.getItem(SIGN_OUT_REASON_KEY);
      if (reason) {
        setSignOutReason(reason);
        sessionStorage.removeItem(SIGN_OUT_REASON_KEY);
      }
    } catch {
      // Storage unavailable: nothing to show.
    }
  }, []);

  /** A login response is a session, or a step still to take. */
  function handleAuthResult(result: AuthResponse, email: string) {
    if (result.ChallengeName === 'NEW_PASSWORD_REQUIRED' || result.ChallengeName === 'SOFTWARE_TOKEN_MFA') {
      if (!result.Session) {
        popup.error('Unexpected response from server. Please try again.');
        return;
      }
      newPwForm.reset();
      mfaForm.reset();
      setChallenge({
        kind: result.ChallengeName === 'SOFTWARE_TOKEN_MFA' ? 'mfa' : 'new_password',
        session: result.Session,
        email: result.email ?? email,
      });
      return;
    }
    if (result.ChallengeName) {
      // MFA_SETUP and friends: only offered when the pool requires MFA, which it does not.
      setChallenge(null);
      popup.error(result.message || 'This account needs a sign-in step the portal cannot complete. Contact your administrator.');
      return;
    }
    if (!result.token) {
      popup.error('Login failed: no session token received.');
      return;
    }
    completeLogin(result);
  }

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setSignOutReason(null);
    try {
      handleAuthResult(await authService.login(data), data.email);
    } catch (err: any) {
      const status = err?.response?.status;
      const backendMsg = err?.backendMessage ?? err?.response?.data?.error ?? err?.response?.data?.message;
      console.error('[LOGIN] failed — status:', status);

      const rawError = String(backendMsg ?? '');
      const isCognitoMisconfigured =
        rawError.includes('ResourceNotFoundException') ||
        rawError.includes('does not exist') ||
        rawError.includes('User pool client');

      if (isCognitoMisconfigured) {
        console.error('[LOGIN] The Cognito User Pool Client configured on the backend does not exist. Check the Lambda environment.');
        popup.error('Backend misconfiguration: Cognito User Pool Client not found. Contact your administrator.');
      } else if (status === 401) {
        popup.error('Invalid email or password.');
      } else if (status === 500) {
        popup.error(backendMsg || 'Server error. Please try again later or contact support.');
      } else {
        popup.error(backendMsg || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onNewPasswordSubmit = async (data: NewPasswordFormData) => {
    if (!challenge) return;
    setIsLoading(true);
    try {
      const result = await authService.respondChallenge({
        email: challenge.email,
        session: challenge.session,
        newPassword: data.newPassword,
      });
      // Setting a first password can itself be followed by a code request.
      handleAuthResult(result, challenge.email);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Unknown error';
      popup.error(`Failed to set password: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onMfaSubmit = async (data: MfaFormData) => {
    if (!challenge) return;
    setIsLoading(true);
    try {
      const result = await authService.respondMfa({
        email: challenge.email,
        session: challenge.session,
        code: data.code,
      });
      handleAuthResult(result, challenge.email);
    } catch (err: any) {
      const msg = err?.backendMessage ?? err?.response?.data?.error;
      if (err?.response?.status === 401 && /expired/i.test(String(msg ?? ''))) {
        // The Cognito session behind this step lasts minutes; start again.
        setChallenge(null);
      }
      popup.error(msg || 'That code was not accepted. Please try again.');
      mfaForm.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleCredential = async (idToken: string) => {
    setIsLoading(true);
    setSignOutReason(null);
    try {
      handleAuthResult(await authService.loginWithGoogle(idToken), '');
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      const backendMsg = err?.backendMessage ?? body?.message ?? body?.error;
      console.error('[GOOGLE-LOGIN] failed — status:', status);

      const rawError = String(backendMsg ?? '');
      if (rawError.includes('ResourceNotFoundException') || rawError.includes('does not exist') || rawError.includes('User pool client')) {
        popup.error('Backend misconfiguration: Cognito User Pool Client not found. Contact your administrator.');
      } else if (rawError.includes('Failed to issue session')) {
        popup.error('Google sign-in failed. Please try again, or sign in with your email and password.');
      } else if (status === 501) {
        popup.error('Google sign-in is not enabled yet. Please sign in with your email and password.');
      } else if (status === 403) {
        popup.error(backendMsg || 'This Google account is not registered. Ask your administrator to invite you first.');
      } else if (status === 401) {
        popup.error(backendMsg ?? 'Google token verification failed. Please try again.');
      } else {
        popup.error(backendMsg ?? getFriendlyErrorMessage(err, 'Google sign-in failed.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  function completeLogin(result: AuthResponse) {
    // Only the official staff roles (constants/roles.ts) get in. The backend 403s every other
    // role (patient, a blank role, or an old value like "manager"), so letting the session
    // through would land them on a dashboard where nothing loads.
    if (!isKnownRole(result.user.role)) {
      console.warn('[COMPLETE-LOGIN] ── BLOCKED: unrecognised role', result.user.role);
      setChallenge(null);
      popup.error(
        (result.user.role as string) === 'patient'
          ? 'This portal is for staff only.'
          : 'Your account has no valid role. Ask your administrator to set your role.'
      );
      return;
    }
    const user = {
      ...result.user,
      name: result.user.name || result.user.email.split('@')[0],
      createdAt: result.user.createdAt ?? new Date().toISOString(),
      updatedAt: result.user.updatedAt ?? new Date().toISOString(),
    };
    login(user, { token: result.token, refreshToken: result.refreshToken, accessToken: result.accessToken });
    popup.success('Login successful!');
    window.location.href = '/dashboard';
  }

  const backToLogin = (
    <Button
      type="button"
      variant="ghost"
      className="w-full text-sm"
      onClick={() => setChallenge(null)}
      disabled={isLoading}
    >
      ← Back to login
    </Button>
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <Card className="border-border/60 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mb-4 flex justify-center">
              <LogoMark className="h-14 w-14 rounded-2xl shadow-[var(--shadow-primary)]" title="EntryFlow" />
            </div>
            <AnimatePresence mode="wait">
              {challenge ? (
                <motion.div key={`challenge-${challenge.kind}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-2 flex justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      {challenge.kind === 'mfa'
                        ? <ShieldCheck className="h-5 w-5 text-primary" />
                        : <KeyRound className="h-5 w-5 text-primary" />}
                    </div>
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {challenge.kind === 'mfa' ? 'Two-factor authentication' : 'Set your password'}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {challenge.kind === 'mfa'
                      ? 'Enter the 6-digit code from your authenticator app.'
                      : 'You received a temporary password. Create a permanent one to continue.'}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Sign in to your EntryFlow Admin account</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent className="pt-6">
            {signOutReason && !challenge && (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription>{signOutReason}</AlertDescription>
              </Alert>
            )}
            <AnimatePresence mode="wait">
              {challenge?.kind === 'mfa' ? (
                <motion.form
                  key="mfa-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={mfaForm.handleSubmit(onMfaSubmit)}
                  className="space-y-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Signing in as <span className="font-medium text-foreground">{challenge.email}</span>
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="mfa-code">Authentication code</Label>
                    <Input
                      id="mfa-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="123456"
                      className="text-center text-lg tracking-[0.4em]"
                      autoFocus
                      {...mfaForm.register('code')}
                      disabled={isLoading}
                    />
                    {mfaForm.formState.errors.code && (
                      <p className="text-sm text-destructive">{mfaForm.formState.errors.code.message}</p>
                    )}
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify &amp; Sign In
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Lost your phone? Ask your administrator to reset your account.
                  </p>
                  {backToLogin}
                </motion.form>
              ) : challenge?.kind === 'new_password' ? (
                <motion.form
                  key="new-password-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={newPwForm.handleSubmit(onNewPasswordSubmit)}
                  className="space-y-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Signing in as <span className="font-medium text-foreground">{challenge.email}</span>
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <PasswordInput
                      showLeftIcon
                      id="newPassword"
                      placeholder="Min. 8 characters"
                      {...newPwForm.register('newPassword')}
                      disabled={isLoading}
                    />
                    {newPwForm.formState.errors.newPassword && (
                      <p className="text-sm text-destructive">{newPwForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <PasswordInput
                      showLeftIcon
                      id="confirm"
                      placeholder="Re-enter new password"
                      {...newPwForm.register('confirm')}
                      disabled={isLoading}
                    />
                    {newPwForm.formState.errors.confirm && (
                      <p className="text-sm text-destructive">{newPwForm.formState.errors.confirm.message}</p>
                    )}
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Set Password &amp; Sign In
                  </Button>
                  {backToLogin}
                </motion.form>
              ) : (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {GOOGLE_ENABLED && (
                    <>
                      <GoogleSignInButton onCredential={onGoogleCredential} disabled={isLoading} text="signin_with" />

                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">or continue with email</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    </>
                  )}

                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@entryflow.com"
                          className="pl-9"
                          {...loginForm.register('email')}
                          disabled={isLoading}
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <PasswordInput
                        showLeftIcon
                        id="password"
                        placeholder="••••••••"
                        {...loginForm.register('password')}
                        disabled={isLoading}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign in
                    </Button>
                  </form>
                  <p className="text-center text-xs text-muted-foreground">
                    Accounts are created by your administrator. Check your email for an invitation.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

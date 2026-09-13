'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, KeyRound, Mail, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuthStore } from '@/store';
import { authService } from '@/services/auth.service';
import { getFriendlyErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';

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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface PendingChallenge {
  session: string;
  email: string;
}

const SHOW_GOOGLE_AND_REGISTER = true;

export default function LoginPage() {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<PendingChallenge | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const newPwForm = useForm<NewPasswordFormData>({ resolver: zodResolver(newPasswordSchema) });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);

      if (result.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        if (!result.Session) {
          toast.error('Unexpected response from server. Please try again.');
          return;
        }
        setChallenge({ session: result.Session, email: result.email ?? data.email });
        return;
      }

      if (!result.token) {
        toast.error('Login failed: no session token received.');
        return;
      }

      completeLogin(result);
    } catch (err: any) {
      const status = err?.response?.status;
      const backendMsg = err?.backendMessage ?? err?.response?.data?.error ?? err?.response?.data?.message;
      console.error('[LOGIN] failed — status:', status, 'body:', err?.response?.data);

      // Diagnose specific backend configuration issues
      const rawError = String(backendMsg ?? '');
      const isCognitoMisconfigured =
        rawError.includes('ResourceNotFoundException') ||
        rawError.includes('does not exist') ||
        rawError.includes('User pool client');

      if (isCognitoMisconfigured) {
        console.error(
          '[LOGIN] ── DIAGNOSIS: The Cognito User Pool Client ID configured on the backend Lambda does not exist.\n' +
          '   This is an AWS backend configuration issue, NOT a frontend problem.\n' +
          '   Fix: Go to AWS Console → Cognito → User Pool → App clients and verify the client ID.\n' +
          '   Then update the Lambda environment variable (e.g. COGNITO_CLIENT_ID) with the correct value.'
        );
        toast.error('Backend misconfiguration: Cognito User Pool Client not found. Contact your administrator.');
      } else if (status === 401) {
        toast.error('Invalid email or password.');
      } else if (status === 500) {
        console.error('[LOGIN] ── Backend 500 error. Raw message:', rawError);
        toast.error(backendMsg || 'Server error. Please try again later or contact support.');
      } else {
        toast.error(backendMsg || 'Login failed. Please try again.');
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
      if (!result.token) {
        console.warn('[CHALLENGE] No token in response — cannot complete login');
        toast.error('Password set, but no token received. Please log in again.');
        setChallenge(null);
        return;
      }
      toast.success('Password set! Logging you in…');
      completeLogin(result);
    } catch (err: any) {
      console.error('[CHALLENGE] HTTP status:', err?.response?.status, err?.response?.data);
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Unknown error';
      toast.error(`Failed to set password: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authService.register({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created! Please sign in.');
      loginForm.setValue('email', data.email);
      registerForm.reset();
      setMode('login');
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      console.error('[REGISTER] caught error — status:', status, 'body:', body);
      const msg = body?.error ?? body?.message ?? err?.message ?? 'Unknown error';
      toast.error(`Registration failed (${status ?? 'no status'}): ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleCredential = async (idToken: string) => {
    console.log('[GOOGLE-LOGIN] ── Step 1: Received Google ID token from GIS popup');
    // Decode the Google token to show which email is being used (public claims only)
    try {
      const claims = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      console.log('[GOOGLE-LOGIN] ── Step 2: Google user email:', claims.email, '| name:', claims.name, '| sub:', claims.sub);
    } catch { console.log('[GOOGLE-LOGIN] ── Step 2: Could not decode token claims (non-blocking)'); }

    setIsLoading(true);
    try {
      console.log('[GOOGLE-LOGIN] ── Step 3: Calling POST /auth/google on backend...');
      const result = await authService.loginWithGoogle(idToken);
      console.log('[GOOGLE-LOGIN] ── Step 4: Backend returned SUCCESS ✅', JSON.stringify({
        hasToken: !!result.token,
        hasRefreshToken: !!result.refreshToken,
        hasAccessToken: !!result.accessToken,
        userEmail: result.user?.email,
        userRole: result.user?.role,
        userName: result.user?.name,
      }));
      completeLogin(result);
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      const backendMsg = err?.backendMessage ?? body?.message ?? body?.error;
      console.error('[GOOGLE-LOGIN] ── Step 4: Backend returned ERROR ❌', {
        status,
        body,
        backendMsg,
        fullError: err?.message,
      });

      // Diagnose specific backend configuration issues
      const rawError = String(backendMsg ?? '');
      const isCognitoMisconfigured =
        rawError.includes('ResourceNotFoundException') ||
        rawError.includes('does not exist') ||
        rawError.includes('User pool client');
      const isSessionIssueFailed = rawError.includes('Failed to issue session');

      if (isCognitoMisconfigured) {
        console.error(
          '[GOOGLE-LOGIN] ── DIAGNOSIS: Cognito User Pool Client is missing/deleted.\n' +
          '   The Lambda tried to create a Cognito session after verifying the Google token,\n' +
          '   but the User Pool Client ID it\'s configured with does not exist.\n' +
          '   Fix: AWS Console → Cognito → User Pool → App clients → copy correct client ID → update Lambda env var.'
        );
        toast.error('Backend misconfiguration: Cognito User Pool Client not found. Contact your administrator.');
      } else if (isSessionIssueFailed) {
        console.error(
          '[GOOGLE-LOGIN] ── DIAGNOSIS: Google token was verified OK, but the Lambda failed to create a Cognito session.\n' +
          '   Likely causes:\n' +
          '   1. The Cognito User Pool Client ID on the Lambda is wrong or deleted\n' +
          '   2. The user (manikanta@araisolution.com) does not exist in the Cognito User Pool\n' +
          '   3. The Lambda\'s IAM role lacks cognito-idp:AdminInitiateAuth permission\n' +
          '   Check the Lambda\'s CloudWatch logs for the full stack trace.'
        );
        toast.error('Google sign-in failed: backend could not create your session. Check the server logs or contact admin.');
      } else if (status === 501) {
        console.error('[GOOGLE-LOGIN] ── Diagnosis: GOOGLE_CLIENT_ID is not set on the Lambda. Ask your backend admin to add it.');
        toast.error('Google sign-in is not enabled yet. Please sign in with your email and password.');
      } else if (status === 403) {
        console.error('[GOOGLE-LOGIN] ── Diagnosis: This Google email is NOT registered as a staff member in Cognito.',
          'You must first invite this email via POST /staff or the admin panel before they can Google sign-in.');
        toast.error(backendMsg || 'This Google account is not registered. Ask your administrator to invite you first.');
      } else if (status === 401) {
        console.error('[GOOGLE-LOGIN] ── Diagnosis: Lambda could not verify the Google token. Check that GOOGLE_CLIENT_ID on Lambda matches NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local.');
        toast.error(backendMsg ?? 'Google token verification failed. Please try again.');
      } else {
        console.error('[GOOGLE-LOGIN] ── Unhandled error. Status:', status, 'Message:', rawError);
        toast.error(backendMsg ?? getFriendlyErrorMessage(err, 'Google sign-in failed.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  function completeLogin(result: Awaited<ReturnType<typeof authService.login>>) {
    console.log('[COMPLETE-LOGIN] ── Step 5: Processing login result...', {
      userEmail: result.user?.email,
      userRole: result.user?.role,
      hasToken: !!result.token,
      tokenPrefix: result.token?.substring(0, 20) + '...',
    });

    // Patients have no admin portal — the backend 403s them on every business API, so letting
    // the session through would land them on a dashboard where nothing loads.
    if ((result.user.role as string) === 'patient') {
      console.warn('[COMPLETE-LOGIN] ── BLOCKED: User role is "patient" — admin portal is staff-only.');
      toast.error('This portal is for staff only.');
      return;
    }
    const user = {
      ...result.user,
      name: result.user.name || result.user.email.split('@')[0],
      createdAt: result.user.createdAt ?? new Date().toISOString(),
      updatedAt: result.user.updatedAt ?? new Date().toISOString(),
    };
    console.log('[COMPLETE-LOGIN] ── Step 6: Persisting session to Zustand store + localStorage + cookie...');
    login(user, { token: result.token, refreshToken: result.refreshToken, accessToken: result.accessToken });
    console.log('[COMPLETE-LOGIN] ── Step 7: Session persisted ✅ Redirecting to /dashboard...');
    toast.success('Login successful!');
    window.location.href = '/dashboard';
  }

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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-[var(--shadow-primary)]">
                <span className="text-2xl font-bold text-white">E</span>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {challenge ? (
                <motion.div key="challenge" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-2 flex justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <KeyRound className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">Set your password</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You received a temporary password. Create a permanent one to continue.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {mode === 'register' ? 'Create your account' : 'Welcome back'}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {mode === 'register'
                      ? 'Sign up for your EntryFlow Admin account'
                      : 'Sign in to your EntryFlow Admin account'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!challenge && SHOW_GOOGLE_AND_REGISTER && (
              <div className="mx-auto mt-5 flex w-full max-w-[280px] rounded-full bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  disabled={isLoading}
                  className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
                    mode === 'login'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  disabled={isLoading}
                  className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
                    mode === 'register'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Create account
                </button>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {challenge ? (
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
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => setChallenge(null)}
                    disabled={isLoading}
                  >
                    ← Back to login
                  </Button>
                </motion.form>
              ) : mode === 'register' && SHOW_GOOGLE_AND_REGISTER ? (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <GoogleSignInButton onCredential={onGoogleCredential} disabled={isLoading} text="signup_with" />

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">or continue with email</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Jane Doe"
                          className="pl-9"
                          {...registerForm.register('name')}
                          disabled={isLoading}
                        />
                      </div>
                      {registerForm.formState.errors.name && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="admin@entryflow.com"
                          className="pl-9"
                          {...registerForm.register('email')}
                          disabled={isLoading}
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <PasswordInput
                        showLeftIcon
                        id="reg-password"
                        placeholder="Min. 8 characters"
                        {...registerForm.register('password')}
                        disabled={isLoading}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm">Confirm password</Label>
                      <PasswordInput
                        showLeftIcon
                        id="reg-confirm"
                        placeholder="Re-enter password"
                        {...registerForm.register('confirm')}
                        disabled={isLoading}
                      />
                      {registerForm.formState.errors.confirm && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.confirm.message}</p>
                      )}
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Sparkles className="mr-1 h-4 w-4" />
                      Create account
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {SHOW_GOOGLE_AND_REGISTER && (
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
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

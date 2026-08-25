'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, KeyRound, Mail, Lock, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuthStore } from '@/store';
import { authService } from '@/services/auth.service';
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
    // TEMP: local-only login — the backend's /auth/login requires real Cognito
    // credentials we don't have, so any email/password logs in locally without
    // an API call. Swap back to authService.login(data) + the NEW_PASSWORD_REQUIRED
    // challenge handling once real backend auth works again.
    completeLogin({
      token: `local-session-${Date.now()}`,
      user: {
        id: data.email,
        email: data.email,
        name: data.email.split('@')[0],
        role: 'admin',
      },
    });
    setIsLoading(false);
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
    setIsLoading(true);
    try {
      // TEMP: local-only Google login — no backend to verify the token against
      // (no /auth/google, no AWS), so we trust Google's own signature and read
      // the identity straight out of the ID token in the browser. The token IS
      // a real, signed assertion from Google (the user just completed a real
      // Google sign-in) — we're just not doing server-side verification of it.
      const payload = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      completeLogin({
        token: `local-google-session-${Date.now()}`,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          avatar: payload.picture,
          role: 'admin',
        },
      });
    } catch (err: any) {
      console.error('[GOOGLE] failed to decode credential:', err);
      toast.error('Google sign-in failed: could not read your Google profile.');
    } finally {
      setIsLoading(false);
    }
  };

  function completeLogin(result: Awaited<ReturnType<typeof authService.login>>) {
    const user = {
      ...result.user,
      name: result.user.name || result.user.email.split('@')[0],
      createdAt: result.user.createdAt ?? new Date().toISOString(),
      updatedAt: result.user.updatedAt ?? new Date().toISOString(),
    };
    login(user, result.token);
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
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Min. 8 characters"
                        className="pl-9"
                        {...newPwForm.register('newPassword')}
                        disabled={isLoading}
                      />
                    </div>
                    {newPwForm.formState.errors.newPassword && (
                      <p className="text-sm text-destructive">{newPwForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type="password"
                        placeholder="Re-enter new password"
                        className="pl-9"
                        {...newPwForm.register('confirm')}
                        disabled={isLoading}
                      />
                    </div>
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
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="Min. 8 characters"
                          className="pl-9"
                          {...registerForm.register('password')}
                          disabled={isLoading}
                        />
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm">Confirm password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="reg-confirm"
                          type="password"
                          placeholder="Re-enter password"
                          className="pl-9"
                          {...registerForm.register('confirm')}
                          disabled={isLoading}
                        />
                      </div>
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
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          {...loginForm.register('password')}
                          disabled={isLoading}
                        />
                      </div>
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

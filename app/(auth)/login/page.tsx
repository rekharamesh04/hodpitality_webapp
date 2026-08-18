'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

type LoginFormData = z.infer<typeof loginSchema>;
type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

interface PendingChallenge {
  session: string;
  email: string;
}

export default function LoginPage() {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<PendingChallenge | null>(null);

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const newPwForm = useForm<NewPasswordFormData>({ resolver: zodResolver(newPasswordSchema) });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);
      if (result.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        // First-time login: backend requires a permanent password to be set
        setChallenge({ session: result.Session!, email: result.email ?? data.email });
        return;
      }
      if (!result.token) {
        toast.error('Login failed: no token received. Check console for details.');
        return;
      }
      completeLogin(result);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Unknown error';
      console.error('[LOGIN] caught error:', status, msg);
      toast.error(msg === 'Invalid credentials' ? 'Incorrect email or password.' : `Login failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onNewPasswordSubmit = async (data: NewPasswordFormData) => {
    if (!challenge) return;
    setIsLoading(true);
    console.log('[CHALLENGE] submitting with email:', challenge.email, 'session length:', challenge.session?.length);
    try {
      const result = await authService.respondChallenge({
        email: challenge.email,
        session: challenge.session,
        newPassword: data.newPassword,
      });
      console.log('[CHALLENGE] respond-challenge raw result:', JSON.stringify(result));
      console.log('[CHALLENGE] token present?', !!result.token);
      console.log('[CHALLENGE] user present?', !!result.user);
      if (!result.token) {
        console.warn('[CHALLENGE] No token in response — cannot complete login');
        toast.error('Password set, but no token received. Please log in again.');
        setChallenge(null);
        return;
      }
      toast.success('Password set! Logging you in…');
      completeLogin(result);
    } catch (err: any) {
      console.error('[CHALLENGE] HTTP status:', err?.response?.status);
      console.error('[CHALLENGE] full error response:', JSON.stringify(err?.response?.data));
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message ?? 'Unknown error';
      toast.error(`Failed to set password: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  function completeLogin(result: Awaited<ReturnType<typeof authService.login>>) {
    console.log('[LOGIN] completeLogin called with token:', result.token?.slice(0, 20) + '...');
    console.log('[LOGIN] completeLogin user:', JSON.stringify(result.user));
    const user = {
      ...result.user,
      name: result.user.name || result.user.email.split('@')[0],
      createdAt: result.user.createdAt ?? new Date().toISOString(),
      updatedAt: result.user.updatedAt ?? new Date().toISOString(),
    };
    login(user, result.token);
    console.log('[LOGIN] auth store updated, cookie set, redirecting to /dashboard...');
    console.log('[LOGIN] cookie value after set:', document.cookie.includes('auth_token') ? 'auth_token cookie IS present' : 'auth_token cookie MISSING');
    toast.success('Login successful!');
    window.location.href = '/dashboard';
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
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
                  <CardTitle className="text-2xl">Set your password</CardTitle>
                  <CardDescription>
                    You received a temporary password. Create a permanent one to continue.
                  </CardDescription>
                </motion.div>
              ) : (
                <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>Sign in to your EntryFlow Admin account</CardDescription>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent>
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
                    <Input
                      id="newPassword"
                      type="password"
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
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Re-enter new password"
                      {...newPwForm.register('confirm')}
                      disabled={isLoading}
                    />
                    {newPwForm.formState.errors.confirm && (
                      <p className="text-sm text-destructive">{newPwForm.formState.errors.confirm.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
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
              ) : (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@entryflow.com"
                      {...loginForm.register('email')}
                      disabled={isLoading}
                    />
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
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                      disabled={isLoading}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidEmail } from '@/lib/utils';
import { SignInAccessCard } from './SignInAccessCard';

/**
 * Look a sign-in up by email. Reaches logins no list shows — a platform super admin, or an
 * organisation's own admin address — so an expired invitation or a lost phone can always be fixed.
 */
export function SignInHelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [draft, setDraft] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function lookUp(e: React.FormEvent) {
    e.preventDefault();
    const clean = draft.trim().toLowerCase();
    if (!isValidEmail(clean)) { setError('Enter a valid email address.'); return; }
    setError('');
    setEmail(clean);
  }

  function close(next: boolean) {
    if (!next) { setDraft(''); setEmail(''); setError(''); }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Sign-in help</DialogTitle>
          <DialogDescription>
            Check whether someone has set their password, send their invitation again, or reset a lost authenticator.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={lookUp} className="flex items-end gap-2" noValidate>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="sign-in-help-email">Their email</Label>
            <Input
              id="sign-in-help-email"
              type="email"
              autoComplete="off"
              placeholder="name@example.com"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Look up
          </Button>
        </form>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        {email && (
          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium break-all">{email}</p>
            <SignInAccessCard key={email} email={email} bare />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

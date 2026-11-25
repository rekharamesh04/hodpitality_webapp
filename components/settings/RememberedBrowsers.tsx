'use client';

import { Laptop, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useForgetRememberedBrowsers, useRememberedBrowsers } from '@/hooks/useSettings';
import { forgetRememberedBrowser, rememberedBrowserFor } from '@/lib/remembered-browser';
import { useAuthStore } from '@/store';

function day(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

/**
 * The browsers where this person ticked "Remember this browser": no authenticator code there
 * until the date shown. Forgetting one makes it ask for the code again at the next sign-in.
 */
export function RememberedBrowsers() {
  const email = useAuthStore((s) => s.user?.email ?? '');
  const list = useRememberedBrowsers();
  const forget = useForgetRememberedBrowsers();
  const thisKey = rememberedBrowserFor(email)?.key;
  const devices = list.data?.devices ?? [];

  function forgetOne(key: string) {
    forget.mutate(key, { onSuccess: () => { if (key === thisKey) forgetRememberedBrowser(email); } });
  }

  function forgetAll() {
    forget.mutate(undefined, { onSuccess: () => forgetRememberedBrowser(email) });
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium"><Laptop className="h-4 w-4" aria-hidden="true" /> Remembered browsers</p>
        {devices.length > 1 && (
          <Button variant="ghost" size="sm" onClick={forgetAll} disabled={forget.isPending}>Forget all</Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Where you ticked &ldquo;Remember this browser&rdquo; when signing in: only your password is asked for there until
        the date shown. Changing your password forgets them all.
      </p>
      {list.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {list.isError && <p className="text-sm text-destructive">Could not load your remembered browsers.</p>}
      {list.data && devices.length === 0 && <p className="text-sm text-muted-foreground">None — a code is asked for at every sign-in.</p>}
      <ul className="space-y-2">
        {devices.map((d) => (
          <li key={d.key} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="font-medium">{d.name}</span>
              {d.key === thisKey && <Badge variant="secondary" className="ml-2">This browser</Badge>}
              <span className="block text-xs text-muted-foreground">
                {d.lastUsedAt && `Last used ${day(d.lastUsedAt)} · `}{d.expiresAt && `asks again after ${day(d.expiresAt)}`}
              </span>
            </span>
            <Button variant="ghost" size="icon" aria-label={`Forget ${d.name}`} onClick={() => forgetOne(d.key)} disabled={forget.isPending}>
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

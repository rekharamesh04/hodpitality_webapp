'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Runs a page action requested through the URL — e.g. `/guests?action=add` from the dashboard
 * Quick Actions or the ⌘K palette — then removes `action` from the URL so a refresh or the
 * back button doesn't re-open the dialog.
 *
 * Pages using this must render inside a <Suspense> boundary (it reads `useSearchParams`).
 */
export function useActionParam(handlers: Record<string, () => void>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get('action');
  const handled = useRef<string | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!action) {
      handled.current = null;
      return;
    }
    if (handled.current === action) return;
    const handler = handlersRef.current[action];
    if (!handler) return;
    handled.current = action;
    handler();

    const params = new URLSearchParams(searchParams.toString());
    params.delete('action');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [action, pathname, router, searchParams]);
}

'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePopupStore, type PopupVariant } from '@/store/popup-store';

const VARIANT_STYLES: Record<
  PopupVariant,
  { Icon: typeof Info; iconClass: string; ringClass: string; button: ButtonProps['variant'] }
> = {
  success: { Icon: CheckCircle2,  iconClass: 'text-success',     ringClass: 'bg-success/10 ring-success/20',         button: 'success' },
  error:   { Icon: XCircle,       iconClass: 'text-destructive', ringClass: 'bg-destructive/10 ring-destructive/20', button: 'destructive' },
  warning: { Icon: AlertTriangle, iconClass: 'text-warning',     ringClass: 'bg-warning/10 ring-warning/20',         button: 'warning' },
  info:    { Icon: Info,          iconClass: 'text-info',        ringClass: 'bg-info/10 ring-info/20',               button: 'default' },
};

/**
 * Renders application messages as a modal popup, one at a time, from the queue in
 * `store/popup-store`. Mounted once in `providers/index.tsx`; push messages with the
 * `popup` helper in `lib/popup.ts` rather than rendering this directly.
 *
 * Built on Radix's Dialog rather than a hand-rolled overlay because popups routinely open
 * on top of an already-open form dialog. Radix keeps a stack of dismissable layers, so the
 * popup — always the newest layer — is the only one that answers Escape or an outside click.
 * A plain portal sits outside that stack, and clicking it would dismiss the form underneath
 * and throw away whatever the user had typed.
 */
export function PopupHost() {
  const current = usePopupStore((s) => s.queue[0] ?? null);
  const dismiss = usePopupStore((s) => s.dismiss);

  const actionRef = React.useRef<HTMLButtonElement>(null);

  const open = current !== null;
  const currentId = current?.id ?? null;
  const duration = current?.duration;

  const close = React.useCallback(() => {
    if (currentId) dismiss(currentId);
  }, [currentId, dismiss]);

  /* Optional auto-dismiss, for messages pushed with a `duration`. */
  React.useEffect(() => {
    if (!currentId || !duration) return;
    const timer = window.setTimeout(() => dismiss(currentId), duration);
    return () => window.clearTimeout(timer);
  }, [currentId, duration, dismiss]);

  const variant = VARIANT_STYLES[current?.variant ?? 'info'];
  const { Icon } = variant;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <DialogPrimitive.Portal>
        {/* data-slot drives the shared overlay keyframes in globals.css. */}
        <DialogPrimitive.Overlay
          data-slot="dialog-overlay"
          className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm"
        />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          aria-labelledby="app-popup-title"
          aria-describedby={current?.description ? 'app-popup-description' : undefined}
          onOpenAutoFocus={(event) => {
            // Land on the dismiss button rather than the close "X", so Enter closes the popup.
            event.preventDefault();
            actionRef.current?.focus();
          }}
          className={cn(
            'fixed left-1/2 top-1/2 z-[120] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2',
            'max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain',
            'rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[var(--shadow-floating)]',
            // The panel itself takes focus on open; the dismiss button carries the visible ring.
            'focus:outline-none'
          )}
        >
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-70 transition-opacity hover:bg-accent hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>

          {/* Re-keyed per message so the next one in the queue fades its content in. */}
          <div key={currentId ?? 'empty'} className="animate-fade-in flex flex-col items-center text-center">
            <span className={cn('flex h-14 w-14 items-center justify-center rounded-full ring-8', variant.ringClass)}>
              <Icon className={cn('h-7 w-7', variant.iconClass)} aria-hidden="true" />
            </span>

            <DialogPrimitive.Title id="app-popup-title" className="mt-4 text-base font-semibold leading-snug text-balance">
              {current?.title}
            </DialogPrimitive.Title>

            {current?.description && (
              <DialogPrimitive.Description
                id="app-popup-description"
                className="mt-2 text-sm leading-relaxed text-muted-foreground"
              >
                {current.description}
              </DialogPrimitive.Description>
            )}

            <Button ref={actionRef} variant={variant.button} className="mt-6 w-full" onClick={close}>
              OK
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

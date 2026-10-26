'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePopupStore, type PopupVariant } from '@/store/popup-store';

const VARIANT_STYLES: Record<
  PopupVariant,
  { Icon: typeof Info; label: string; tile: string; text: string; bar: string }
> = {
  success: { Icon: CheckCircle2,  label: 'Success', tile: 'bg-success/10 text-success',         text: 'text-success',     bar: 'bg-success' },
  error:   { Icon: XCircle,       label: 'Error',   tile: 'bg-destructive/10 text-destructive', text: 'text-destructive', bar: 'bg-destructive' },
  warning: { Icon: AlertTriangle, label: 'Warning', tile: 'bg-warning/10 text-warning',         text: 'text-warning',     bar: 'bg-warning' },
  info:    { Icon: Info,          label: 'Notice',  tile: 'bg-primary/10 text-primary',         text: 'text-primary',     bar: 'bg-primary' },
};

/**
 * How long a success message stays up when the caller sets no `duration`. Good news needs no
 * answer, so it closes itself; an error, warning or notice waits for "OK" so it is never missed.
 */
function autoCloseAfter(variant: PopupVariant, hasDescription: boolean): number | undefined {
  if (variant !== 'success') return undefined;
  return hasDescription ? 4000 : 2600;
}

/**
 * Renders application messages as a modal popup, one at a time, from the queue in
 * `store/popup-store`. Mounted once in `providers/index.tsx`; push messages with the
 * `popup` helper in `lib/popup.ts` rather than rendering this directly.
 *
 * A compact card: a coloured icon tile and a one-word kind ("Error", "Success") beside the
 * message, and a quiet footer with the dismiss button. Success messages close themselves,
 * with a thin bar running down the time left.
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
  const variantName = current?.variant ?? 'info';
  const duration = current?.duration ?? autoCloseAfter(variantName, !!current?.description);

  const close = React.useCallback(() => {
    if (currentId) dismiss(currentId);
  }, [currentId, dismiss]);

  /* Auto-dismiss: messages pushed with a `duration`, and success messages by default. */
  React.useEffect(() => {
    if (!currentId || !duration) return;
    const timer = window.setTimeout(() => dismiss(currentId), duration);
    return () => window.clearTimeout(timer);
  }, [currentId, duration, dismiss]);

  const variant = VARIANT_STYLES[variantName];
  const { Icon } = variant;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <DialogPrimitive.Portal>
        {/* data-slot drives the shared overlay keyframes in globals.css. */}
        <DialogPrimitive.Overlay
          data-slot="dialog-overlay"
          className="fixed inset-0 z-[120] bg-slate-950/40 backdrop-blur-[2px]"
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
            'fixed left-1/2 top-1/2 z-[120] w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2',
            'max-h-[calc(100dvh-2rem)] overflow-hidden',
            'rounded-2xl border border-border bg-card text-card-foreground shadow-[var(--shadow-floating)]',
            // The panel itself takes focus on open; the dismiss button carries the visible ring.
            'focus:outline-none'
          )}
        >
          {/* Re-keyed per message so the next one in the queue fades its content in. */}
          <div key={currentId ?? 'empty'} className="animate-fade-in">
            <div className="flex items-start gap-4 p-5 pr-12">
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', variant.tile)}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className={cn('text-[11px] font-semibold uppercase tracking-wider', variant.text)}>{variant.label}</p>
                <DialogPrimitive.Title
                  id="app-popup-title"
                  className="mt-0.5 break-words text-[15px] font-semibold leading-snug text-foreground"
                >
                  {current?.title}
                </DialogPrimitive.Title>
                {current?.description && (
                  <DialogPrimitive.Description
                    id="app-popup-description"
                    className="mt-1.5 max-h-[50dvh] overflow-y-auto overscroll-contain break-words text-sm leading-relaxed text-muted-foreground"
                  >
                    {current.description}
                  </DialogPrimitive.Description>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-border bg-muted/40 px-5 py-3">
              <Button ref={actionRef} size="sm" className="w-full min-w-24 sm:w-auto" onClick={close}>
                OK
              </Button>
            </div>

            {/* Time left on a message that closes itself. */}
            {duration ? (
              <div className="h-1 w-full bg-border/60" aria-hidden="true">
                <div
                  className={cn('h-full origin-left', variant.bar)}
                  style={{ animation: `popupCountdown ${duration}ms linear forwards` }}
                />
              </div>
            ) : null}
          </div>

          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

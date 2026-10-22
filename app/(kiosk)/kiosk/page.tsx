'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CreditCard, Landmark, Loader2, LogIn, LogOut, ScanFace, ShieldOff, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { KioskCamera } from '@/components/kiosk/KioskCamera';
import { useTerminology } from '@/hooks';
import { useBillingSettings } from '@/hooks/usePharmacies';
import { appointmentService } from '@/services/appointment.service';
import { checkInService } from '@/services/checkin.service';
import { kioskDecision, kioskGreetingName, type KioskCharge } from '@/constants/kiosk';
import { assignTokens, opdStageOf } from '@/constants/opd';
import { formatCurrency, getFriendlyErrorMessage, toLocalDateInput } from '@/lib/utils';
import type { Appointment } from '@/types';

/**
 * The reception kiosk: an iPad at the entrance that checks people in, and out.
 *
 *   arriving  →  scan face  →  "You're checked in, Asha. Dr Rao · token 4"
 *   waiting   →  scan face  →  "You're already checked in — you'll be called"
 *   leaving   →  scan face  →  "Your visit: $100"  →  pay  →  "You're checked out"
 *
 * The kiosk decides which from today's records (constants/kiosk.ts), so it always agrees with the
 * OPD queue. The fee is the visit's own, else the organisation's standard visit fee; insurance is
 * not calculated. Only a first name ever appears — this screen faces the waiting room.
 *
 * Payment: there is no card-terminal integration yet. "Pay by card" records the fee as paid by
 * card (the person pays on the clinic's existing terminal); a gateway plugs in at `payByCard`.
 */

type Screen =
  | { name: 'idle' }
  | { name: 'camera' }
  | { name: 'working'; message: string }
  | { name: 'checked_in'; first: string; doctor?: string; token?: number; already?: boolean }
  | { name: 'checkout'; first: string; guestId: string; charges: KioskCharge[]; total: number }
  | { name: 'done'; first: string; title: string; detail?: string }
  | { name: 'not_recognised' }
  | { name: 'error'; message: string };

/** How long a result stays up before the kiosk is ready for the next person. */
const RESULT_MS = 12_000;
/** A camera left open with nobody using it goes back to the welcome screen. */
const CAMERA_IDLE_MS = 60_000;

export default function KioskPage() {
  const t = useTerminology();
  const router = useRouter();
  const { data: billing } = useBillingSettings();
  const [screen, setScreen] = useState<Screen>({ name: 'idle' });
  const [exitOpen, setExitOpen] = useState(false);
  const busy = useRef(false);

  const standardFee = billing?.standardVisitFee ?? 100;
  const currency = billing?.currency ?? 'USD';
  const money = (n: number) => formatCurrency(n, currency);
  const reset = useCallback(() => { busy.current = false; setScreen({ name: 'idle' }); }, []);

  // Results clear themselves; an abandoned camera closes.
  useEffect(() => {
    const terminal = ['checked_in', 'done', 'not_recognised', 'error'].includes(screen.name);
    const ms = terminal ? RESULT_MS : screen.name === 'camera' || screen.name === 'checkout' ? CAMERA_IDLE_MS : 0;
    if (!ms) return;
    const timer = setTimeout(reset, ms);
    return () => clearTimeout(timer);
  }, [screen, reset]);

  /** The token a doctor's queue gives this visit — the same numbering as the OPD board. */
  async function tokenFor(a?: Appointment): Promise<number | undefined> {
    if (!a?.staffId) return undefined;
    const day = await appointmentService.getAppointments({ date: a.date ?? toLocalDateInput(), staffId: a.staffId });
    return assignTokens(day).get(a.id);
  }

  async function handleCapture(image: string) {
    if (busy.current) return;
    busy.current = true;
    setScreen({ name: 'working', message: 'Finding you…' });
    try {
      let match;
      try {
        match = await checkInService.findByFace(image);
      } catch (err: any) {
        if (err?.response?.status === 404 || err?.response?.status === 400) {
          busy.current = false;
          setScreen({ name: 'not_recognised' });
          return;
        }
        throw err;
      }
      const best = match.matches[0];
      const guestId = best?.id ?? match.guestId;
      if (!guestId) { busy.current = false; setScreen({ name: 'not_recognised' }); return; }
      const first = kioskGreetingName(best?.name ?? match.guestName);
      const today = toLocalDateInput();

      const [appointments, checkIns] = await Promise.all([
        appointmentService.getAppointments({ guestId, date: today }),
        checkInService.getCheckIns({ guestId }),
      ]);
      const decision = kioskDecision({ appointments, checkIns, today, standardFee });

      if (decision.kind === 'check_in') {
        setScreen({ name: 'working', message: 'Checking you in…' });
        await checkInService.checkIn({ guestId, method: 'Face (kiosk)', venue: 'Reception kiosk' });
        // The check-in marks their next booking today as arrived; read it back for the token.
        const after = await appointmentService.getAppointments({ guestId, date: today });
        const arrived = after.find((a) => opdStageOf(a) === 'waiting');
        setScreen({ name: 'checked_in', first, doctor: arrived?.staffName, token: await tokenFor(arrived) });
      } else if (decision.kind === 'waiting') {
        setScreen({
          name: 'checked_in', first, already: true,
          doctor: decision.appointment?.staffName, token: await tokenFor(decision.appointment),
        });
      } else {
        setScreen({ name: 'checkout', first, guestId, charges: decision.charges, total: decision.total });
      }
      busy.current = false;
    } catch (err) {
      busy.current = false;
      setScreen({ name: 'error', message: getFriendlyErrorMessage(err, 'Something went wrong. Please see the reception desk.') });
    }
  }

  async function finishCheckout(s: Extract<Screen, { name: 'checkout' }>, mode: 'card' | 'desk' | 'free') {
    if (busy.current) return;
    busy.current = true;
    setScreen({ name: 'working', message: mode === 'card' ? 'Recording your payment…' : 'Checking you out…' });
    try {
      if (mode === 'card') await payByCard(s.charges);
      await checkInService.checkOutGuest(s.guestId, mode === 'desk' ? `Pay ${money(s.total)} at reception` : undefined);
      setScreen({
        name: 'done',
        first: s.first,
        title: mode === 'desk' ? 'Please pay at the reception desk' : 'You’re checked out',
        detail: mode === 'card'
          ? `${money(s.total)} paid. Thank you, and get well soon.`
          : mode === 'desk'
          ? `${money(s.total)} to pay. You’re checked out — the desk will take payment.`
          : 'Nothing to pay. Thank you, and get well soon.',
      });
    } catch (err) {
      setScreen({ name: 'error', message: getFriendlyErrorMessage(err, 'Checkout did not finish. Please see the reception desk.') });
    } finally {
      busy.current = false;
    }
  }

  /** Records each fee as paid by card. Where a payment gateway plugs in, when there is one. */
  async function payByCard(charges: KioskCharge[]) {
    for (const c of charges) {
      await appointmentService.updatePaymentStatus(c.appointmentId, {
        paymentStatus: 'paid', amount: c.amount, method: 'card', payer: 'self',
      });
    }
  }

  // The kiosk belongs to a hospital's front door, as the OPD queue does.
  if (!t.has('opd')) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EmptyState
          icon={ShieldOff}
          title="Kiosk not available"
          description="The self check-in kiosk is part of the hospital (OPD) module."
          action={{ label: 'Back to the portal', onClick: () => router.push('/dashboard') }}
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
      <button
        type="button"
        onClick={() => setExitOpen(true)}
        className="absolute right-4 top-4 rounded px-2 py-1 text-xs text-muted-foreground/60 hover:text-muted-foreground"
      >
        Staff
      </button>

      {screen.name === 'idle' && (
        <div className="flex max-w-xl flex-col items-center gap-8">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10">
            <ScanFace className="h-14 w-14 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Welcome</h1>
            <p className="mt-3 text-xl text-muted-foreground">Arriving or leaving? Scan your face to check in or check out.</p>
          </div>
          <Button size="lg" className="h-20 w-full max-w-md text-2xl" onClick={() => setScreen({ name: 'camera' })}>
            Start
          </Button>
          <p className="text-sm text-muted-foreground">First visit, or no photo on file? Please see the reception desk.</p>
        </div>
      )}

      {screen.name === 'camera' && <KioskCamera onCapture={handleCapture} onCancel={reset} />}

      {screen.name === 'working' && (
        <div className="flex flex-col items-center gap-6" role="status" aria-live="polite">
          <Loader2 className="h-16 w-16 animate-spin text-primary" aria-hidden="true" />
          <p className="text-2xl font-medium">{screen.message}</p>
        </div>
      )}

      {screen.name === 'checked_in' && (
        <Result icon={screen.already ? LogIn : CheckCircle2} tone="success" onDone={reset}
          title={screen.already ? `You’re already checked in, ${screen.first}` : `You’re checked in, ${screen.first}`}>
          {screen.token ? (
            <div className="rounded-2xl border bg-muted/40 px-10 py-6">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Your token</p>
              <p className="text-7xl font-bold tabular-nums text-primary">{screen.token}</p>
              {screen.doctor && <p className="mt-2 text-lg">{screen.doctor}</p>}
            </div>
          ) : (
            <p className="text-xl text-muted-foreground">
              {screen.doctor ? `${screen.doctor} will see you soon.` : 'The reception desk will assign your doctor.'}
            </p>
          )}
          <p className="text-lg text-muted-foreground">Please take a seat — you&rsquo;ll be called. Come back here to check out.</p>
        </Result>
      )}

      {screen.name === 'checkout' && (
        <div className="flex w-full max-w-xl flex-col items-center gap-6">
          <LogOut className="h-16 w-16 text-primary" aria-hidden="true" />
          <h1 className="text-4xl font-extrabold tracking-tight">Checking out, {screen.first}</h1>
          {screen.total > 0 ? (
            <>
              <div className="w-full rounded-2xl border bg-muted/30 p-5 text-left">
                {screen.charges.map((c) => (
                  <div key={c.appointmentId} className="flex items-center justify-between gap-4 py-1.5 text-lg">
                    <span className="truncate">{c.label}</span>
                    <span className="tabular-nums">{money(c.amount)}</span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between border-t pt-3 text-2xl font-bold">
                  <span>Total</span><span className="tabular-nums">{money(screen.total)}</span>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3">
                <Button size="lg" className="h-16 text-xl" onClick={() => finishCheckout(screen, 'card')}>
                  <CreditCard className="mr-3 h-6 w-6" /> Pay {money(screen.total)} by card
                </Button>
                <Button size="lg" variant="outline" className="h-16 text-xl" onClick={() => finishCheckout(screen, 'desk')}>
                  Pay at the reception desk
                </Button>
                {/* The way in for insurance, kept visible and disabled until a payer integration exists. */}
                <Button size="lg" variant="ghost" className="h-12 text-base" disabled>
                  <Landmark className="mr-2 h-5 w-5" /> Insurance — coming soon
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xl text-muted-foreground">Nothing to pay today.</p>
              <Button size="lg" className="h-16 w-full text-xl" onClick={() => finishCheckout(screen, 'free')}>
                <LogOut className="mr-3 h-6 w-6" /> Check out
              </Button>
            </>
          )}
          <Button variant="link" onClick={reset}>Cancel</Button>
        </div>
      )}

      {screen.name === 'done' && (
        <Result icon={CheckCircle2} tone="success" title={screen.title} onDone={reset}>
          {screen.detail && <p className="text-xl text-muted-foreground">{screen.detail}</p>}
        </Result>
      )}

      {screen.name === 'not_recognised' && (
        <Result icon={UserX} tone="warn" title={'We couldn\u2019t find you'} onDone={reset}>
          <p className="text-xl text-muted-foreground">Try again with your face in the oval, or please see the reception desk.</p>
          <Button size="lg" className="h-14 px-10 text-lg" onClick={() => setScreen({ name: 'camera' })}>Try again</Button>
        </Result>
      )}

      {screen.name === 'error' && (
        <Result icon={UserX} tone="warn" title="Please see the reception desk" onDone={reset}>
          <p className="text-lg text-muted-foreground">{screen.message}</p>
        </Result>
      )}

      <ConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        title="Leave kiosk mode?"
        description="Returns this device to the staff portal."
        confirmLabel="Leave kiosk"
        onConfirm={() => router.push('/opd')}
      />
    </div>
  );
}

function Result({
  icon: Icon, tone, title, children, onDone,
}: {
  icon: typeof CheckCircle2;
  tone: 'success' | 'warn';
  title: string;
  children?: React.ReactNode;
  onDone: () => void;
}) {
  return (
    <div className="flex max-w-xl flex-col items-center gap-6">
      <Icon className={tone === 'success' ? 'h-20 w-20 text-green-600' : 'h-20 w-20 text-amber-600'} aria-hidden="true" />
      {/* Plain text: the title carries a patient's name, which must never be parsed as markup. */}
      <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
      {children}
      <Button variant="outline" size="lg" className="h-14 px-10 text-lg" onClick={onDone}>Done</Button>
    </div>
  );
}

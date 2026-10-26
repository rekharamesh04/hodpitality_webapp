'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Delete, KeyRound, Landmark, Loader2, LogIn, LogOut, ScanFace, ShieldCheck, ShieldOff, Smartphone, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { KioskCamera } from '@/components/kiosk/KioskCamera';
import { LogoMark } from '@/components/brand/LogoMark';
import { useTerminology } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { authService } from '@/services/auth.service';
import {
  KIOSK_PIN_MAX, KIOSK_PIN_MIN, clearKioskPin, isValidKioskPin, kioskPinMatches, readKioskPinHash, saveKioskPin, setKioskActive,
} from '@/lib/kiosk-lock';
import { useBillingSettings } from '@/hooks/usePharmacies';
import { appointmentService } from '@/services/appointment.service';
import { checkInService } from '@/services/checkin.service';
import { guestService } from '@/services/guest.service';
import { customerService } from '@/services/customer.service';
import { KIOSK_PHONE_MIN_DIGITS, kioskDecision, kioskGreetingName, kioskPhoneMatch, phoneDigits, type KioskCharge } from '@/constants/kiosk';
import { assignTokens, opdStageOf } from '@/constants/opd';
import { cn, formatCurrency, getFriendlyErrorMessage, toLocalDateInput } from '@/lib/utils';
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
 * Face check-in is optional. Biometric laws (Texas CUBI, Illinois BIPA, India's DPDP) need consent
 * before a face is captured, and some people say no — so the welcome screen offers a phone number
 * as an equal way in, and the camera screen says what scanning means before anything is taken.
 * Both ways lead to the same decision and the same visit.
 *
 * Leaving kiosk mode needs the exit PIN staff set on this device the first time (lib/kiosk-lock.ts):
 * the session behind this screen is a staff member's, and the portal holds every patient's record.
 * While the kiosk is active the portal's own layout sends every page back here, so the address bar
 * and the back button lead nowhere either.
 *
 * Payment: there is no card-terminal integration, so the kiosk never marks a fee paid. It used to
 * offer "Pay by card", which recorded the fee as paid by card on a tap, with nothing confirming any
 * money moved. Checkout now leaves the fee owed, with a note, for the desk to take.
 *
 * A phone number is not a secret, so it checks a person in but never out: checking out shows what
 * they owe, which is not for whoever typed their number. Checking out by face, or at the desk.
 */

type Screen =
  | { name: 'setup'; digits: string; first?: string; error?: string }
  | { name: 'exit'; digits: string; error?: string }
  | { name: 'idle' }
  | { name: 'camera' }
  | { name: 'phone'; digits: string }
  | { name: 'working'; message: string }
  | { name: 'checked_in'; first: string; doctor?: string; token?: number; already?: boolean }
  | { name: 'checkout'; first: string; guestId: string; charges: KioskCharge[]; total: number }
  | { name: 'done'; first: string; title: string; detail?: string }
  | { name: 'not_recognised' }
  | { name: 'phone_not_found' }
  | { name: 'error'; message: string };

/** How long a result stays up before the kiosk is ready for the next person. */
const RESULT_MS = 12_000;
/** A camera left open with nobody using it goes back to the welcome screen. */
const CAMERA_IDLE_MS = 60_000;

export default function KioskPage() {
  const t = useTerminology();
  const router = useRouter();
  const { data: billing } = useBillingSettings();
  const qc = useQueryClient();
  const tenant = useAuthStore((s) => s.user?.tenant_id ?? '');
  const logout = useAuthStore((s) => s.logout);
  const [screen, setScreen] = useState<Screen>({ name: 'idle' });
  const busy = useRef(false);

  // First time on this device: staff choose the exit PIN before the kiosk faces the public. With a
  // PIN set, the device is in kiosk mode until the PIN is entered (see isKioskActive).
  useEffect(() => {
    if (!tenant) return;
    if (readKioskPinHash(tenant)) setKioskActive(tenant, true);
    else setScreen({ name: 'setup', digits: '' });
  }, [tenant]);

  const standardFee = billing?.standardVisitFee ?? 100;
  const currency = billing?.currency ?? 'USD';
  const money = (n: number) => formatCurrency(n, currency);
  const reset = useCallback(() => { busy.current = false; setScreen({ name: 'idle' }); }, []);

  // Results clear themselves; an abandoned camera closes.
  useEffect(() => {
    const terminal = ['checked_in', 'done', 'not_recognised', 'phone_not_found', 'error'].includes(screen.name);
    const ms = terminal ? RESULT_MS : ['camera', 'phone', 'checkout', 'exit'].includes(screen.name) ? CAMERA_IDLE_MS : 0;
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
    let match;
    try {
      match = await checkInService.findByFace(image);
    } catch (err: any) {
      busy.current = false;
      if (err?.response?.status === 404 || err?.response?.status === 400) setScreen({ name: 'not_recognised' });
      else setScreen({ name: 'error', message: getFriendlyErrorMessage(err, 'Something went wrong. Please see the reception desk.') });
      return;
    }
    const best = match.matches[0];
    const guestId = best?.id ?? match.guestId;
    if (!guestId) { busy.current = false; setScreen({ name: 'not_recognised' }); return; }
    await proceed(guestId, best?.name ?? match.guestName, 'Face (kiosk)');
  }

  /**
   * The way in without a face: the phone number on their record. The search matches part of a
   * number, as typed on the record ("(512) 555-0134"), so it is asked for the last four digits and
   * the full number is then compared exactly.
   */
  async function handlePhone(entered: string) {
    if (busy.current) return;
    busy.current = true;
    setScreen({ name: 'working', message: 'Finding you…' });
    try {
      const search = phoneDigits(entered).slice(-4);
      const [guests, customers] = await Promise.all([
        guestService.getGuests({ search, limit: 200 }).then((r) => r.data ?? []).catch(() => []),
        customerService.getCustomers({ search, limit: 200 }).then((r) => r.data ?? []).catch(() => []),
      ]);
      const person = kioskPhoneMatch([...guests, ...customers], entered);
      if (!person) { busy.current = false; setScreen({ name: 'phone_not_found' }); return; }
      await proceed(person.id, person.name, 'Phone (kiosk)', { mayCheckOut: false });
    } catch (err) {
      busy.current = false;
      setScreen({ name: 'error', message: getFriendlyErrorMessage(err, 'Something went wrong. Please see the reception desk.') });
    }
  }

  /** Found them, by face or by phone: check in, say they are waiting, or start checkout. */
  async function proceed(guestId: string, name: string | undefined, method: string, { mayCheckOut = true } = {}) {
    try {
      const first = kioskGreetingName(name);
      const today = toLocalDateInput();

      const [appointments, checkIns] = await Promise.all([
        appointmentService.getAppointments({ guestId, date: today }),
        checkInService.getCheckIns({ guestId }),
      ]);
      const decision = kioskDecision({ appointments, checkIns, today, standardFee });

      if (decision.kind === 'check_in') {
        setScreen({ name: 'working', message: 'Checking you in…' });
        await checkInService.checkIn({ guestId, method, venue: 'Reception kiosk' });
        // The check-in marks their next booking today as arrived; read it back for the token.
        const after = await appointmentService.getAppointments({ guestId, date: today });
        const arrived = after.find((a) => opdStageOf(a) === 'waiting');
        setScreen({ name: 'checked_in', first, doctor: arrived?.staffName, token: await tokenFor(arrived) });
      } else if (decision.kind === 'waiting') {
        setScreen({
          name: 'checked_in', first, already: true,
          doctor: decision.appointment?.staffName, token: await tokenFor(decision.appointment),
        });
      } else if (!mayCheckOut) {
        setScreen({
          name: 'done', first, title: `Please see the reception desk, ${first}`,
          detail: 'They will check you out. To check out here next time, scan your face.',
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

  async function finishCheckout(s: Extract<Screen, { name: 'checkout' }>, mode: 'desk' | 'free') {
    if (busy.current) return;
    busy.current = true;
    setScreen({ name: 'working', message: 'Checking you out…' });
    try {
      // The fee stays owed: the desk takes the money and records it, by card or otherwise.
      await checkInService.checkOutGuest(s.guestId, mode === 'desk' ? `Pay ${money(s.total)} at reception` : undefined);
      setScreen({
        name: 'done',
        first: s.first,
        title: mode === 'desk' ? 'Please pay at the reception desk' : 'You’re checked out',
        detail: mode === 'desk'
          ? `${money(s.total)} to pay. You’re checked out — the desk will take payment.`
          : 'Nothing to pay. Thank you, and get well soon.',
      });
    } catch (err) {
      setScreen({ name: 'error', message: getFriendlyErrorMessage(err, 'Checkout did not finish. Please see the reception desk.') });
    } finally {
      busy.current = false;
    }
  }

  async function setupPin(s: Extract<Screen, { name: 'setup' }>) {
    if (!isValidKioskPin(s.digits)) return;
    if (!s.first) { setScreen({ name: 'setup', digits: '', first: s.digits }); return; }
    if (s.first !== s.digits) { setScreen({ name: 'setup', digits: '', error: 'The PINs did not match. Choose one again.' }); return; }
    await saveKioskPin(tenant, s.digits);
    setKioskActive(tenant, true);
    setScreen({ name: 'idle' });
  }

  async function tryExit(digits: string) {
    if (await kioskPinMatches(tenant, digits)) {
      setKioskActive(tenant, false);
      router.push('/opd');
      return;
    }
    setScreen({ name: 'exit', digits: '', error: 'That PIN is not right.' });
  }

  /** Forgot the PIN: sign out. Whoever signs in next sets a new one; nothing is unlocked. */
  async function signOut() {
    clearKioskPin();
    await authService.logout().catch(() => {});
    logout();
    qc.clear();
    router.push('/login');
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
      {screen.name !== 'setup' && screen.name !== 'exit' && (
        <button
          type="button"
          onClick={() => setScreen({ name: 'exit', digits: '' })}
          className="absolute right-4 top-4 rounded px-2 py-1 text-xs text-muted-foreground/60 hover:text-muted-foreground"
        >
          Staff
        </button>
      )}

      {screen.name === 'setup' && (
        <Keypad
          icon={KeyRound}
          title={screen.first ? 'Enter the PIN again' : 'Set the kiosk exit PIN'}
          subtitle={screen.error ?? `${KIOSK_PIN_MIN}–${KIOSK_PIN_MAX} digits. Staff need it to leave kiosk mode, so patients cannot reach the portal. For a locked-down iPad, also turn on Guided Access.`}
          error={!!screen.error}
          digits={screen.digits}
          masked
          maxDigits={KIOSK_PIN_MAX}
          ready={isValidKioskPin(screen.digits)}
          submitLabel={screen.first ? 'Save PIN' : 'Next'}
          onChange={(digits) => setScreen({ ...screen, digits })}
          onSubmit={() => setupPin(screen)}
          onCancel={() => router.push('/opd')}
          cancelLabel="Back to the portal"
        />
      )}

      {screen.name === 'exit' && (
        <div className="flex w-full flex-col items-center gap-2">
          <Keypad
            icon={KeyRound}
            title="Staff PIN"
            subtitle={screen.error ?? 'Enter the kiosk exit PIN to return to the staff portal.'}
            error={!!screen.error}
            digits={screen.digits}
            masked
            maxDigits={KIOSK_PIN_MAX}
            ready={isValidKioskPin(screen.digits)}
            submitLabel="Leave kiosk"
            onChange={(digits) => setScreen({ name: 'exit', digits })}
            onSubmit={() => tryExit(screen.digits)}
            onCancel={reset}
          />
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={signOut}>
            Forgot the PIN? Sign out
          </Button>
        </div>
      )}

      {screen.name === 'idle' && (
        <div className="flex w-full max-w-3xl flex-col items-center gap-10">
          <LogoMark className="h-14 w-14" title="EntryFlow" />
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Welcome</h1>
            <p className="mt-3 text-xl text-muted-foreground">Arriving or leaving? Check in or out here.</p>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <ChoiceCard
              icon={ScanFace}
              title="Scan my face"
              detail="If you set up face check-in at the desk"
              primary
              onClick={() => setScreen({ name: 'camera' })}
            />
            <ChoiceCard
              icon={Smartphone}
              title="Use my phone number"
              detail="No camera needed"
              onClick={() => setScreen({ name: 'phone', digits: '' })}
            />
          </div>
          <p className="flex items-start gap-2 text-left text-base text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span>Face check-in is optional and only for people who agreed to it. Your phone number works just the same.</span>
          </p>
          <p className="text-sm text-muted-foreground">First visit? Please see the reception desk.</p>
        </div>
      )}

      {screen.name === 'camera' && (
        <div className="flex w-full max-w-xl flex-col items-center gap-4">
          {/* Notice before capture: nothing is taken until they press the button. */}
          <p className="rounded-2xl bg-primary/5 px-5 py-3 text-base text-foreground">
            Pressing <span className="font-semibold">Scan my face</span> compares your face with the photo you agreed to
            at registration.
          </p>
          <KioskCamera onCapture={handleCapture} onCancel={reset} />
          <Button variant="link" className="text-lg" onClick={() => setScreen({ name: 'phone', digits: '' })}>
            <Smartphone className="mr-2 h-5 w-5" /> Use my phone number instead
          </Button>
        </div>
      )}

      {screen.name === 'phone' && (
        <Keypad
          icon={Smartphone}
          title="Your phone number"
          subtitle="The number the clinic has on file for you."
          placeholder="Tap the numbers"
          digits={screen.digits}
          maxDigits={15}
          ready={phoneDigits(screen.digits).length >= KIOSK_PHONE_MIN_DIGITS}
          submitLabel="Continue"
          onChange={(digits) => setScreen({ name: 'phone', digits })}
          onSubmit={() => handlePhone(screen.digits)}
          onCancel={reset}
        />
      )}

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
          <h1 className="text-4xl font-bold">Checking out, {screen.first}</h1>
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
                <Button size="lg" className="h-16 text-xl" onClick={() => finishCheckout(screen, 'desk')}>
                  <LogOut className="mr-3 h-6 w-6" /> Check out — pay at the reception desk
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
          <p className="text-xl text-muted-foreground">Try again with your face in the oval, use your phone number, or please see the reception desk.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-14 px-10 text-lg" onClick={() => setScreen({ name: 'camera' })}>Try again</Button>
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg" onClick={() => setScreen({ name: 'phone', digits: '' })}>
              <Smartphone className="mr-2 h-5 w-5" /> Use my phone number
            </Button>
          </div>
        </Result>
      )}

      {screen.name === 'phone_not_found' && (
        <Result icon={UserX} tone="warn" title={'We couldn\u2019t find that number'} onDone={reset}>
          <p className="text-xl text-muted-foreground">Check the number and try again, or please see the reception desk.</p>
          <Button size="lg" className="h-14 px-10 text-lg" onClick={() => setScreen({ name: 'phone', digits: '' })}>Try again</Button>
        </Result>
      )}

      {screen.name === 'error' && (
        <Result icon={UserX} tone="warn" title="Please see the reception desk" onDone={reset}>
          <p className="text-lg text-muted-foreground">{screen.message}</p>
        </Result>
      )}

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
      <h1 className="text-4xl font-bold">{title}</h1>
      {children}
      <Button variant="outline" size="lg" className="h-14 px-10 text-lg" onClick={onDone}>Done</Button>
    </div>
  );
}

function ChoiceCard({
  icon: Icon, title, detail, primary, onClick,
}: {
  icon: typeof ScanFace;
  title: string;
  detail: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-48 flex-col items-center justify-center gap-4 rounded-3xl border-2 p-8 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40',
        primary
          ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-primary)] hover:bg-primary/90'
          : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5',
      )}
    >
      <Icon className={cn('h-14 w-14', primary ? 'text-primary-foreground' : 'text-primary')} aria-hidden="true" />
      <span className="text-2xl font-semibold">{title}</span>
      <span className={cn('text-base', primary ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{detail}</span>
    </button>
  );
}

/** A big on-screen keypad: an iPad's own keyboard covers half the screen and offers letters. */
function Keypad({
  icon: Icon, title, subtitle, error, placeholder, digits, masked, maxDigits, ready, submitLabel, onChange, onSubmit, onCancel, cancelLabel = 'Cancel',
}: {
  icon: typeof Smartphone;
  title: string;
  subtitle: string;
  /** Shows the subtitle as a problem to fix. */
  error?: boolean;
  placeholder?: string;
  digits: string;
  /** Dots instead of digits — for a PIN, on a screen the waiting room can see. */
  masked?: boolean;
  maxDigits: number;
  ready: boolean;
  submitLabel: string;
  onChange: (digits: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  cancelLabel?: string;
}) {
  const press = (d: string) => digits.length < maxDigits && onChange(digits + d);
  const key = 'flex h-16 items-center justify-center rounded-2xl border bg-card text-3xl font-semibold tabular-nums transition-colors hover:bg-muted active:bg-primary/10';

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5">
      <Icon className="h-12 w-12 text-primary" aria-hidden="true" />
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className={cn('mt-2 text-lg', error ? 'font-medium text-destructive' : 'text-muted-foreground')} role={error ? 'alert' : undefined}>
          {subtitle}
        </p>
      </div>
      <output
        aria-live="polite"
        className="flex h-20 w-full items-center justify-center rounded-2xl border-2 border-primary/40 bg-card px-4 text-4xl font-semibold tabular-nums tracking-wider"
      >
        {digits
          ? masked ? '•'.repeat(digits.length) : digits
          : <span className="text-2xl font-normal tracking-normal text-muted-foreground">{placeholder ?? ' '}</span>}
      </output>
      <div className="grid w-full grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className={key} onClick={() => press(d)}>{d}</button>
        ))}
        <button type="button" className={cn(key, 'text-lg font-medium text-muted-foreground')} onClick={() => onChange('')}>
          Clear
        </button>
        <button type="button" className={key} onClick={() => press('0')}>0</button>
        <button type="button" className={key} aria-label="Delete last digit" onClick={() => onChange(digits.slice(0, -1))}>
          <Delete className="h-8 w-8" aria-hidden="true" />
        </button>
      </div>
      <Button size="lg" className="h-16 w-full text-xl" disabled={!ready} onClick={onSubmit}>
        {submitLabel}
      </Button>
      <Button variant="link" className="text-lg" onClick={onCancel}>{cancelLabel}</Button>
    </div>
  );
}

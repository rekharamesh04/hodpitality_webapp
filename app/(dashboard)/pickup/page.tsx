'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Check, ScanFace, Phone, Mail, UserCheck, EyeOff,
  ShieldCheck, ShieldX, PackageCheck, RotateCcw, Clock, Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import { PrescriptionStatusBadge } from '@/components/prescriptions/PrescriptionStatusBadge';
import { useGuest, useGuests } from '@/hooks/use-guests';
import { useCustomer } from '@/hooks/useCustomers';
import { usePickupHandoffStore } from '@/store/pickup-handoff-store';
import { usePrescriptions, useUpdatePrescription } from '@/hooks/usePrescriptions';
import { useTerminology } from '@/hooks';
import { checkInService } from '@/services/checkin.service';
import { popup } from '@/lib/popup';
import { cn, formatDate, getFriendlyErrorMessage, getInitials } from '@/lib/utils';
import { isReadyForPickup, medicineLabel, medicinesOf, prescriptionsFor } from '@/types/prescription';
import type { Guest } from '@/types';

/**
 * The collection counter.
 *
 * Two things shape it.
 *
 * Identity is a ladder, not a gate. A face match is one rung of several and
 * every rung stays available, because a camera that is down or a patient who
 * never enrolled must not be what stands between someone and their medicine.
 * The rungs here are only the ones this API can actually check: a face match,
 * the phone or email held on the record, or a named staff attestation. The
 * guest record carries no date of birth, so that rung is absent rather than
 * faked.
 *
 * Nothing identifiable renders until identity is established — the medicine
 * list stays masked, because a screen facing the queue would otherwise show
 * everyone behind what the person in front is collecting.
 *
 * What is NOT here: an audit entity. Each verification is recorded into the
 * prescription's own notes on release, which is the only field this API can
 * persist it to. A real trail needs its own record — see
 * docs/PHARMACY_MODULE.md.
 */
export default function PickupPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <PickupPageInner />
    </Suspense>
  );
}

type StepId = 'find' | 'verify' | 'release';
type Method = 'face' | 'phone' | 'email' | 'attestation';

const METHOD_ICON: Record<Method, LucideIcon> = {
  face: ScanFace, phone: Phone, email: Mail, attestation: UserCheck,
};

interface Attempt {
  id: string;
  method: Method;
  ok: boolean;
  detail?: string;
  at: string;
}

function guestIdOf(g: Guest): string {
  return g.id ?? (g.PK ? g.PK.replace('GUEST#', '') : '');
}

function PickupPageInner() {
  const t = useTerminology();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [guest, setGuest] = useState<Guest | null>(null);
  const [step, setStep] = useState<StepId>(searchParams.get('patient') ? 'verify' : 'find');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [faceOpen, setFaceOpen] = useState(false);
  const [matching, setMatching] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [attestation, setAttestation] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [counselled, setCounselled] = useState(false);

  const { data: guestPage, isLoading: guestsLoading, isError: guestsError, error: guestsErr, refetch } =
    useGuests({ search: search || undefined });
  // useGuests returns the `{ data, total, page, limit }` list envelope, not a bare array.
  const guests = useMemo<Guest[]>(
    () => (Array.isArray(guestPage) ? guestPage : guestPage?.data ?? []),
    [guestPage],
  );

  // Resolve a patient passed in from the worklist, a profile or check-in. Read
  // by id: the search list above is only its first page, so a patient further
  // down would otherwise never resolve and the counter would render blank.
  const preId = searchParams.get('patient');
  // A prescription may be written for a guest or a patient account, so the id
  // is looked up in both at once; whichever answers is the person.
  const { data: preGuest } = useGuest(preId ?? '');
  const { data: preCustomer } = useCustomer(preId ?? '');
  const resolvedPre = useMemo(
    () => (preId
      ? preGuest ?? (preCustomer as unknown as Guest | undefined) ?? guests.find((g) => guestIdOf(g) === preId) ?? null
      : null),
    [preId, preGuest, preCustomer, guests],
  );
  const activeGuest = guest ?? resolvedPre;

  // A face matched at check-in moments ago counts as this collection's
  // verification, so the patient is not asked to scan twice. Taken once.
  const takeHandoff = usePickupHandoffStore((s) => s.take);
  const handoffChecked = useRef(false);
  useEffect(() => {
    if (handoffChecked.current || !preId || !resolvedPre) return;
    handoffChecked.current = true;
    const handoff = takeHandoff(preId);
    if (!handoff) return;
    setAttempts([{ id: 'v1', method: 'face', ok: true, detail: handoff.detail, at: new Date(handoff.at).toISOString() }]);
    setStep('release');
  }, [preId, resolvedPre, takeHandoff]);

  const verified = attempts.some((a) => a.ok);

  const { data: prescriptions, isLoading: rxLoading } = usePrescriptions({});
  const theirs = useMemo(() => {
    if (!activeGuest) return [];
    const gid = guestIdOf(activeGuest);
    return prescriptionsFor(prescriptions ?? [], gid).filter(isReadyForPickup);
  }, [prescriptions, activeGuest]);

  const updateRx = useUpdatePrescription();
  const chosen = theirs.filter((p) => selected.has(p.id));

  function record(method: Method, ok: boolean, detail?: string) {
    setAttempts((prev) => [
      ...prev,
      { id: `v${prev.length + 1}`, method, ok, detail, at: new Date().toISOString() },
    ]);
  }

  function reset() {
    setSearch(''); setGuest(null); setStep('find'); setAttempts([]);
    setPhoneInput(''); setEmailInput(''); setAttestation('');
    setSelected(new Set()); setCounselled(false);
    // Drop a patient passed in the URL, or it would stay "this collection".
    if (preId) router.replace('/pickup');
  }

  /**
   * Identify by face against the enrolled templates.
   *
   * This calls the facial check-in endpoint, which is the only face-matching
   * route the API has. It has a real side effect — it also records a check-in
   * for the person — which is defensible here because they genuinely did
   * arrive, and a 409 ("already checked in today") still identifies them.
   */
  async function handleFaceSubmit(imageDataUrl: string) {
    if (!activeGuest) return;
    setMatching(true);
    try {
      const result = await checkInService.checkInByFacial({ image: imageDataUrl, venue: 'Collection counter' });
      const expected = guestIdOf(activeGuest);
      const ok = !!result.guestId && result.guestId === expected;
      const confidence = typeof result.matchConfidence === 'number' ? `${result.matchConfidence.toFixed(1)}%` : 'matched';
      if (ok) {
        record('face', true, `Face matched at ${confidence}`);
        popup.success(`Identity confirmed — ${confidence}`);
      } else {
        record('face', false, result.guestName ? `Matched a different person (${result.guestName})` : 'No match');
        popup.warning('That face does not match this record', {
          description: 'Use another method — the collection is not blocked.',
        });
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        // Already checked in today — still an identification.
        record('face', true, 'Face matched (already checked in today)');
        popup.success('Identity confirmed');
      } else {
        const msg =
          status === 400 ? 'No face detected — reposition and retake.'
          : status === 404 ? 'Face not recognised. This person may not be enrolled.'
          : err?.backendMessage ?? getFriendlyErrorMessage(err, 'Face match failed');
        record('face', false, msg);
        popup.warning(msg, { description: 'Use another method — the collection is not blocked.' });
      }
    } finally {
      setMatching(false);
      setFaceOpen(false);
    }
  }

  function verifyPhone() {
    if (!activeGuest?.phone) { popup.info('No phone number on this record'); return; }
    const a = phoneInput.replace(/\D/g, '');
    const b = activeGuest.phone.replace(/\D/g, '');
    const ok = a.length >= 4 && b.endsWith(a.slice(-4)) && a.slice(-4) === b.slice(-4);
    record('phone', ok, ok ? 'Last 4 digits of the phone on file' : 'Phone did not match');
    ok ? popup.success('Phone confirmed') : popup.warning('That does not match the number on file');
  }

  function verifyEmail() {
    if (!activeGuest?.email) { popup.info('No email on this record'); return; }
    const ok = emailInput.trim().toLowerCase() === activeGuest.email.trim().toLowerCase();
    record('email', ok, ok ? 'Email on file' : 'Email did not match');
    ok ? popup.success('Email confirmed') : popup.warning('That does not match the email on file');
  }

  function verifyAttestation() {
    if (!attestation.trim()) { popup.warning('Record why you can vouch for this person'); return; }
    record('attestation', true, attestation.trim());
    popup.success('Attestation recorded');
  }

  /** Release: mark each chosen prescription completed, with how identity was proven. */
  function release() {
    if (!chosen.length || !activeGuest) return;
    const proof = attempts.filter((a) => a.ok).map((a) => `${a.method}: ${a.detail ?? 'confirmed'}`).join('; ');
    const stamp = `Collected ${formatDate(new Date(), 'MMM dd, yyyy HH:mm')} — identity verified (${proof})${counselled ? '; counselling offered' : ''}`;

    let done = 0;
    chosen.forEach((p) => {
      updateRx.mutate(
        { id: p.id, data: { status: 'completed', notes: [p.notes, stamp].filter(Boolean).join('\n') } },
        {
          onSuccess: () => {
            done += 1;
            if (done === chosen.length) {
              popup.success(`Released ${done} prescription${done === 1 ? '' : 's'} to ${activeGuest.name}`);
              reset();
            }
          },
        },
      );
    });
  }

  const STEPS: { id: StepId; label: string }[] = [
    { id: 'find', label: `Find ${t.person.one.toLowerCase()}` },
    { id: 'verify', label: 'Verify identity' },
    { id: 'release', label: 'Release' },
  ];
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Collection counter</h1>
          <p className="text-muted-foreground">
            Identify the {t.person.one.toLowerCase()}, verify them, then release what they are collecting.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> New collection
        </Button>
      </div>

      {/* Steps */}
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-3">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li key={s.id} className="flex items-center gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    done && 'border-primary bg-primary text-primary-foreground',
                    current && 'border-primary bg-primary/10 text-primary ring-4 ring-primary/10',
                    !done && !current && 'border-border bg-muted text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={cn('whitespace-nowrap text-sm', current ? 'font-semibold' : 'text-muted-foreground')}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={cn('mx-2 h-px w-6 shrink-0', done ? 'bg-primary' : 'bg-border')} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* 1 · find */}
          {step === 'find' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Find the {t.person.one.toLowerCase()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SearchInput
                  placeholder="Name, email or phone…"
                  defaultValue={search}
                  onSearch={setSearch}
                />
                {guestsLoading ? (
                  <TableSkeleton rows={4} />
                ) : guestsError ? (
                  <ErrorState
                    title={`Unable to load ${t.person.many.toLowerCase()}`}
                    message={getFriendlyErrorMessage(guestsErr)}
                    onRetry={() => refetch()}
                  />
                ) : guests.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title={`No ${t.person.many.toLowerCase()} found`}
                    description="Try a different name, email or phone number."
                  />
                ) : (
                  <div className="space-y-2">
                    {guests.slice(0, 12).map((g) => (
                      <button
                        key={guestIdOf(g)}
                        type="button"
                        onClick={() => { setGuest(g); setStep('verify'); }}
                        className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">{getInitials(g.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{g.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{g.email} · {g.phone}</p>
                        </div>
                        <Badge variant={g.face_enrolled ? 'success' : 'muted'}>
                          {g.face_enrolled ? 'Face enrolled' : 'No face'}
                        </Badge>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 2 · verify */}
          {step === 'verify' && activeGuest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verify {activeGuest.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Any one of these establishes identity. If the camera fails or the person never enrolled,
                  take the next rung rather than turning them away.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {verified ? (
                  <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-green-700 dark:text-green-400" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-green-900 dark:text-green-300">Identity verified</p>
                      <p className="text-xs text-green-800/80 dark:text-green-400/80">Medicines are now unlocked.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        activeGuest.face_enrolled
                          ? setFaceOpen(true)
                          : popup.info('No face enrolled for this record', {
                              description: 'Use another method, and offer enrolment afterwards.',
                            })
                      }
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors',
                        'hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        !activeGuest.face_enrolled && 'opacity-60',
                      )}
                    >
                      <ScanFace className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold">Face match</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {activeGuest.face_enrolled
                            ? 'Live camera match against the enrolled photo.'
                            : 'No face enrolled for this record.'}
                        </p>
                      </div>
                    </button>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5 rounded-lg border p-3">
                        <Label htmlFor="ph">Last 4 of the phone on file</Label>
                        <div className="flex gap-2">
                          <Input id="ph" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="1234" inputMode="numeric" />
                          <Button variant="outline" onClick={verifyPhone} disabled={!phoneInput.trim()}>Check</Button>
                        </div>
                      </div>
                      <div className="space-y-1.5 rounded-lg border p-3">
                        <Label htmlFor="em">Email on file</Label>
                        <div className="flex gap-2">
                          <Input id="em" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="name@example.com" />
                          <Button variant="outline" onClick={verifyEmail} disabled={!emailInput.trim()}>Check</Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
                      <Label htmlFor="att">Staff attestation</Label>
                      <Textarea
                        id="att"
                        rows={2}
                        value={attestation}
                        onChange={(e) => setAttestation(e.target.value)}
                        placeholder="Why you can vouch for this person — recorded against the collection."
                      />
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline" onClick={verifyAttestation} disabled={!attestation.trim()}>
                          Record attestation
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => { setStep('find'); setGuest(null); }}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setStep('release')} disabled={!verified}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3 · release */}
          {step === 'release' && activeGuest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Release to {activeGuest.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Marking a prescription collected sets it to completed and records how identity was proven.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {rxLoading ? (
                  <TableSkeleton rows={3} />
                ) : theirs.length === 0 ? (
                  <EmptyState
                    icon={PackageCheck}
                    title="Nothing to collect"
                    description={`${activeGuest.name} has no active prescriptions.`}
                  />
                ) : (
                  theirs.map((p) => {
                    const meds = medicinesOf(p);
                    const checked = selected.has(p.id);
                    return (
                      <label
                        key={p.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                          checked ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (v) next.add(p.id); else next.delete(p.id);
                              return next;
                            })
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">
                              {meds.length ? medicineLabel(meds[0]) : 'Prescription'}
                            </p>
                            <PrescriptionStatusBadge status={p.status} />
                          </div>
                          {meds.length > 1 && (
                            <p className="mt-0.5 text-xs text-muted-foreground">+{meds.length - 1} more</p>
                          )}
                          {p.diagnosis && <p className="mt-0.5 text-xs text-muted-foreground">{p.diagnosis}</p>}
                        </div>
                      </label>
                    );
                  })
                )}

                {theirs.length > 0 && (
                  <>
                    <Separator />
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox checked={counselled} onCheckedChange={(v) => setCounselled(!!v)} />
                      <div>
                        <p className="text-sm font-medium">Counselling offered</p>
                        <p className="text-xs text-muted-foreground">
                          Recorded on the prescription alongside the identity check.
                        </p>
                      </div>
                    </label>
                  </>
                )}

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep('verify')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={release}
                    disabled={chosen.length === 0 || updateRx.isPending}
                    loading={updateRx.isPending}
                  >
                    <PackageCheck className="mr-2 h-4 w-4" /> Complete collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side rail */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">This collection</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {!activeGuest ? (
                <p className="text-sm text-muted-foreground">
                  No {t.person.one.toLowerCase()} selected yet.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(activeGuest.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{activeGuest.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{activeGuest.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="Face enrolled" value={
                      <Badge variant={activeGuest.face_enrolled ? 'success' : 'muted'}>
                        {activeGuest.face_enrolled ? 'Yes' : 'No'}
                      </Badge>
                    } />
                    <Row label="Identity" value={
                      verified
                        ? <Badge variant="success" className="gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
                        : <Badge variant="muted" className="gap-1"><EyeOff className="h-3 w-3" /> Not verified</Badge>
                    } />
                    <Row label="Active prescriptions" value={rxLoading ? '…' : String(theirs.length)} />
                  </div>

                  {!verified && (
                    <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-center">
                      <EyeOff className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <p className="mt-2 text-xs font-medium">Medicines hidden</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Names stay masked until identity is verified, so a counter-facing screen cannot
                        leak them to the queue.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {attempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verification trail</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Failed attempts are kept — a pattern of failures is what a later review needs.
                </p>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {attempts.map((a) => {
                    const Icon = METHOD_ICON[a.method];
                    return (
                      <li key={a.id} className="flex items-start gap-3">
                        {a.ok
                          ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
                          : <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />}
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-sm font-medium capitalize">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            {a.method}
                          </p>
                          {a.detail && <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>}
                          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {formatDate(a.at, 'HH:mm')}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <Button size="sm" variant="outline" className="w-full" onClick={() => router.push('/prescriptions')}>
                <Search className="mr-2 h-4 w-4" /> Back to prescriptions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CameraCaptureDialog
        open={faceOpen}
        onOpenChange={setFaceOpen}
        title="Face verification"
        description="Capture a clear front-facing photo. A mismatch falls back to another method — it does not block the collection."
        submitLabel="Match face"
        isSubmitting={matching}
        onSubmit={handleFaceSubmit}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right text-sm">{value}</span>
    </div>
  );
}

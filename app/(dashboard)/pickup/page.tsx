'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Check, ScanFace, IdCard, CalendarCheck, KeyRound, UserCheck,
  Search, EyeOff, ShieldCheck, ShieldX, User, Users, Lock, PackageCheck, Printer,
  CreditCard, MessageSquareQuote, RotateCcw, AlertTriangle, Clock,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import { ControlledBadge } from '@/components/prescriptions/ControlledBadge';
import { popup } from '@/lib/popup';
import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils';
import {
  DEFAULT_FACE_MATCH_THRESHOLD, VERIFICATION_METHOD_LABELS, isControlled,
} from '@/constants/prescription';
import { MOCK_PATIENTS, readyForPatient } from '@/lib/mock/pharmacy';
import type {
  AuthorizedRepresentative, PharmacyPatient, VerificationAttempt, VerificationMethod,
} from '@/types/prescription';

/**
 * The pickup counter.
 *
 * Two decisions shape this whole screen.
 *
 * First, identity is a ladder, not a gate. Face recognition is one rung among
 * five and every rung stays available at all times — a camera that is down, a
 * patient who declined enrolment, or a match that simply comes in under
 * threshold must never be the thing that stands between someone and their
 * medication. A failed face match therefore offers the next rung rather than
 * ending the visit.
 *
 * Second, nothing identifiable is drawn until identity is established. The
 * release step stays masked behind a placeholder until a verification passes,
 * so a screen facing the queue cannot leak what the person in front of it is
 * collecting.
 *
 * Static for now — see docs/PHARMACY_MODULE.md for the endpoints behind it.
 */
export default function PickupPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <PickupPageInner />
    </Suspense>
  );
}

type StepId = 'find' | 'collector' | 'verify' | 'release' | 'complete';

const STEPS: { id: StepId; label: string; hint: string }[] = [
  { id: 'find',      label: 'Find patient',    hint: 'Search, scan or identify by face.' },
  { id: 'collector', label: 'Who is collecting', hint: 'The patient, or someone they authorised.' },
  { id: 'verify',    label: 'Verify identity', hint: 'Any rung of the ladder that succeeds.' },
  { id: 'release',   label: 'Release',         hint: 'Choose what leaves the shelf.' },
  { id: 'complete',  label: 'Payment',         hint: 'Counselling, payment and handover.' },
];

const METHOD_ICON: Record<VerificationMethod, LucideIcon> = {
  face: ScanFace,
  government_id: IdCard,
  date_of_birth: CalendarCheck,
  one_time_code: KeyRound,
  staff_attestation: UserCheck,
};

const METHOD_HINT: Record<VerificationMethod, string> = {
  face: 'Live camera match against the enrolled template.',
  government_id: 'Scan or key a driver licence, state ID or passport.',
  date_of_birth: 'Confirm date of birth plus one more detail on file.',
  one_time_code: 'Send a code to the phone number on the account.',
  staff_attestation: 'A pharmacist vouches for a person they recognise.',
};

function PickupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Opening from a worklist row ("Start pickup") already answers the search
  // step, so the counter opens on the next question rather than on a box the
  // operator has just filled in elsewhere.
  const [step, setStep] = useState<StepId>(() =>
    searchParams.get('patient') ? 'collector' : 'find',
  );
  const [query, setQuery] = useState('');
  const [patient, setPatient] = useState<PharmacyPatient | null>(() => {
    const id = searchParams.get('patient');
    return id ? MOCK_PATIENTS.find((p) => p.id === id) ?? null : null;
  });
  const [collector, setCollector] = useState<'patient' | string>('patient');
  const [attempts, setAttempts] = useState<VerificationAttempt[]>([]);
  const [faceOpen, setFaceOpen] = useState(false);
  const [dobValue, setDobValue] = useState('');
  const [selectedRx, setSelectedRx] = useState<Set<string>>(new Set());
  const [counselled, setCounselled] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [attestation, setAttestation] = useState('');

  const verified = attempts.some((a) => a.outcome === 'verified');
  const ready = patient ? readyForPatient(patient.id) : [];
  const rep: AuthorizedRepresentative | undefined =
    collector === 'patient' ? undefined : patient?.representatives.find((r) => r.id === collector);

  const chosen = ready.filter((rx) => selectedRx.has(rx.id));
  const anyControlled = chosen.some((rx) => isControlled(rx.drug.schedule));
  const total = chosen.reduce((sum, rx) => sum + (rx.claim?.copay ?? rx.price ?? 0), 0);

  function notWired(what: string) {
    popup.info(`${what} is not wired up yet`, {
      description: 'These screens are a static prototype. See docs/PHARMACY_MODULE.md for the endpoint this needs.',
    });
  }

  function reset() {
    setStep('find'); setQuery(''); setPatient(null); setCollector('patient');
    setAttempts([]); setDobValue(''); setSelectedRx(new Set());
    setCounselled(false); setIdChecked(false); setAttestation('');
  }

  /**
   * Scripted face result: the first capture lands under threshold and the
   * second clears it. The prototype leads with the failure on purpose — the
   * fallback ladder is the part of this design worth showing, and a demo that
   * always matches would hide it.
   */
  function handleFaceSubmit() {
    const priorFaceAttempts = attempts.filter((a) => a.method === 'face').length;
    const pass = priorFaceAttempts >= 1;
    const confidence = pass ? 96.8 : 71.4;
    setAttempts((prev) => [
      ...prev,
      {
        id: `v-${prev.length + 1}`,
        method: 'face',
        outcome: pass ? 'verified' : 'failed',
        confidence,
        threshold: DEFAULT_FACE_MATCH_THRESHOLD,
        at: new Date().toISOString(),
        by: 'T. Nkemelu, CPhT',
        note: pass ? undefined : 'Below threshold — offer another verification method.',
      },
    ]);
    setFaceOpen(false);
    if (pass) {
      popup.success(`Face matched at ${confidence}%`, { description: 'Identity verified. Prescriptions unlocked.' });
    } else {
      popup.warning(`No match — ${confidence}% is below the ${DEFAULT_FACE_MATCH_THRESHOLD}% threshold`, {
        description: 'Retake the photo, or use any other verification method. The pickup is not blocked.',
      });
    }
  }

  function recordAttempt(method: VerificationMethod, outcome: 'verified' | 'failed', note?: string) {
    setAttempts((prev) => [
      ...prev,
      {
        id: `v-${prev.length + 1}`,
        method,
        outcome,
        at: new Date().toISOString(),
        by: 'T. Nkemelu, CPhT',
        note,
      },
    ]);
  }

  function runMethod(method: VerificationMethod) {
    switch (method) {
      case 'face':
        if (patient?.faceEnrollment !== 'enrolled') {
          popup.info('No face template on file', {
            description:
              patient?.faceEnrollment === 'opted_out'
                ? 'This patient opted out of facial recognition. Use another method.'
                : 'This patient has not enrolled a face. Use another method, and offer enrolment afterwards.',
          });
          return;
        }
        setFaceOpen(true);
        return;
      case 'date_of_birth':
        if (dobValue && patient && dobValue === patient.dob) {
          recordAttempt('date_of_birth', 'verified');
          popup.success('Date of birth confirmed');
        } else {
          popup.warning('That date does not match the record', {
            description: 'Try again, or use another verification method.',
          });
        }
        return;
      case 'staff_attestation':
        if (!attestation.trim()) {
          popup.warning('Record why you can vouch for this person');
          return;
        }
        recordAttempt('staff_attestation', 'verified', attestation.trim());
        popup.success('Attestation recorded');
        return;
      default:
        recordAttempt(method, 'verified');
        popup.success(`${VERIFICATION_METHOD_LABELS[method]} confirmed`);
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Pickup counter</h1>
          <p className="text-muted-foreground">
            Identify who is collecting, verify them, then release what is on the shelf.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> New pickup
        </Button>
      </div>

      {/* Step rail */}
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
          {/* ── Step 1: find ─────────────────────────────────────────────── */}
          {step === 'find' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Find the patient</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Search on any detail the person can give you. A face scan can identify them too, but it
                  is never the only way in.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name, date of birth, phone or Rx number…"
                    className="flex-1"
                    autoFocus
                  />
                  <Button variant="outline" onClick={() => setFaceOpen(true)}>
                    <ScanFace className="mr-2 h-4 w-4" /> Identify by face
                  </Button>
                </div>

                <div className="space-y-2">
                  {MOCK_PATIENTS.filter((p) => {
                    const n = query.trim().toLowerCase();
                    if (!n) return true;
                    return [p.name, p.dob, p.phone ?? ''].join(' ').toLowerCase().includes(n);
                  }).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setPatient(p); setStep('collector'); }}
                      className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">{getInitials(p.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          DOB {formatDate(p.dob, 'MMM dd, yyyy')} · {p.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={p.readyCount > 0 ? 'success' : 'muted'}>
                          {p.readyCount} ready
                        </Badge>
                        <FaceEnrollmentPill state={p.faceEnrollment} />
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 2: collector ────────────────────────────────────────── */}
          {step === 'collector' && patient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Who is collecting?</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A pharmacy may release to someone involved in the patient&rsquo;s care. That person is a
                  record with its own scope and expiry — not a note on the account.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={collector} onValueChange={setCollector} className="space-y-2">
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                      collector === 'patient' ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                    )}
                  >
                    <RadioGroupItem value="patient" />
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">The patient</p>
                    </div>
                  </label>

                  {patient.representatives.map((r) => {
                    const expired = r.status !== 'active';
                    return (
                      <label
                        key={r.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                          collector === r.id ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                          expired && 'opacity-60',
                        )}
                      >
                        <RadioGroupItem value={r.id} disabled={expired} />
                        <Users className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.relationship} ·{' '}
                            {r.scope === 'all' ? 'All prescriptions' : `Listed only (${r.listedRxNumbers?.join(', ')})`}
                            {r.expiresOn ? ` · ${expired ? 'expired' : 'expires'} ${formatDate(r.expiresOn, 'MMM dd, yyyy')}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {!r.allowControlled && (
                            <Badge variant="muted" className="gap-1">
                              <Lock className="h-3 w-3" /> No controlled
                            </Badge>
                          )}
                          {expired && <Badge variant="destructive">Expired</Badge>}
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>

                <Button variant="outline" size="sm" onClick={() => notWired('Adding an authorised representative')}>
                  Add an authorised person
                </Button>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep('find')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setStep('verify')}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 3: verify ───────────────────────────────────────────── */}
          {step === 'verify' && patient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Verify {rep ? rep.name : patient.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Any one of these establishes identity. They are equals — if the camera is down or the
                  match fails, take the next one rather than turning the person away.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {verified ? (
                  <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-green-700 dark:text-green-400" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-green-900 dark:text-green-300">Identity verified</p>
                      <p className="text-xs text-green-800/80 dark:text-green-400/80">
                        Prescription details are now unlocked for this visit.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(['face', 'government_id', 'date_of_birth', 'one_time_code', 'staff_attestation'] as VerificationMethod[]).map((m) => {
                      const Icon = METHOD_ICON[m];
                      const faceUnavailable = m === 'face' && patient.faceEnrollment !== 'enrolled';
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => runMethod(m)}
                          className={cn(
                            'flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors',
                            'hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            faceUnavailable && 'opacity-60',
                          )}
                        >
                          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{VERIFICATION_METHOD_LABELS[m]}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {faceUnavailable
                                ? patient.faceEnrollment === 'opted_out'
                                  ? 'Patient opted out of facial recognition.'
                                  : 'No face template on file.'
                                : METHOD_HINT[m]}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!verified && (
                  <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="dob">Date of birth on file</Label>
                      <div className="flex gap-2">
                        <Input
                          id="dob"
                          type="date"
                          value={dobValue}
                          onChange={(e) => setDobValue(e.target.value)}
                          className="sm:w-[190px]"
                        />
                        <Button variant="outline" onClick={() => runMethod('date_of_birth')} disabled={!dobValue}>
                          Confirm
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <Label htmlFor="attest">Staff attestation</Label>
                      <Textarea
                        id="attest"
                        rows={2}
                        value={attestation}
                        onChange={(e) => setAttestation(e.target.value)}
                        placeholder="Why you can vouch for this person — e.g. known to the pharmacy for eight years."
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runMethod('staff_attestation')}
                          disabled={!attestation.trim()}
                        >
                          Record attestation
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep('collector')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setStep('release')} disabled={!verified}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 4: release ──────────────────────────────────────────── */}
          {step === 'release' && patient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Release from the shelf</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {rep
                    ? `${rep.name} may collect ${rep.scope === 'all' ? 'any prescription' : 'only the listed prescriptions'} for ${patient.name}.`
                    : 'Choose what the patient is taking today.'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {ready.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nothing is on the will-call shelf for this patient right now.
                  </p>
                ) : (
                  ready.map((rx) => {
                    const blockedForRep =
                      !!rep &&
                      ((isControlled(rx.drug.schedule) && !rep.allowControlled) ||
                        (rep.scope === 'listed' && !rep.listedRxNumbers?.includes(rx.rxNumber)));
                    const checked = selectedRx.has(rx.id);
                    return (
                      <label
                        key={rx.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                          checked ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                          blockedForRep && 'cursor-not-allowed opacity-60',
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={blockedForRep}
                          onCheckedChange={(v) =>
                            setSelectedRx((prev) => {
                              const next = new Set(prev);
                              if (v) next.add(rx.id); else next.delete(rx.id);
                              return next;
                            })
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{rx.drug.name} {rx.drug.strength}</p>
                            <ControlledBadge schedule={rx.drug.schedule} />
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Rx <span className="font-mono">{rx.rxNumber}</span> · {rx.quantity}{' '}
                            {rx.drug.form.toLowerCase()} · {rx.willCallBin}
                          </p>
                          {blockedForRep && (
                            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                              {isControlled(rx.drug.schedule) && !rep?.allowControlled
                                ? 'This representative is not authorised for controlled substances.'
                                : 'Outside this representative\u2019s authorised list.'}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatCurrency(rx.claim?.copay ?? rx.price ?? 0)}
                        </p>
                      </label>
                    );
                  })
                )}

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep('verify')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setStep('complete')} disabled={chosen.length === 0}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 5: complete ─────────────────────────────────────────── */}
          {step === 'complete' && patient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Counselling, payment and handover</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3 rounded-lg border p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <Checkbox checked={counselled} onCheckedChange={(v) => setCounselled(!!v)} />
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <MessageSquareQuote className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        Counselling offered by the pharmacist
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Records that the offer was made and what the patient chose. Required on a new
                        prescription in most states.
                      </p>
                    </div>
                  </label>

                  {anyControlled && (
                    <>
                      <Separator />
                      <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox checked={idChecked} onCheckedChange={(v) => setIdChecked(!!v)} />
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium">
                            <IdCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            Photo ID inspected for the controlled substance
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            A controlled substance needs an ID check at handover regardless of how identity
                            was verified earlier.
                          </p>
                        </div>
                      </label>
                    </>
                  )}
                </div>

                <div className="rounded-lg border p-4">
                  <p className="mb-3 text-sm font-semibold">Due today</p>
                  <ul className="space-y-2">
                    {chosen.map((rx) => (
                      <li key={rx.id} className="flex items-center justify-between text-sm">
                        <span className="truncate pr-4">{rx.drug.name} {rx.drug.strength}</span>
                        <span className="tabular-nums">{formatCurrency(rx.claim?.copay ?? rx.price ?? 0)}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => notWired('Taking payment')}>
                    <CreditCard className="mr-2 h-4 w-4" /> Take payment
                  </Button>
                  <Button variant="outline" onClick={() => notWired('Printing the receipt')}>
                    <Printer className="mr-2 h-4 w-4" /> Receipt
                  </Button>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep('release')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    disabled={!counselled || (anyControlled && !idChecked)}
                    onClick={() => {
                      popup.success('Pickup completed', {
                        description: `${chosen.length} prescription${chosen.length === 1 ? '' : 's'} released to ${rep ? rep.name : patient.name}. In the real system this writes the dispense record and the audit trail.`,
                      });
                      reset();
                    }}
                  >
                    <PackageCheck className="mr-2 h-4 w-4" /> Complete pickup
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Side rail ──────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">This visit</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {!patient ? (
                <p className="text-sm text-muted-foreground">No patient selected yet.</p>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 text-primary">{getInitials(patient.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">DOB {formatDate(patient.dob, 'MMM dd, yyyy')}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="Collecting" value={rep ? `${rep.name} (${rep.relationship})` : 'The patient'} />
                    <Row label="Face enrolment" value={<FaceEnrollmentPill state={patient.faceEnrollment} />} />
                    <Row
                      label="Identity"
                      value={
                        verified ? (
                          <Badge variant="success" className="gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
                        ) : (
                          <Badge variant="muted" className="gap-1"><EyeOff className="h-3 w-3" /> Not verified</Badge>
                        )
                      }
                    />
                    <Row label="On the shelf" value={`${ready.length} ready`} />
                  </div>

                  {/* PHI stays masked until identity is established. */}
                  {!verified && (
                    <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-center">
                      <EyeOff className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      <p className="mt-2 text-xs font-medium">Prescription details hidden</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Medication names stay masked until identity is verified, so a counter-facing screen
                        cannot leak them to the queue.
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
                  Failed attempts are kept. A pattern of failures is the thing worth seeing later.
                </p>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {attempts.map((a) => {
                    const ok = a.outcome === 'verified';
                    return (
                      <li key={a.id} className="flex items-start gap-3">
                        {ok ? (
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
                        ) : (
                          <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {VERIFICATION_METHOD_LABELS[a.method]}
                            {typeof a.confidence === 'number' && (
                              <span className="ml-1.5 font-normal text-muted-foreground">
                                {a.confidence}% vs {a.threshold}% threshold
                              </span>
                            )}
                          </p>
                          {a.note && <p className="mt-0.5 text-xs text-muted-foreground">{a.note}</p>}
                          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {formatDate(a.at, 'HH:mm')} · {a.by}
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
            <CardHeader><CardTitle className="text-base">Where this goes next</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Completing a pickup writes a dispense record, an audit entry per prescription released, and
                a payment row. None of that is wired yet.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => router.push('/prescriptions')}
              >
                <Search className="mr-2 h-4 w-4" /> Back to the worklist
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CameraCaptureDialog
        open={faceOpen}
        onOpenChange={setFaceOpen}
        title="Face verification"
        description={`Capture a clear front-facing photo. A match at or above ${DEFAULT_FACE_MATCH_THRESHOLD}% verifies identity; anything lower falls back to another method.`}
        submitLabel="Match face"
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

function FaceEnrollmentPill({ state }: { state: PharmacyPatient['faceEnrollment'] }) {
  const map = {
    enrolled:     { label: 'Enrolled',   variant: 'success' as const },
    not_enrolled: { label: 'Not enrolled', variant: 'muted' as const },
    opted_out:    { label: 'Opted out',  variant: 'warning' as const },
    expired:      { label: 'Expired',    variant: 'muted' as const },
  };
  const { label, variant } = map[state];
  return <Badge variant={variant}>{label}</Badge>;
}

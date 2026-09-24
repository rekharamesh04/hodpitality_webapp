'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Pill, ShieldCheck, PauseCircle, XCircle, PhoneCall, Printer,
  FileText, CreditCard, History, ScrollText, User, Stethoscope, CalendarDays,
  AlertTriangle, PackageCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { PrescriptionStatusBadge } from '@/components/prescriptions/PrescriptionStatusBadge';
import { ControlledBadge } from '@/components/prescriptions/ControlledBadge';
import { ClinicalAlertList } from '@/components/prescriptions/ClinicalAlertList';
import { PipelineStepper } from '@/components/prescriptions/PipelineStepper';
import { popup } from '@/lib/popup';
import { cn, formatCurrency, formatDate, getInitials, getRelativeTime } from '@/lib/utils';
import {
  CLAIM_STATUS_LABELS, SOURCE_LABELS, isBlockingSeverity,
} from '@/constants/prescription';
import {
  MOCK_AUDIT_EVENTS, MOCK_FILL_HISTORY, findPatient, findPrescription,
} from '@/lib/mock/pharmacy';
import type { ClinicalAlert } from '@/types/prescription';

/**
 * One prescription, end to end.
 *
 * The layout follows what a pharmacist verifying a fill actually reads, in
 * order: who it is for, what is being dispensed, what the screening found,
 * what the plan said, and who has touched the record. The clinical alerts sit
 * above the fold on the default tab because a contraindication that needs a
 * click to discover is a contraindication that gets missed.
 *
 * Static for now — see docs/PHARMACY_MODULE.md for the endpoints behind it.
 */
export default function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const rx = findPrescription(id);
  const patient = rx ? findPatient(rx.patientId) : undefined;

  const [notes, setNotes] = useState('');
  const [overrideTarget, setOverrideTarget] = useState<ClinicalAlert | null>(null);
  const [holdOpen, setHoldOpen] = useState(false);

  const openBlocking = useMemo(
    () => (rx?.alerts ?? []).filter((a) => !a.overriddenAt && isBlockingSeverity(a.severity)),
    [rx],
  );

  function notWired(what: string) {
    popup.info(`${what} is not wired up yet`, {
      description: 'These screens are a static prototype. See docs/PHARMACY_MODULE.md for the endpoint this needs.',
    });
  }

  if (!rx) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/prescriptions')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All prescriptions
        </Button>
        <ErrorState
          title="Prescription not found"
          message="No prescription with that number exists in this prototype's sample data."
          onRetry={() => router.push('/prescriptions')}
        />
      </div>
    );
  }

  const claim = rx.claim;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/prescriptions')} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        All prescriptions
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Pill className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold sm:text-2xl">
                    {rx.drug.name} {rx.drug.strength}
                  </h1>
                  <ControlledBadge schedule={rx.drug.schedule} />
                  <PrescriptionStatusBadge status={rx.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rx <span className="font-mono">{rx.rxNumber}</span> · {rx.drug.form} ·{' '}
                  {rx.drug.genericName ?? rx.drug.name} · NDC <span className="font-mono">{rx.drug.ndc}</span>
                </p>
                <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm font-medium">{rx.sig}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => notWired('Printing the label')}>
                <Printer className="mr-2 h-4 w-4" /> Label
              </Button>
              <Button size="sm" variant="outline" onClick={() => setHoldOpen(true)}>
                <PauseCircle className="mr-2 h-4 w-4" /> Hold
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  openBlocking.length
                    ? popup.warning('Resolve the blocking alerts first', {
                        description: `${openBlocking.length} alert${openBlocking.length === 1 ? '' : 's'} at severe or higher must be reviewed and overridden before this fill can be verified.`,
                      })
                    : notWired('Verification')
                }
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Verify &amp; fill
              </Button>
            </div>
          </div>

          <Separator />

          <PipelineStepper status={rx.status} stalledAfter="insurance" />
        </CardContent>
      </Card>

      {/* Blocking-alert banner — the one thing that must never need a click to find. */}
      {openBlocking.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700 dark:text-red-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-red-900 dark:text-red-300">
              {openBlocking.length} alert{openBlocking.length === 1 ? '' : 's'} blocking this fill
            </p>
            <p className="text-xs text-red-900/80 dark:text-red-400/80">
              A pharmacist must review and record a reason before dispensing. The system does not decide
              this — it only refuses to let it pass silently.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="clinical">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="clinical">
                <ShieldCheck className="mr-2 h-4 w-4" /> Clinical
                {openBlocking.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{openBlocking.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="details"><FileText className="mr-2 h-4 w-4" /> Details</TabsTrigger>
              <TabsTrigger value="insurance"><CreditCard className="mr-2 h-4 w-4" /> Insurance</TabsTrigger>
              <TabsTrigger value="history"><History className="mr-2 h-4 w-4" /> Fill history</TabsTrigger>
              <TabsTrigger value="audit"><ScrollText className="mr-2 h-4 w-4" /> Audit</TabsTrigger>
            </TabsList>

            {/* Clinical */}
            <TabsContent value="clinical" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Clinical screening</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ClinicalAlertList alerts={rx.alerts} onOverride={setOverrideTarget} />

                  <div>
                    <p className="mb-2 text-sm font-medium">Pharmacist notes</p>
                    <Textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Clinical judgement, counselling points, prescriber contact…"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" variant="outline" disabled={!notes.trim()} onClick={() => notWired('Saving notes')}>
                        Save note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details */}
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Prescription</CardTitle></CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    <Field label="Quantity" value={`${rx.quantity} ${rx.drug.form.toLowerCase()}`} />
                    <Field label="Days supply" value={rx.daysSupply ? `${rx.daysSupply} days` : '—'} />
                    <Field label="Refills" value={`${rx.refillsRemaining} remaining of ${rx.refillsAuthorized}`} />
                    <Field label="DAW" value={rx.daw === 1 ? '1 — substitution not allowed' : '0 — substitution permitted'} />
                    <Field label="Written" value={formatDate(rx.writtenDate, 'MMM dd, yyyy')} />
                    <Field label="Expires" value={formatDate(rx.expiresOn, 'MMM dd, yyyy')} />
                    <Field label="Source" value={SOURCE_LABELS[rx.source]} />
                    <Field label="Manufacturer" value={rx.drug.manufacturer ?? '—'} />
                    <Field label="Therapeutic class" value={rx.drug.therapeuticClass ?? '—'} />
                    <Field label="Will-call bin" value={rx.willCallBin ?? 'Not yet shelved'} />
                  </dl>

                  <Separator className="my-5" />

                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Prescriber
                  </p>
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    <Field label="Name" value={rx.prescriber.name} />
                    <Field label="Clinic" value={rx.prescriber.clinic ?? '—'} />
                    <Field label="NPI" value={rx.prescriber.npi} mono />
                    <Field label="DEA" value={rx.prescriber.dea ?? '—'} mono />
                    <Field label="Phone" value={rx.prescriber.phone ?? '—'} />
                  </dl>

                  <Button size="sm" variant="outline" className="mt-5" onClick={() => notWired('Contacting the prescriber')}>
                    <PhoneCall className="mr-2 h-4 w-4" /> Contact prescriber
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance */}
            <TabsContent value="insurance" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Claim</CardTitle></CardHeader>
                <CardContent>
                  {!claim ? (
                    <p className="text-sm text-muted-foreground">
                      No claim has been submitted for this prescription yet.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            claim.status === 'paid' ? 'success'
                              : claim.status === 'rejected' ? 'destructive'
                              : claim.status === 'prior_auth' ? 'warning'
                              : 'muted'
                          }
                        >
                          {CLAIM_STATUS_LABELS[claim.status]}
                        </Badge>
                        {claim.rejectCode && (
                          <span className="text-xs text-muted-foreground">
                            NCPDP reject {claim.rejectCode} — {claim.rejectReason}
                          </span>
                        )}
                      </div>

                      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                        <Field label="Plan" value={claim.planName ?? '—'} />
                        <Field label="Member ID" value={claim.memberId ?? '—'} mono />
                        <Field label="BIN" value={claim.bin ?? '—'} mono />
                        <Field label="PCN" value={claim.pcn ?? '—'} mono />
                        <Field label="Group" value={claim.group ?? '—'} mono />
                        <Field label="Submitted" value={claim.submittedAt ? formatDate(claim.submittedAt, 'MMM dd, yyyy HH:mm') : '—'} />
                      </dl>

                      <Separator />

                      <div className="grid grid-cols-3 gap-4">
                        <Money label="Cash price" value={rx.price} />
                        <Money label="Plan paid" value={claim.planPaid} />
                        <Money label="Patient copay" value={claim.copay} emphasis />
                      </div>

                      {(claim.status === 'rejected' || claim.status === 'prior_auth') && (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => notWired('Resubmitting the claim')}>
                            Resubmit claim
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => notWired('Starting a prior authorization')}>
                            Start prior authorization
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => notWired('Billing as cash')}>
                            Bill as cash
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fill history */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Previous fills</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="hidden sm:table-cell">Qty</TableHead>
                          <TableHead className="hidden md:table-cell">Filled by</TableHead>
                          <TableHead className="hidden md:table-cell">Verified by</TableHead>
                          <TableHead>Collected by</TableHead>
                          <TableHead className="text-right">Copay</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MOCK_FILL_HISTORY.map((f) => (
                          <TableRow key={f.id}>
                            <TableCell className="whitespace-nowrap text-sm">{formatDate(f.date, 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="hidden text-sm sm:table-cell">{f.quantity} / {f.daysSupply}d</TableCell>
                            <TableCell className="hidden text-sm md:table-cell">{f.filledBy}</TableCell>
                            <TableCell className="hidden text-sm md:table-cell">{f.verifiedBy}</TableCell>
                            <TableCell className="text-sm">{f.collectedBy}</TableCell>
                            <TableCell className="text-right text-sm tabular-nums">{formatCurrency(f.copay)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit */}
            <TabsContent value="audit" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Access trail</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Every read is recorded, not only every change — the log exists to answer who saw this
                    record.
                  </p>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {MOCK_AUDIT_EVENTS.map((e) => (
                      <li key={e.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 pb-1">
                          <p className="text-sm font-medium">{e.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.actor} · {e.actorRole} · {e.target}
                            {e.device ? ` · ${e.device}` : ''}
                          </p>
                          {e.detail && <p className="mt-0.5 text-xs text-muted-foreground">{e.detail}</p>}
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {formatDate(e.at, 'MMM dd, yyyy HH:mm')} · {getRelativeTime(e.at)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Patient</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(rx.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{rx.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    DOB {formatDate(rx.patientDob, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <Field label="Phone" value={rx.patientPhone ?? '—'} />
                <Field label="Plan" value={patient?.insurancePlan ?? claim?.planName ?? '—'} />
                <div>
                  <dt className="text-xs text-muted-foreground">Allergies</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {patient?.allergies?.length ? (
                      patient.allergies.map((a) => (
                        <Badge key={a} variant="destructive">{a}</Badge>
                      ))
                    ) : (
                      <span className="text-sm">None recorded</span>
                    )}
                  </dd>
                </div>
              </dl>

              <Separator />

              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" onClick={() => router.push(`/guests/${rx.patientId}`)}>
                  <User className="mr-2 h-4 w-4" /> Patient profile
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push(`/pickup?patient=${rx.patientId}`)}>
                  <PackageCheck className="mr-2 h-4 w-4" /> Start pickup
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Timing</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <Field label="Received" value={rx.createdAt ? getRelativeTime(rx.createdAt) : '—'} />
                <Field label="In current queue" value={rx.queuedAt ? getRelativeTime(rx.queuedAt) : '—'} />
                <Field label="Filled" value={rx.filledAt ? formatDate(rx.filledAt, 'MMM dd, HH:mm') : 'Not yet'} />
                <Field label="Ready" value={rx.readyAt ? formatDate(rx.readyAt, 'MMM dd, HH:mm') : 'Not yet'} />
                <Field label="Collected" value={rx.pickedUpAt ? formatDate(rx.pickedUpAt, 'MMM dd, HH:mm') : 'Not yet'} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Other actions</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button size="sm" variant="outline" onClick={() => notWired('Transferring the prescription')}>
                <CalendarDays className="mr-2 h-4 w-4" /> Transfer out
              </Button>
              <Button size="sm" variant="outline" onClick={() => notWired('Returning to stock')}>
                <PackageCheck className="mr-2 h-4 w-4" /> Return to stock
              </Button>
              <Button size="sm" variant="destructive" onClick={() => notWired('Cancelling')}>
                <XCircle className="mr-2 h-4 w-4" /> Cancel prescription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Override — a reason is mandatory, because an override with no reason is not a record of judgement. */}
      <ConfirmDialog
        open={!!overrideTarget}
        onOpenChange={(v) => !v && setOverrideTarget(null)}
        title="Override this alert?"
        description={
          overrideTarget
            ? `"${overrideTarget.title}" will be recorded as reviewed and accepted under your name. This is logged against the fill and is visible to anyone who reviews it later.`
            : ''
        }
        confirmLabel="Record override"
        onConfirm={() => {
          setOverrideTarget(null);
          notWired('Recording the override');
        }}
      />

      <ConfirmDialog
        open={holdOpen}
        onOpenChange={setHoldOpen}
        title="Put this prescription on hold?"
        description="It leaves the active workflow and stops appearing in the filling queues until someone releases it."
        confirmLabel="Put on hold"
        onConfirm={() => { setHoldOpen(false); notWired('Putting the prescription on hold'); }}
      />
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 text-sm', mono && 'font-mono text-xs')}>{value}</dd>
    </div>
  );
}

function Money({ label, value, emphasis }: { label: string; value?: number; emphasis?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 font-semibold tabular-nums', emphasis ? 'text-lg text-primary' : 'text-sm')}>
        {typeof value === 'number' ? formatCurrency(value) : '—'}
      </p>
    </div>
  );
}

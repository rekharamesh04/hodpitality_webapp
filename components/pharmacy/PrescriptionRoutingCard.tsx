'use client';

import { useState } from 'react';
import { ArrowRightLeft, Building2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PharmacySelect, preferredPharmacyOf } from '@/components/pharmacy/PharmacySelect';
import { useSendToPharmacy } from '@/hooks/usePharmacies';
import { useGuest } from '@/hooks/use-guests';
import { formatDate } from '@/lib/utils';
import { PHARMACY_ROUTE_LABELS, medicinesOf, type PharmacyRouteStatus, type Prescription } from '@/types/prescription';

/**
 * Where this prescription is filled.
 *
 * At a hospital: sent to the patient's pharmacy (and how far it has got), or a button to send it —
 * defaulting to the pharmacy on the patient's record. At a pharmacy: which provider sent it.
 * Renders nothing for a pharmacy's own prescriptions, which go nowhere.
 */
export function PrescriptionRoutingCard({ prescription: p, canSend }: { prescription: Prescription; canSend: boolean }) {
  const send = useSendToPharmacy();
  const [choice, setChoice] = useState<string | null>(null);
  const isReceived = !!p.sourcePrescriptionId;
  const { data: patient } = useGuest(canSend && !p.pharmacyName && !isReceived ? p.customerId : '');
  const preferred = preferredPharmacyOf(patient);
  const pharmacyId = choice ?? preferred.id;
  const typed = medicinesOf(p).some((m) => (typeof m === 'string' ? m : m?.name)?.trim());

  if (isReceived) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowRightLeft className="h-4 w-4 text-primary" aria-hidden="true" /> Received prescription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>From <span className="font-medium">{p.sourceTenantName || 'another provider'}</span>
            {p.doctorName ? <> · {p.doctorName}</> : null}</p>
          {p.receivedAt && <p className="text-xs text-muted-foreground">Received {formatDate(p.receivedAt, 'MMM dd, yyyy HH:mm')}</p>}
        </CardContent>
      </Card>
    );
  }

  if (p.pharmacyName) {
    const status = (p.pharmacyStatus as PharmacyRouteStatus) || 'sent';
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" aria-hidden="true" /> Sent to {p.pharmacyName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium">{PHARMACY_ROUTE_LABELS[status] ?? status}</p>
          <p className="text-xs text-muted-foreground">
            {p.routedAt ? `Sent ${formatDate(p.routedAt, 'MMM dd, yyyy HH:mm')}` : ''}
            {p.pharmacyStatusAt ? ` · updated ${formatDate(p.pharmacyStatusAt, 'MMM dd, HH:mm')}` : ''}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!canSend || p.status !== 'active') return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Send className="h-4 w-4 text-primary" aria-hidden="true" /> Send to the patient&rsquo;s pharmacy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="route-pharmacy">Pharmacy</Label>
          <PharmacySelect
            id="route-pharmacy"
            value={pharmacyId}
            onChange={(id) => setChoice(id)}
            disabled={send.isPending}
            noneLabel="Choose a pharmacy"
          />
          {preferred.id && choice === null && (
            <p className="text-xs text-muted-foreground">The patient&rsquo;s preferred pharmacy.</p>
          )}
        </div>
        {!typed && <p className="text-xs text-amber-700 dark:text-amber-400">Type the medicines first — a photo alone cannot be sent.</p>}
        <Button
          size="sm"
          disabled={!pharmacyId || !typed}
          loading={send.isPending}
          onClick={() => send.mutate({ prescriptionId: p.id, pharmacyTenantId: pharmacyId })}
        >
          <Send className="mr-2 h-4 w-4" /> Send
        </Button>
      </CardContent>
    </Card>
  );
}

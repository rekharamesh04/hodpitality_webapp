'use client';

import { useMemo, useState } from 'react';
import { CalendarCheck2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStaff } from '@/hooks/useStaff';
import { useGuests } from '@/hooks/use-guests';
import { useOrgTimezone } from '@/hooks/useSettings';
import { clinicReadiness, stepsLeft } from '@/lib/zocdoc-readiness';
import { ZocdocPendingDialog } from './ZocdocPendingDialog';

/**
 * Settings → Zocdoc. Not a working connection: Zocdoc has to approve the
 * partner account first. "Connect" explains that in a popup and shows how
 * ready the clinic already is, counted from its own records.
 */
export function ZocdocSettingsCard() {
  const [open, setOpen] = useState(false);
  const { data: staff } = useStaff();
  const { data: guests } = useGuests({ limit: 500 });
  const { data: timezone } = useOrgTimezone();

  const items = useMemo(() => clinicReadiness({
    staff: staff ?? [],
    patients: guests?.data ?? [],
    timezone: timezone ?? null,
  }), [staff, guests, timezone]);
  const left = stepsLeft(items);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CalendarCheck2 className="h-4 w-4 text-muted-foreground" aria-hidden />
          <CardTitle className="text-base">Zocdoc</CardTitle>
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            Pending — not connected
          </Badge>
        </div>
        <CardDescription>
          Let patients book your doctors on Zocdoc, Google and other booking sites, with bookings landing in
          your calendar. Coming soon: waiting for Zocdoc to approve our partner account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {left === 0
            ? 'Your clinic is ready on its side. Only the Zocdoc steps are left.'
            : `${left} ${left === 1 ? 'step' : 'steps'} you can do now to get ready.`}
        </p>
        <Button variant="outline" onClick={() => setOpen(true)}>Connect Zocdoc</Button>
      </CardContent>

      <ZocdocPendingDialog
        open={open}
        onOpenChange={setOpen}
        title="Connect Zocdoc"
        description="What is ready in your clinic, and what is waiting on Zocdoc."
        items={items}
      />
    </Card>
  );
}

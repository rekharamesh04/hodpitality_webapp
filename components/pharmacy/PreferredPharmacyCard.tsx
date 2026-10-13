'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NO_PREFERRED_PHARMACY, PharmacySelect, preferredPharmacyOf } from '@/components/pharmacy/PharmacySelect';
import { useUpdateGuest } from '@/hooks/use-guests';
import type { Guest } from '@/types';

/** The pharmacy a patient's prescriptions go to by default — what a US clinic asks at registration. */
export function PreferredPharmacyCard({ guestId, guest }: { guestId: string; guest: Guest }) {
  const update = useUpdateGuest();
  const saved = preferredPharmacyOf(guest);
  const [value, setValue] = useState(saved);
  useEffect(() => {
    setValue(preferredPharmacyOf(guest));
    // Re-read only when the stored value changes, not on every refetch of the same record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest.preferredPharmacyTenantId, guest.preferredPharmacyName]);
  const changed = value.id !== saved.id;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4 text-primary" aria-hidden="true" /> Preferred pharmacy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <PharmacySelect
          value={value.id}
          onChange={(id, name) => setValue({ id, name })}
          disabled={update.isPending}
          noneLabel="None — prescriptions stay here"
        />
        <p className="text-xs text-muted-foreground">Prescriptions written here are sent to this pharmacy by default.</p>
        {changed && (
          <Button
            size="sm"
            loading={update.isPending}
            onClick={() => update.mutate({
              id: guestId,
              data: {
                preferredPharmacyTenantId: value.id || NO_PREFERRED_PHARMACY,
                preferredPharmacyName: value.name || NO_PREFERRED_PHARMACY,
              },
            })}
          >
            Save
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

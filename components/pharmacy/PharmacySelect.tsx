'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePharmacies } from '@/hooks/usePharmacies';

import type { Guest } from '@/types';

/** Radix Select refuses an empty item value, so "none" needs a sentinel. */
export const NO_PHARMACY = '__none__';

/**
 * What a patient record stores for "no preferred pharmacy". The API skips empty values on update,
 * so clearing the field writes this instead of a blank.
 */
export const NO_PREFERRED_PHARMACY = 'none';

/** A patient's preferred pharmacy, with the "none" marker read as no pharmacy. */
export function preferredPharmacyOf(guest?: Pick<Guest, 'preferredPharmacyTenantId' | 'preferredPharmacyName'> | null) {
  const id = guest?.preferredPharmacyTenantId;
  if (!id || id === NO_PREFERRED_PHARMACY) return { id: '', name: '' };
  return { id, name: guest?.preferredPharmacyName ?? '' };
}

/**
 * Pick a pharmacy from the platform's directory — or none.
 *
 * `noneLabel` says what "none" means where it is used: no preferred pharmacy on a patient, or
 * "don't send" on a prescription (filled in-house, or handed to the patient on paper).
 */
export function PharmacySelect({
  id, value, onChange, disabled, noneLabel = 'No pharmacy',
}: {
  id?: string;
  /** A pharmacy tenant id, or '' for none. */
  value: string;
  onChange: (tenantId: string, name: string) => void;
  disabled?: boolean;
  noneLabel?: string;
}) {
  const { data: pharmacies, isLoading, isError } = usePharmacies();
  const list = pharmacies ?? [];
  // A preferred pharmacy that has since closed still shows, so the field never looks blank.
  const known = !value || list.some((p) => p.tenantId === value);

  return (
    <Select
      value={value || NO_PHARMACY}
      onValueChange={(v) => {
        if (v === NO_PHARMACY) onChange('', '');
        else onChange(v, list.find((p) => p.tenantId === v)?.name ?? '');
      }}
      disabled={disabled || isLoading}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={isLoading ? 'Loading pharmacies…' : isError ? 'Pharmacies unavailable' : noneLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_PHARMACY}>{noneLabel}</SelectItem>
        {!known && <SelectItem value={value}>No longer available</SelectItem>}
        {list.map((p) => (
          <SelectItem key={p.tenantId} value={p.tenantId}>
            {p.name}{p.address ? ` — ${p.address}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

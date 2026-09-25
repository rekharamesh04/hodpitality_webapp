'use client';

import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useStaff } from '@/hooks/useStaff';
import type { Staff } from '@/types';

function staffIdOf(s: Staff): string {
  return s.id || (s.PK ? s.PK.replace('STAFF#', '') : '');
}

/**
 * Pick a staff member — or be told why there is no one to pick.
 *
 * A new company has no staff until someone adds them (its admin is a login, not
 * a staff row), and an empty dropdown opens onto nothing and reads as broken.
 * So an empty list says so and links to where staff are added.
 */
export function StaffSelect({
  id,
  value,
  onChange,
  disabled,
  placeholder = 'Select staff',
  noun = 'staff member',
}: {
  id?: string;
  value: string;
  onChange: (staffId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** What the tenant calls one, e.g. "pharmacist" — used in the empty message. */
  noun?: string;
}) {
  const { data, isLoading, isError, refetch } = useStaff({ limit: 50 });
  // Radix refuses an item with an empty value, so a row without an id is left out.
  const staff = (data ?? []).filter((s) => staffIdOf(s));

  if (isError) {
    return (
      <div className="flex h-10 items-center justify-between gap-2 rounded-md border border-destructive/40 px-3 text-sm">
        <span className="text-destructive">Couldn&apos;t load staff</span>
        <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (!isLoading && staff.length === 0) {
    return (
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 rounded-md border border-dashed px-3 py-2 text-sm">
        <span className="text-muted-foreground">No {noun}s added yet</span>
        <Link href="/staff?action=add" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Add {noun}
        </Link>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={isLoading ? 'Loading…' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {staff.map((s) => (
          <SelectItem key={staffIdOf(s)} value={staffIdOf(s)}>
            {s.name}{s.department ? ` · ${s.department}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

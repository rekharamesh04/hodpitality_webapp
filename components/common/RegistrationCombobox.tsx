'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { useRegistrations } from '@/hooks/useRegistrations';
import { cn, formatCurrency } from '@/lib/utils';
import type { Registration } from '@/types';

interface RegistrationComboboxProps {
  selected: Registration | null;
  onSelect: (registration: Registration) => void;
  disabled?: boolean;
  /** Hide registrations that are already fully paid (default true). */
  unpaidOnly?: boolean;
}

export function RegistrationCombobox({ selected, onSelect, disabled, unpaidOnly = true }: RegistrationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useRegistrations({});

  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter((r) => !unpaidOnly || r.paymentStatus !== 'paid')
      .filter((r) =>
        !q ||
        [r.guestName, r.guestEmail, r.event, r.id].some((v) => v?.toLowerCase().includes(q))
      )
      .slice(0, 50);
  }, [data, search, unpaidOnly]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-auto min-h-10 w-full justify-between py-2 font-normal"
        >
          {selected ? (
            <span className="flex min-w-0 flex-col items-start text-left">
              <span className="truncate font-medium">{selected.guestName || 'Unnamed guest'}</span>
              <span className="truncate text-xs text-muted-foreground">
                {selected.event || 'No event'}
                {selected.amount != null && ` · ${formatCurrency(selected.amount)}`}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select a registration…</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search guest, email or event…" value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading registrations…
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {unpaidOnly ? 'No unpaid registrations found.' : 'No registrations found.'}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((r) => (
                    <CommandItem
                      key={r.id}
                      value={r.id}
                      onSelect={() => {
                        onSelect(r);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4 shrink-0', selected?.id === r.id ? 'opacity-100' : 'opacity-0')}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.guestName || 'Unnamed guest'}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {r.event || 'No event'}
                          {r.guestEmail && ` · ${r.guestEmail}`}
                        </p>
                      </div>
                      {r.amount != null && (
                        <span className="ml-2 shrink-0 text-xs font-medium tabular-nums">{formatCurrency(r.amount)}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

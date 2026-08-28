'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { useVenues } from '@/hooks/useVenues';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { Venue } from '@/types';

function getVenueId(v: Venue): string {
  return v.id ?? (v.PK ? v.PK.replace('VENUE#', '') : '') ?? '';
}

interface VenueComboboxProps {
  selected: Venue | null;
  onSelectVenue: (venue: Venue) => void;
  disabled?: boolean;
}

export function VenueCombobox({ selected, onSelectVenue, disabled }: VenueComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useVenues({ search: debouncedSearch || undefined });
  const venues = (data ?? []).slice(0, 8);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate">{selected.name}</span>
              {selected.location && <span className="shrink-0 text-xs text-muted-foreground">· {selected.location}</span>}
            </span>
          ) : (
            <span className="text-muted-foreground">Search venues…</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search venues by name…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[240px]">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Searching…
              </div>
            ) : venues.length === 0 ? (
              <CommandEmpty>No venues found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {venues.map((v) => {
                  const id = getVenueId(v);
                  return (
                    <CommandItem
                      key={id}
                      value={id}
                      onSelect={() => {
                        onSelectVenue(v);
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      <Check className={cn('h-4 w-4', selected && getVenueId(selected) === id ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{v.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{v.location || (v.capacity ? `Capacity ${v.capacity}` : '—')}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { useCustomers } from '@/hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { Customer } from '@/services/customer.service';

interface CustomerComboboxProps {
  selected: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  disabled?: boolean;
}

export function CustomerCombobox({ selected, onSelectCustomer, disabled }: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useCustomers({ search: debouncedSearch || undefined, limit: 8 });
  const customers = data?.data ?? [];

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
              {selected.tier && <span className="shrink-0 text-xs text-muted-foreground">· {selected.tier}</span>}
            </span>
          ) : (
            <span className="text-muted-foreground">Search customers…</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, email or phone…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[240px]">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Searching…
              </div>
            ) : customers.length === 0 ? (
              <CommandEmpty>No customers found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {customers.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.id}
                    onSelect={() => {
                      onSelectCustomer(c);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Check className={cn('h-4 w-4', selected?.id === c.id ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm">{c.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{c.email || c.phone || '—'}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useUIStore } from '@/store';
import { FLAT_NAV } from '@/constants/navigation';
import {
  UserPlus, UserCheck, ClipboardList, CreditCard, Hotel, CalendarPlus, FileText,
} from 'lucide-react';

// Each target page opens the matching dialog for `?action=…` (see hooks/useActionParam.ts).
const QUICK_ACTIONS = [
  { label: 'Add New Guest',            href: '/guests?action=add',         icon: UserPlus },
  { label: 'Check In a Guest',         href: '/check-ins?action=checkin',  icon: UserCheck },
  { label: 'Complete a Registration',  href: '/registrations?action=add',  icon: ClipboardList },
  { label: 'Record a Payment',         href: '/payments?action=add',       icon: CreditCard },
  { label: 'New Hospitality Request',  href: '/hospitality?action=add',    icon: Hotel },
  { label: 'Create New Event',         href: '/events?action=add',         icon: CalendarPlus },
  { label: 'Generate Report',          href: '/reports?action=generate',   icon: FileText },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (href: string) => {
    closeCommandPalette();
    router.push(href);
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={closeCommandPalette}>
      <CommandInput placeholder="Type a command or search..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {FLAT_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => handleSelect(item.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem key={action.href} value={action.label} onSelect={() => handleSelect(action.href)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

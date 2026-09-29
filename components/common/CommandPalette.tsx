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
import { useAuthStore, useUIStore } from '@/store';
import { getVisibleNavSections } from '@/constants/navigation';
import type { IndustryModule } from '@/constants/industry';
import { useTerminology, type Terminology } from '@/hooks';
import {
  UserPlus, UserCheck, ClipboardList, CreditCard, Hotel, CalendarPlus, FileText,
} from 'lucide-react';

// Each target page opens the matching dialog for `?action=…` (see hooks/useActionParam.ts).
// An action whose module the tenant's industry is not offered is left out, as
// its nav entry is: a pharmacy is not offered events or room service.
function quickActions(t: Terminology) {
  const actions: { label: string; href: string; icon: typeof UserPlus; module?: IndustryModule }[] = [
    { label: `Add New ${t.person.one}`,       href: '/guests?action=add',         icon: UserPlus },
    { label: `Check In a ${t.person.one}`,    href: '/check-ins?action=checkin',  icon: UserCheck },
    { label: 'Complete a Registration',       href: '/registrations?action=add',  icon: ClipboardList, module: 'registrations' },
    { label: 'Record a Payment',              href: '/payments?action=add',       icon: CreditCard,    module: 'payments' },
    { label: `New ${t.place.one} Service Request`, href: '/hospitality?action=add', icon: Hotel,       module: 'hospitality' },
    { label: 'Create New Event',              href: '/events?action=add',         icon: CalendarPlus,  module: 'events' },
    { label: 'Generate Report',               href: '/reports?action=generate',   icon: FileText },
  ];
  return actions.filter((a) => !a.module || t.has(a.module));
}

export function CommandPalette() {
  const t = useTerminology();
  const role = useAuthStore((st) => st.user?.role);
  const router = useRouter();
  // The same entries the header offers this role in this industry — never an
  // admin-only page to a receptionist, or a module the tenant does not have.
  const navItems = getVisibleNavSections(role, t.slug).flatMap((section) => section.items);
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
          {navItems.map((item) => {
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
          {quickActions(t).map((action) => {
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

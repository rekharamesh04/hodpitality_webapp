'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, CheckCircle, Hotel, Calendar, FileText, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { canManageStaff } from '@/constants/roles';
import type { IndustryModule } from '@/constants/industry';
import { useTerminology } from '@/hooks';

interface QuickAction {
  icon: typeof UserPlus;
  label: string;
  description: string;
  onClick: () => void;
  module?: IndustryModule;
  show?: boolean;
}

export function QuickActions() {
  const router = useRouter();
  const t = useTerminology();
  const role = useAuthStore((st) => st.user?.role);

  // Only what this industry is offered, in its own words. "Manage Staff" is
  // for the roles that can; everyone else still reaches the list from People.
  const all: QuickAction[] = [
    {
      icon: UserPlus,
      label: `Add ${t.person.one}`,
      description: `Register new ${t.person.one.toLowerCase()}`,
      onClick: () => router.push('/guests?action=add'),
    },
    {
      icon: CheckCircle,
      label: 'Check-in',
      description: 'Manual check-in',
      onClick: () => router.push('/check-ins?action=checkin'),
    },
    {
      icon: Hotel,
      label: `${t.place.one} Services`,
      description: 'Book service',
      module: 'hospitality',
      onClick: () => router.push('/hospitality?action=add'),
    },
    {
      icon: Calendar,
      label: 'New Event',
      description: 'Create event',
      module: 'events',
      onClick: () => router.push('/events?action=add'),
    },
    {
      icon: FileText,
      label: 'Generate Report',
      description: 'Create report',
      onClick: () => router.push('/reports?action=generate'),
    },
    {
      icon: Users,
      label: 'Manage Staff',
      description: 'View team',
      show: canManageStaff(role),
      onClick: () => router.push('/staff'),
    },
  ];
  const actions = all.filter((a) => (!a.module || t.has(a.module)) && a.show !== false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="group h-auto flex-col items-start gap-2 whitespace-normal p-4 hover:border-primary/40 hover:bg-primary/5"
                onClick={action.onClick}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{action.label}</p>
                  <p className="text-xs font-normal text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

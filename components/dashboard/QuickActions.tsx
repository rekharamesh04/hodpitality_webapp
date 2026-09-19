'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, CheckCircle, Hotel, Calendar, FileText, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      icon: UserPlus,
      label: 'Add Guest',
      description: 'Register new guest',
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
      label: 'Hospitality',
      description: 'Book service',
      onClick: () => router.push('/hospitality?action=add'),
    },
    {
      icon: Calendar,
      label: 'New Event',
      description: 'Create event',
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
      onClick: () => router.push('/staff'),
    },
  ];

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

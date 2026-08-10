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
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: CheckCircle,
      label: 'Check-in',
      description: 'Manual check-in',
      onClick: () => router.push('/check-ins?action=checkin'),
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      icon: Hotel,
      label: 'Hospitality',
      description: 'Book service',
      onClick: () => router.push('/hospitality?action=add'),
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      icon: Calendar,
      label: 'New Event',
      description: 'Create event',
      onClick: () => router.push('/events?action=add'),
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      icon: FileText,
      label: 'Generate Report',
      description: 'Create report',
      onClick: () => router.push('/reports?action=generate'),
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    },
    {
      icon: Users,
      label: 'Manage Staff',
      description: 'View team',
      onClick: () => router.push('/staff'),
      color: 'text-pink-600',
      bg: 'bg-pink-50 dark:bg-pink-950/30',
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
                className="h-auto flex-col items-start gap-2 p-4 hover:bg-accent"
                onClick={action.onClick}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bg}`}>
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

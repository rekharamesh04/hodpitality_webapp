'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getRelativeTime, getInitials } from '@/lib/utils';
import { CheckCircle2, UserPlus, Hotel, Calendar, AlertCircle } from 'lucide-react';
import type { ActivityFeedItem } from '@/types';

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
}

const iconMap = {
  check_in: CheckCircle2,
  registration: UserPlus,
  hospitality: Hotel,
  event: Calendar,
  system: AlertCircle,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const safeActivities = Array.isArray(activities) ? activities : [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {safeActivities.map((activity) => {
              const Icon = iconMap[activity.type] || AlertCircle;
              return (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getRelativeTime(activity.timestamp)}</span>
                      {activity.user && (
                        <>
                          <span>•</span>
                          <span>by {activity.user}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

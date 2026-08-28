'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { getInitials, getFriendlyErrorMessage } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { GUEST_CATEGORY_BADGE_CLASSES } from '@/constants';
import type { Guest } from '@/types';
import Link from 'next/link';

interface RecentGuestsProps {
  guests: Guest[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

function GuestsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentGuests({ guests, isLoading, isError, error, onRetry }: RecentGuestsProps) {
  const safeGuests = Array.isArray(guests) ? guests : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Guests</CardTitle>
        <Link href="/guests">
          <Button variant="ghost" size="sm">
            View all guests
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <GuestsSkeleton />
        ) : isError ? (
          <ErrorState
            title="Unable to load guests"
            message={getFriendlyErrorMessage(error)}
            onRetry={onRetry}
          />
        ) : safeGuests.length === 0 ? (
          <EmptyState icon={Users} title="No guests found" description="Registered guests will appear here." />
        ) : (
          <div className="space-y-3">
            {safeGuests.slice(0, 5).map((guest) => {
              const id = guest.id ?? guest.PK ?? guest.email;
              return (
                <div key={id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={guest.avatar} alt={guest.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {guest.name ? getInitials(guest.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium leading-none">{guest.name || 'Unnamed guest'}</p>
                      {guest.checkedIn && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-label="Checked in" />}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {guest.email || guest.company || guest.designation || '—'}
                    </p>
                  </div>
                  {guest.category && (
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${GUEST_CATEGORY_BADGE_CLASSES[guest.category] ?? 'bg-gray-100 text-gray-700 border-gray-300'}`}
                    >
                      {guest.category}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

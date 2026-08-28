'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { formatDate, getFriendlyErrorMessage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import type { Event } from '@/types';
import Link from 'next/link';

interface UpcomingEventsProps {
  events: Event[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

function EventsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UpcomingEvents({ events, isLoading, isError, error, onRetry }: UpcomingEventsProps) {
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Upcoming Events</CardTitle>
        <Link href="/events">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <EventsSkeleton />
        ) : isError ? (
          <ErrorState
            title="Unable to load upcoming events"
            message={getFriendlyErrorMessage(error)}
            onRetry={onRetry}
          />
        ) : safeEvents.length === 0 ? (
          <EmptyState icon={Calendar} title="No upcoming events" description="Events scheduled for the future will appear here." />
        ) : (
          <div className="space-y-4">
            {safeEvents.slice(0, 5).map((event) => {
              const startDate = event.startDate ?? event.date ?? '';
              const eventId = event.id ?? (event.PK ? event.PK.replace('EVENT#', '') : '');
              return (
                <Link
                  key={event.id ?? event.PK}
                  href={eventId ? `/events/${eventId}` : '/events'}
                  className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-xs font-semibold">{startDate ? formatDate(startDate, 'MMM') : '—'}</span>
                    <span className="text-lg font-bold">{startDate ? formatDate(startDate, 'dd') : '—'}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold leading-none">{event.title || 'Untitled event'}</h4>
                      {event.category && <Badge variant="outline">{event.category}</Badge>}
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {event.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                      {(event.attendees !== undefined || event.registered !== undefined || event.capacity !== undefined) && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" aria-hidden="true" />
                          <span>
                            {event.attendees ?? event.registered ?? 0}
                            {event.capacity !== undefined && ` / ${event.capacity}`} attendees
                          </span>
                        </div>
                      )}
                      {event.endDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          <span>Ends {formatDate(event.endDate, 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {event.status && (
                    <Badge variant="secondary" className="capitalize shrink-0">
                      {event.status}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Venue } from '@/types';

interface VenueOccupancyProps {
  venues: Venue[];
}

export function VenueOccupancy({ venues }: VenueOccupancyProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue Occupancy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {venues.map((venue) => {
            const occ = venue.occupancy ?? venue.currentOccupancy ?? 0;
            const occupancyPercent = (occ / (venue.capacity || 1)) * 100;
            return (
              <div key={venue.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{venue.name}</span>
                  <span className="text-muted-foreground">
                    {occ} / {venue.capacity}
                  </span>
                </div>
                <Progress value={occupancyPercent} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

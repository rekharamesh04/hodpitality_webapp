'use client';

import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useVenues } from '@/hooks/useVenues';

export default function VenuesPage() {
  const { data, isLoading } = useVenues();
  const venues = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Venues</h1>
          <p className="text-muted-foreground">Manage venue capacity and availability</p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Venue
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,850</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-muted-foreground col-span-3">Loading venues…</p>}
        {venues.map((venue) => {
          const occupancyPercent = (venue.currentOccupancy / venue.capacity) * 100;
          return (
            <Card key={venue.id} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{venue.name}</CardTitle>
                    <CardDescription>{venue.type}</CardDescription>
                  </div>
                  <StatusBadge status={venue.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{venue.location}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Occupancy</span>
                    <span className="font-medium">
                      {venue.currentOccupancy} / {venue.capacity}
                    </span>
                  </div>
                  <Progress value={occupancyPercent} />
                  <p className="text-xs text-muted-foreground">{occupancyPercent.toFixed(0)}% capacity</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {venue.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {venue.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{venue.amenities.length - 3}
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/** A single category → count pair, used for every distribution chart on the Analytics page.
 * Always built client-side from an already-fetched, real entity list — never fabricated. */
export interface AnalyticsDistribution {
  name: string;
  value: number;
}

/** Per-venue utilization derived from real capacity/occupancy fields (occupancy / capacity × 100).
 * `utilizationPct` is null when capacity is 0 or occupancy is unavailable — never divide by zero. */
export interface VenueUtilization {
  id: string;
  name: string;
  capacity: number;
  occupancy: number | null;
  utilizationPct: number | null;
}

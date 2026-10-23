'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Shared chart styling. Theme tokens in globals.css are hex colors, so they are referenced as
 * plain `var(--…)` — wrapping them in `hsl()` (as before) produced invalid colors.
 */
export const axisProps = {
  stroke: 'var(--muted-foreground)',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
} as const;

export const gridProps = {
  strokeDasharray: '4 4',
  stroke: 'var(--border)',
  vertical: false,
} as const;

export const tooltipProps = {
  cursor: { fill: 'var(--muted)', opacity: 0.6 },
  contentStyle: {
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    boxShadow: 'var(--shadow-medium)',
    fontSize: 12,
    padding: '8px 10px',
  },
  labelStyle: { color: 'var(--muted-foreground)', marginBottom: 2 },
} as const;

/** Renders a titled card, or just the chart when embedded in a card that already has a title. */
export function ChartFrame({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  if (!title) return <div className="w-full">{children}</div>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

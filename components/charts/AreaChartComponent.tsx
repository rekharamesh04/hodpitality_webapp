'use client';

import { useId } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/constants';
import { ChartFrame, axisProps, gridProps, tooltipProps } from './chartTheme';

interface AreaChartComponentProps {
  title: string;
  description?: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
}

export function AreaChartComponent({ title, description, data, dataKey, xAxisKey, height = 300 }: AreaChartComponentProps) {
  // Unique gradient id per instance — several area charts can share a page.
  const gradientId = `area-${useId().replace(/:/g, '')}`;
  return (
    <ChartFrame title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={Array.isArray(data) ? data : []} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.PRIMARY} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.PRIMARY} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xAxisKey} {...axisProps} interval="preserveStartEnd" minTickGap={12} />
          <YAxis {...axisProps} width={52} />
          <Tooltip {...tooltipProps} cursor={{ stroke: 'var(--border)' }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={CHART_COLORS.PRIMARY}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

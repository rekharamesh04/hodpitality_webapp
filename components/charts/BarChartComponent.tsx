'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/constants';
import { ChartFrame, axisProps, gridProps, tooltipProps } from './chartTheme';

interface BarChartComponentProps {
  title: string;
  description?: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
}

export function BarChartComponent({ title, description, data, dataKey, xAxisKey, height = 300 }: BarChartComponentProps) {
  return (
    <ChartFrame title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={Array.isArray(data) ? data : []} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xAxisKey} {...axisProps} interval="preserveStartEnd" minTickGap={12} />
          <YAxis {...axisProps} allowDecimals={false} width={44} />
          <Tooltip {...tooltipProps} />
          <Bar dataKey={dataKey} fill={CHART_COLORS.PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

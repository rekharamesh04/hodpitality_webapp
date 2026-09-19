'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/constants';
import { ChartFrame, axisProps, gridProps, tooltipProps } from './chartTheme';

interface LineChartComponentProps {
  title: string;
  description?: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
}

export function LineChartComponent({ title, description, data, dataKey, xAxisKey, height = 300 }: LineChartComponentProps) {
  return (
    <ChartFrame title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={Array.isArray(data) ? data : []} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xAxisKey} {...axisProps} interval="preserveStartEnd" minTickGap={12} />
          <YAxis {...axisProps} allowDecimals={false} width={44} />
          <Tooltip {...tooltipProps} cursor={{ stroke: 'var(--border)' }} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={CHART_COLORS.PRIMARY}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

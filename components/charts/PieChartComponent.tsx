'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CHART_COLORS } from '@/constants';

interface PieChartComponentProps {
  title: string;
  description?: string;
  data: any[];
  height?: number;
}

const COLORS = [
  CHART_COLORS.PRIMARY,
  CHART_COLORS.SECONDARY,
  CHART_COLORS.SUCCESS,
  CHART_COLORS.WARNING,
  CHART_COLORS.DANGER,
  CHART_COLORS.INFO,
  CHART_COLORS.PURPLE,
  CHART_COLORS.PINK,
];

export function PieChartComponent({
  title,
  description,
  data,
  height = 300,
}: PieChartComponentProps) {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={safeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {safeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

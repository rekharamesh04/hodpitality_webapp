import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full"
    >
      {/* A metric cell: label, then the figure in mono. Inside a .metric-ledger the cells share one rule. */}
      <Card className={cn('group relative h-full overflow-hidden transition-colors hover:bg-accent/60', className)}>
        <CardContent className="flex h-full flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-[13px] font-medium leading-snug text-muted-foreground">{title}</p>
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
          </div>
          <p data-stat className="font-data mt-auto break-words text-[23px] font-medium leading-none tracking-tight sm:text-[28px]">{value}</p>
          {trend && (
            <p className={cn('font-mono text-[11px] font-medium', trend.isPositive ? 'text-success' : 'text-danger')}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

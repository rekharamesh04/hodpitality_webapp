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
      <Card className={cn('card-hover group relative h-full overflow-hidden', className)}>
        {/* Brand accent strip, revealed on hover */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-brand-accent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
        <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
            <p data-stat className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
            {trend && (
              <p className={cn('mt-1 text-xs font-medium', trend.isPositive ? 'text-success' : 'text-danger')}>
                {trend.isPositive ? '+' : ''}{trend.value}% from last week
              </p>
            )}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-11 sm:w-11 sm:rounded-xl">
            <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

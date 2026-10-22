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
      {/* A 1px ring instead of a border: tiles laid edge to edge on a gap-px grid share one hairline. */}
      <Card className={cn('group relative h-full overflow-hidden rounded-none border-0 shadow-[0_0_0_1px_var(--border)] transition-colors hover:bg-accent/40', className)}>
        {/* Gold rule, revealed on hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-primary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
        <CardContent className="flex items-start justify-between gap-3 p-5 sm:p-8">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase leading-snug tracking-widest text-muted-foreground">{title}</p>
            <p data-stat className="mt-3 font-serif text-4xl font-light leading-none tracking-tight sm:text-5xl">{value}</p>
            {trend && (
              <p className={cn('mt-2 font-mono text-[10px] uppercase tracking-widest', trend.isPositive ? 'text-success' : 'text-danger')}>
                {trend.isPositive ? '+' : ''}{trend.value}% from last week
              </p>
            )}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-primary sm:h-10 sm:w-10">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

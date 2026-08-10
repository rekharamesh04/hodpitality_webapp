import { Badge } from '@/components/ui/badge';
import { cn, getStatusColor, getStatusColorDark } from '@/lib/utils';
import type { Status } from '@/types';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'capitalize',
        getStatusColor(status),
        'dark:' + getStatusColorDark(status),
        className
      )}
    >
      {status.replace('_', ' ')}
    </Badge>
  );
}

import { Badge } from '@/components/ui/badge';
import { cn, getStatusColor, getStatusColorDark } from '@/lib/utils';
import type { Status } from '@/types';

interface StatusBadgeProps {
  status?: Status | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        'capitalize',
        getStatusColor(status as Status),
        'dark:' + getStatusColorDark(status as Status),
        className
      )}
    >
      {status.replace('_', ' ')}
    </Badge>
  );
}

import { Badge } from '@/components/ui/badge';
import { cn, getStatusColor } from '@/lib/utils';
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
      className={cn('capitalize whitespace-nowrap', getStatusColor(status), className)}
    >
      {status.replace(/[_-]/g, ' ')}
    </Badge>
  );
}

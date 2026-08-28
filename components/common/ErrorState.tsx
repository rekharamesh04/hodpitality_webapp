import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Unable to load this data',
  message = 'Something went wrong. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  );
}

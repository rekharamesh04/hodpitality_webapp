import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center', className)}>
      {Icon && (
        <div className="relative mb-4">
          <div className="absolute inset-0 -m-2 rounded-full bg-primary/5" aria-hidden="true" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <Button className="mt-5" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

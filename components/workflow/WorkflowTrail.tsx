'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { getWorkflow, workflowStepIndex } from '@/constants/workflow';
import { useIndustry } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * "You are here" for a page that is one step of the industry's workflow.
 *
 * The sidebar lists every step in order, so this only has to say which step
 * this page is, what it is for, and link to the next one. It sits in the
 * sticky top bar, so the next step stays one click away while the page
 * scrolls. It renders nothing on pages outside the flow.
 *
 * `inline` sits inside the top bar's row (tablets and up); `row` is a row of
 * its own under the bar on phones, with a back arrow as well.
 */
export function WorkflowContext({ variant, className }: { variant: 'inline' | 'row'; className?: string }) {
  const pathname = usePathname();
  const industry = useIndustry();
  const steps = getWorkflow(industry);
  const index = workflowStepIndex(steps, pathname);
  if (index < 0) return null;

  const current = steps[index];
  const prev = steps[index - 1];
  const next = steps[index + 1];

  const nextLink = next ? (
    <Link href={next.href} className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0')}>
      <span className="hidden sm:inline">Next:</span>
      <span className="max-w-[10rem] truncate">{next.label}</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  ) : (
    <Link href="/dashboard" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'shrink-0')}>
      Back to dashboard
    </Link>
  );

  const stepChip = (
    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
      Step {index + 1} of {steps.length}
    </span>
  );

  if (variant === 'row') {
    return (
      <nav aria-label="Workflow" className={cn('flex items-center gap-2 border-t px-4 py-2', className)}>
        {prev && (
          <Link
            href={prev.href}
            aria-label={`Previous step: ${prev.label}`}
            className={cn(buttonVariants({ size: 'icon-sm', variant: 'ghost' }), '-ml-1.5 shrink-0')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        {stepChip}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{current.label}</span>
        {nextLink}
      </nav>
    );
  }

  return (
    <nav aria-label="Workflow" className={cn('min-w-0 flex-1 items-center gap-3', className)}>
      {stepChip}
      <p className="min-w-0 flex-1 truncate text-sm">
        <span className="font-medium">{current.label}</span>
        <span className="hidden text-muted-foreground 2xl:inline">
          {' '}— {current.description}{current.optional && ' Optional.'}
        </span>
      </p>
      {nextLink}
    </nav>
  );
}

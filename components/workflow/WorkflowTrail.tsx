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
 * Every step is its own page, so without this a member of staff sees one
 * screen at a time and has to know from memory what comes before and after.
 * The strip shows the whole flow, marks the current step, and links to the
 * next one. It renders nothing on pages outside the flow.
 */
export function WorkflowTrail() {
  const pathname = usePathname();
  const industry = useIndustry();
  const steps = getWorkflow(industry);
  const index = workflowStepIndex(steps, pathname);
  if (index < 0) return null;

  const current = steps[index];
  const prev = steps[index - 1];
  const next = steps[index + 1];

  return (
    <nav
      aria-label="Workflow"
      className="mb-6 rounded-xl border bg-card px-3 py-2.5 shadow-sm sm:px-4"
    >
      <div className="flex items-center gap-3">
        {/* Full flow on wider screens */}
        <ol className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
          {steps.map((s, i) => {
            const isCurrent = i === index;
            return (
              <li key={s.href} className="flex min-w-0 items-center gap-1">
                <Link
                  href={s.href}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex min-w-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isCurrent ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                      isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate">{s.label}</span>
                </Link>
                {i < steps.length - 1 && <span className="h-px w-3 shrink-0 bg-border lg:w-5" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>

        {/* Compact position on phones */}
        <p className="min-w-0 flex-1 md:hidden">
          <span className="block text-[11px] text-muted-foreground">Step {index + 1} of {steps.length}</span>
          <span className="block truncate text-sm font-semibold">{current.label}</span>
        </p>

        <div className="flex shrink-0 items-center gap-1.5">
          {prev && (
            <Link
              href={prev.href}
              aria-label={`Previous step: ${prev.label}`}
              className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'md:hidden')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          {next ? (
            <Link href={next.href} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
              <span className="hidden sm:inline">Next:&nbsp;</span>
              <span className="max-w-[9rem] truncate">{next.label}</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          ) : (
            <Link href="/dashboard" className={buttonVariants({ size: 'sm', variant: 'outline' })}>
              Back to dashboard
            </Link>
          )}
        </div>
      </div>
      <p className="mt-1.5 hidden text-xs text-muted-foreground md:block">
        <span className="font-medium text-foreground">Step {index + 1}:</span> {current.description}
        {current.optional && ' Optional.'}
      </p>
    </nav>
  );
}

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
 * The flow line draws the whole workflow as a transit line — one station per
 * step, the current one ringed — and links to the next one. It sits in the
 * sticky header, so it stays in view while the page scrolls. It renders nothing
 * on pages outside the flow.
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
    <nav aria-label="Workflow" className="border-t border-nav-border bg-background/70">
      <div className="mx-auto flex min-h-12 w-full max-w-[1600px] items-center gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
        <span className="hidden shrink-0 font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground xl:block">
          Flow
        </span>

        {/* The line, on wider screens */}
        <ol className="hidden min-w-0 flex-1 items-center md:flex">
          {steps.map((s, i) => {
            const isCurrent = i === index;
            return (
              <li key={s.href} className="flex min-w-0 flex-1 items-center last:flex-none">
                <Link
                  href={s.href}
                  aria-current={isCurrent ? 'step' : undefined}
                  title={s.description}
                  className="group flex min-w-0 items-center gap-2 rounded-sm py-1 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* Station */}
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-card transition-colors',
                      isCurrent
                        ? 'station-live border-primary motion-reduce:animate-none'
                        : 'border-input group-hover:border-foreground/40',
                      s.optional && !isCurrent && 'border-dashed',
                    )}
                    aria-hidden="true"
                  >
                    {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </span>
                  <span
                    className={cn(
                      'min-w-0 truncate text-[13px] transition-colors',
                      isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    <span className="mr-1.5 font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                    {s.label}
                  </span>
                </Link>
                {/* Track to the next station */}
                {i < steps.length - 1 && <span className="mx-2 h-0.5 min-w-3 flex-1 rounded-full bg-border" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>

        {/* Compact position on phones */}
        <p className="min-w-0 flex-1 md:hidden">
          <span className="block font-mono text-[11px] text-muted-foreground">Step {index + 1} of {steps.length}</span>
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
    </nav>
  );
}

/**
 * What the current workflow step is for, at the top of the page's content. The flow line in
 * the header is kept to one compact row, so the step's description lives here instead.
 */
export function WorkflowStepNote() {
  const pathname = usePathname();
  const industry = useIndustry();
  const steps = getWorkflow(industry);
  const index = workflowStepIndex(steps, pathname);
  if (index < 0) return null;
  const current = steps[index];

  return (
    <p className="mb-5 flex items-start gap-2 text-[13px] text-muted-foreground">
      <span className="mt-[3px] shrink-0 rounded-sm bg-primary/10 px-1.5 font-mono text-[11px] font-medium text-primary">
        Step {String(index + 1).padStart(2, '0')}
      </span>
      <span>
        {current.description}
        {current.optional && ' Optional.'}
      </span>
    </p>
  );
}

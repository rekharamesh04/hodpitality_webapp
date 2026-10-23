'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import type { WorkflowStep } from '@/constants/workflow';
import { useTerminology } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * The whole flow on one card, start to finish, each step with the one action
 * that begins it. Takes the place of the generic quick actions for an industry
 * that has a workflow — every useful shortcut is a step here, in its order.
 */
export function WorkflowGuide({ steps }: { steps: WorkflowStep[] }) {
  const t = useTerminology();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>How a {t.person.one.toLowerCase()} moves through your {t.org.toLowerCase()}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Start to finish, in order. Each screen shows these steps along its top, with a link to the next one.
        </p>
      </CardHeader>
      <CardContent>
        <ol
          className={cn(
            'grid',
            steps.length >= 6 ? 'lg:grid-cols-6' : steps.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4',
          )}
        >
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.href} className="relative flex flex-col pb-7 pl-11 last:pb-0 lg:pb-0 lg:pl-0">
                {/* Below lg the line runs down the page: a track from this station to the next. */}
                {i < steps.length - 1 && (
                  <span className="absolute bottom-0 left-[13px] top-8 w-0.5 rounded-full bg-border lg:hidden" aria-hidden="true" />
                )}
                {/* Station; on lg it sits on a horizontal line running to the next one. */}
                <div className="absolute left-0 top-0 flex items-center gap-3 lg:static">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-card font-mono text-xs font-medium',
                      s.optional ? 'border-dashed border-input text-muted-foreground' : 'border-primary text-primary',
                    )}
                  >
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && <span className="hidden h-0.5 flex-1 rounded-full bg-border lg:block" aria-hidden="true" />}
                </div>
                <div className="mt-1 flex items-center gap-2 lg:mt-3 lg:pr-5">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {s.optional && (
                    <span className="rounded-sm border px-1 font-mono text-[10px] text-muted-foreground">Optional</span>
                  )}
                </div>
                <Link
                  href={s.href}
                  className="mt-1.5 rounded-sm text-sm font-semibold hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:mr-5"
                >
                  {s.label}
                </Link>
                <p className="mt-1 flex-1 text-xs leading-snug text-muted-foreground lg:pr-5">{s.description}</p>
                <Link
                  href={s.action?.href ?? s.href}
                  className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'group mt-3 w-full justify-between lg:w-[calc(100%-1.25rem)]')}
                >
                  <span className="truncate">{s.action?.label ?? `Open ${s.label}`}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

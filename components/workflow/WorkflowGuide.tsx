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
            'grid gap-3 sm:grid-cols-2',
            steps.length >= 6 ? 'lg:grid-cols-6' : steps.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4',
          )}
        >
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.href} className="relative flex flex-col rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {s.optional && (
                    <span className="ml-auto rounded border px-1 text-[10px] text-muted-foreground">Optional</span>
                  )}
                </div>
                <Link
                  href={s.href}
                  className="mt-2 rounded-sm text-sm font-semibold hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {s.label}
                </Link>
                <p className="mt-1 flex-1 text-xs leading-snug text-muted-foreground">{s.description}</p>
                <Link
                  href={s.action?.href ?? s.href}
                  className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'mt-3 w-full justify-between')}
                >
                  <span className="truncate">{s.action?.label ?? `Open ${s.label}`}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </Link>
                {i < steps.length - 1 && (
                  <ArrowRight
                    className="absolute -right-[11px] top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-background text-muted-foreground lg:block"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkflowStep } from '@/constants/workflow';
import { useTerminology } from '@/hooks';

/**
 * The whole flow as a short numbered list, each step with the one action that
 * begins it. Takes the place of the generic quick actions for an industry that
 * has a workflow — every useful shortcut is a step here, in its order. The
 * sidebar lists the same steps for getting around; this is for starting work.
 */
export function WorkflowGuide({ steps }: { steps: WorkflowStep[] }) {
  const t = useTerminology();

  return (
    <Card>
      <CardHeader className="border-b px-5 py-4">
        <CardTitle>Start a task</CardTitle>
        <p className="mt-1.5 text-xs text-muted-foreground">
          How a {t.person.one.toLowerCase()} moves through your {t.org.toLowerCase()}, in order.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="divide-y">
          {steps.map((s, i) => (
            <li key={s.href}>
              <Link
                href={s.action?.href ?? s.href}
                title={s.description}
                className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums text-muted-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{s.action?.label ?? s.label}</span>
                    {s.optional && <span className="shrink-0 text-[10px] font-normal text-muted-foreground">Optional</span>}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{s.label}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

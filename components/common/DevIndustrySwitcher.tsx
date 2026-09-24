'use client';

import { FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { INDUSTRY_OPTIONS, industryPack } from '@/constants/industry';
import { DEV_BYPASS_ENABLED, currentDevIndustry, setDevIndustry } from '@/lib/dev-session';
import { cn } from '@/lib/utils';

/**
 * Switches the local demo session between industries, live.
 *
 * Renders nothing at all unless the dev bypass is on, and the bypass is itself
 * inert in a production build (lib/dev-session.ts), so this cannot appear in a
 * deployed app.
 *
 * It exists because the demo *is* the industry switch: the same product has to
 * read as a pharmacy, a spa and a hotel one after another, and stopping to
 * edit an env file and restart in front of an audience loses the thread. Each
 * option shows what that industry calls its people and places, so the change
 * is legible before it is made rather than after.
 */
export function DevIndustrySwitcher() {
  if (!DEV_BYPASS_ENABLED) return null;

  const current = currentDevIndustry();
  const pack = industryPack(current);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hidden h-9 gap-2 border border-amber-400/40 bg-amber-400/10 px-2.5 text-amber-200 hover:bg-amber-400/20 hover:text-amber-100 sm:flex"
          aria-label={`Demo industry: ${pack.label}. Change it.`}
        >
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          <span className="text-xs font-medium">{pack.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={14} className="w-72">
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Demo session — switch industry
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[60vh] overflow-y-auto">
          {INDUSTRY_OPTIONS.map(({ slug, label, available }) => {
            const p = industryPack(slug);
            const active = slug === current;
            return (
              <DropdownMenuItem
                key={slug}
                className={cn('cursor-pointer flex-col items-start gap-0.5 rounded-lg p-2.5', active && 'bg-primary/5')}
                disabled={!available}
                onClick={() => available && !active && setDevIndustry(slug)}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium">{label}</span>
                  {active && <span className="text-[10px] font-semibold text-primary">CURRENT</span>}
                  {!available && !active && (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Coming soon
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.person.many} · {p.place.many} · {p.practitioner}
                </span>
              </DropdownMenuItem>
            );
          })}
        </div>
        <DropdownMenuSeparator />
        <p className="px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
          Local demo only. Reloads the page so no screen is left holding the
          previous industry&rsquo;s wording.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

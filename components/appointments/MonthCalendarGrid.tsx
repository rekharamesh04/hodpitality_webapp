'use client';

import { cn } from '@/lib/utils';
import type { CalendarEntry } from '@/types';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface MonthCalendarGridProps {
  /** "YYYY-MM" */
  month: string;
  entries: CalendarEntry[];
  selectedDate?: string;
  onSelectDate: (date: string) => void;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function MonthCalendarGrid({ month, entries, selectedDate, onSelectDate }: MonthCalendarGridProps) {
  const [year, mo] = month.split('-').map(Number);
  if (!year || !mo) return null;

  const firstOfMonth = new Date(year, mo - 1, 1);
  const daysInMonth = new Date(year, mo, 0).getDate();
  const firstWeekdayMonFirst = (firstOfMonth.getDay() + 6) % 7;

  const entriesByDate = new Map<string, CalendarEntry[]>();
  for (const entry of entries) {
    const key = (entry.date ?? entry.start ?? '').slice(0, 10);
    if (!key) continue;
    if (!entriesByDate.has(key)) entriesByDate.set(key, []);
    entriesByDate.get(key)!.push(entry);
  }

  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < firstWeekdayMonFirst; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const today = todayIso();

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`blank-${i}`} className="min-h-[96px] border-b border-r bg-muted/10 last:border-r-0" />;
          }
          const dayEntries = entriesByDate.get(cell.date) ?? [];
          const isToday = cell.date === today;
          const isSelected = cell.date === selectedDate;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              aria-label={`${cell.date}${dayEntries.length ? `, ${dayEntries.length} items` : ''}`}
              aria-current={isSelected ? 'date' : undefined}
              className={cn(
                'flex min-h-[96px] flex-col items-stretch gap-1 border-b border-r p-1.5 text-left transition-colors last:border-r-0 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                isSelected && 'bg-primary/5 ring-1 ring-inset ring-primary/40'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  isToday && 'bg-primary text-primary-foreground'
                )}
              >
                {cell.day}
              </span>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {dayEntries.slice(0, 3).map((entry) => (
                  <span
                    key={entry.id}
                    className={cn(
                      'truncate rounded px-1 py-0.5 text-[10px] font-medium',
                      entry.type === 'event'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400'
                    )}
                    title={entry.title}
                  >
                    {entry.title}
                  </span>
                ))}
                {dayEntries.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{dayEntries.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

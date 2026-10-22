'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { visitPriorityOf, type OpdLane } from '@/constants/opd';

/** Tokens shown under "Next" per doctor — enough to know you are close, few enough to read across a room. */
const NEXT_TOKENS_SHOWN = 4;

/**
 * The waiting-room screen: who each doctor is seeing now, and who is next.
 *
 * Tokens only, never names. This is meant for a television in a public waiting
 * area, where a name next to a doctor's specialty is medical information shown
 * to strangers. The token is the patient's own handle; the desk gave it to them.
 *
 * It is an overlay over the queue page rather than a route of its own, so it
 * shares the queue's live data and polling and needs no separate login screen.
 */
export function WaitingRoomDisplay({
  lanes, tokens, orgLabel, onClose,
}: {
  lanes: OpdLane[];
  tokens: Map<string, number>;
  orgLabel: string;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30_000);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.fullscreenElement) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { clearInterval(timer); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  // Leave browser full screen when the overlay closes, however it closes.
  useEffect(() => () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const goFullScreen = () => rootRef.current?.requestFullscreen?.().catch(() => {});
  const visible = lanes.filter((l) => l.staffId && (l.withDoctor.length || l.waiting.length));

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Waiting-room display"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#0B0C0E] p-6 text-[#F3F1EC] sm:p-10"
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-[#D4AF37]"><span className="h-px w-8 bg-[#D4AF37]" aria-hidden="true" />{orgLabel}</p>
          <h2 className="mt-3 font-serif text-4xl font-light tracking-tight sm:text-6xl">Now <em className="italic text-[#D4AF37]">serving</em></h2>
        </div>
        <div className="flex items-center gap-2">
          <p className="mr-2 font-mono text-2xl tabular-nums text-[#A6A6A6] sm:text-4xl">
            {clock.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </p>
          <Button size="icon" variant="ghost" className="rounded-full border border-[#303139] text-[#A6A6A6] hover:border-[#D4AF37] hover:bg-transparent hover:text-[#D4AF37]" onClick={goFullScreen} aria-label="Full screen">
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full border border-[#303139] text-[#A6A6A6] hover:border-[#D4AF37] hover:bg-transparent hover:text-[#D4AF37]" onClick={onClose} aria-label="Close display">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="font-serif text-3xl font-light italic text-[#A6A6A6]">Please wait — you will be called shortly.</p>
        </div>
      ) : (
        <div className="grid flex-1 auto-rows-min grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((lane) => {
            const serving = lane.withDoctor[0];
            const next = lane.waiting.slice(0, NEXT_TOKENS_SHOWN);
            return (
              <div key={lane.staffId} className="relative rounded-none border border-[#303139] bg-[#111215] p-6 sm:p-8">
                <p className="truncate font-serif text-2xl font-semibold sm:text-3xl">{lane.doctorName}</p>
                <p className="truncate font-mono text-xs uppercase tracking-widest text-[#A6A6A6]">{lane.room || ' '}</p>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#A6A6A6]">Token</p>
                    <p className="text-6xl font-bold tabular-nums text-[#D4AF37] sm:text-7xl">
                      {serving ? tokens.get(serving.id) ?? '—' : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#A6A6A6]">Next</p>
                    <div className="mt-1 flex flex-wrap justify-end gap-1.5">
                      {next.length === 0 ? (
                        <span className="text-lg text-[#A6A6A6]/70">—</span>
                      ) : next.map((a) => (
                        <span
                          key={a.id}
                          className={cn(
                            'rounded-none border px-2.5 py-1 text-xl font-semibold tabular-nums',
                            // Colour only — the word "Emergency" stays off a public screen.
                            visitPriorityOf(a) === 'emergency' ? 'border-red-600 bg-red-600 text-white' : 'border-[#303139] bg-transparent text-[#F3F1EC]',
                          )}
                        >
                          {tokens.get(a.id) ?? '—'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { ReactNode } from 'react';
import { LogoMark } from '@/components/brand/LogoMark';

/** The four moments every EntryFlow workflow is made of, whatever the industry calls them. */
const STATIONS = [
  { label: 'Arrive', detail: 'Registered once, found by name or face' },
  { label: 'Verify', detail: 'Identity and booking confirmed at the desk' },
  { label: 'Serve', detail: 'Routed to the right room, queue or counter' },
  { label: 'Settle', detail: 'Paid, recorded and on their profile' },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-12">
      {/* Product panel, desktop only. Decorative: the form beside it carries every instruction. */}
      <aside
        aria-hidden="true"
        className="relative hidden flex-col justify-between overflow-hidden bg-nav bg-gradient-to-br from-nav via-nav to-nav-to p-12 text-nav-foreground lg:col-span-5 lg:flex xl:p-16"
      >
        <div className="pointer-events-none absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 rounded-lg shadow-[0_4px_12px_-2px_rgb(99_102_241_/_0.6)]" />
          <span className="text-[15px] font-semibold tracking-tight">
            EntryFlow <span className="font-normal text-nav-muted">Admin</span>
          </span>
        </div>

        <div className="relative">
          <p className="max-w-md text-balance text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Every arrival, <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">accounted for.</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-nav-muted">
            One line from the front door to the final payment — for hotels, clinics and pharmacies.
          </p>

          {/* The workflow, step by step */}
          <ol className="mt-10 space-y-5">
            {STATIONS.map((s, i) => (
              <li key={s.label} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-indigo-200 ring-1 ring-white/15">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="mt-0.5 text-sm text-nav-muted">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative flex items-center justify-between border-t border-nav-border pt-6 text-xs text-nav-muted">
          <span>© {new Date().getFullYear()} EntryFlow</span>
          <span>Staff sign-in</span>
        </div>
      </aside>

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 lg:col-span-7">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

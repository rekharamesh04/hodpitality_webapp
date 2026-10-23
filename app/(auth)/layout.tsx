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
        className="relative hidden flex-col justify-between overflow-hidden border-r border-[#222833] bg-[#0B1220] p-12 text-[#E6E9EE] lg:col-span-5 lg:flex xl:p-16"
      >
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" tileClassName="fill-[#2DD4BF]" glyphClassName="stroke-[#04201C]" />
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">EntryFlow</span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8A93A3]">Front-of-house console</span>
          </span>
        </div>

        <div>
          <p className="max-w-md text-balance text-[34px] font-semibold leading-[1.15] tracking-tight xl:text-[40px]">
            Every arrival, accounted for.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#8A93A3]">
            One line from the front door to the final payment — for hotels, clinics and pharmacies.
          </p>

          {/* The flow line, drawn vertically */}
          <ol className="relative mt-10 space-y-6 pl-8">
            <span className="absolute bottom-2 left-[7px] top-2 w-0.5 rounded-full bg-[#222833]" />
            {STATIONS.map((s, i) => (
              <li key={s.label} className="relative">
                <span
                  className={
                    i === 1
                      ? 'station-live absolute -left-8 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#2DD4BF] bg-[#0B1220] motion-reduce:animate-none'
                      : 'absolute -left-8 top-0.5 h-4 w-4 rounded-full border-2 border-[#2B323E] bg-[#0B1220]'
                  }
                >
                  {i === 1 && <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF]" />}
                </span>
                <p className="text-sm font-medium">
                  <span className="mr-2 font-mono text-[11px] text-[#8A93A3]">{String(i + 1).padStart(2, '0')}</span>
                  {s.label}
                </p>
                <p className="mt-0.5 text-[13px] text-[#8A93A3]">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between border-t border-[#222833] pt-6 font-mono text-[11px] text-[#8A93A3]">
          <span>© {new Date().getFullYear()} EntryFlow</span>
          <span>Staff sign-in</span>
        </div>
      </aside>

      <div className="relative min-h-screen lg:col-span-7">{children}</div>
    </div>
  );
}

import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background lg:grid lg:grid-cols-12">
      {/* Inverted editorial panel (onyx in both themes), desktop only. Decorative: the form
          beside it carries the brand and every instruction. */}
      <aside
        aria-hidden="true"
        className="editorial-dots-inverse relative hidden flex-col justify-between overflow-hidden bg-[#0B0C0E] p-12 text-[#F3F1EC] lg:col-span-5 lg:flex xl:p-16"
      >
        <div className="flex items-center gap-3">
          <span className="font-serif text-3xl font-bold leading-none tracking-tight">EF</span>
          <span className="h-6 w-px bg-[#303139]" />
          <span className="flex flex-col leading-tight">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]">EntryFlow</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#D4AF37]">Admin</span>
          </span>
        </div>

        <div>
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">
            <span className="h-px w-8 bg-[#D4AF37]" />
            Hospitality &amp; event management
          </p>
          <p className="mt-6 font-serif text-5xl font-light leading-[1.05] tracking-tight xl:text-6xl">
            Every arrival, handled with <em className="italic text-[#D4AF37]">ease</em>.
          </p>
        </div>

        <div className="flex items-end justify-between border-t border-[#303139] pt-6 font-mono text-[10px] uppercase tracking-widest text-[#A6A6A6]">
          <span>© {new Date().getFullYear()} EntryFlow Corp</span>
          <span>Staff portal</span>
        </div>

        <span className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b border-l border-[#D4AF37]" />
      </aside>

      <div className="editorial-dots relative min-h-screen lg:col-span-7">{children}</div>
    </div>
  );
}

import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * The EntryFlow mark: an "E" whose middle arm runs into a ringed station — the flow line's
 * "you are here". Drawn on a 32-unit grid; app/icon.svg and app/apple-icon.tsx carry the same
 * paths, so keep the three in step.
 *
 * The tile is the brand gradient (indigo to violet) with a white glyph, the same in both
 * themes. `tileClassName` and `glyphClassName` override either.
 */
export function LogoMark({
  className,
  tileClassName,
  glyphClassName = 'stroke-white',
  title,
}: {
  className?: string;
  tileClassName?: string;
  glyphClassName?: string;
  /** Accessible name. Omit when the mark sits beside the word "EntryFlow". */
  title?: string;
}) {
  const gradientId = `logo-tile-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {!tileClassName && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#818CF8" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      )}
      <rect width="32" height="32" rx="8" className={tileClassName} fill={tileClassName ? undefined : `url(#${gradientId})`} />
      <g fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={glyphClassName}>
        <path d="M22.5 8.5H9.75v15H22.5" />
        <path d="M9.75 16h6.3" />
        <circle cx="19.6" cy="16" r="2.9" />
      </g>
    </svg>
  );
}

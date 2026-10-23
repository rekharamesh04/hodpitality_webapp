import { cn } from '@/lib/utils';

/**
 * The EntryFlow mark: an "E" whose middle arm runs into a ringed station — the flow line's
 * "you are here". Drawn on a 32-unit grid; app/icon.svg and app/apple-icon.tsx carry the same
 * paths, so keep the three in step.
 *
 * Colours follow the theme (teal tile, light glyph; bright teal and dark glyph in dark mode).
 * A surface that is dark in both themes passes fixed colours through `tileClassName` and
 * `glyphClassName`.
 */
export function LogoMark({
  className,
  tileClassName = 'fill-primary',
  glyphClassName = 'stroke-primary-foreground',
  title,
}: {
  className?: string;
  tileClassName?: string;
  glyphClassName?: string;
  /** Accessible name. Omit when the mark sits beside the word "EntryFlow". */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <rect width="32" height="32" rx="7" className={tileClassName} />
      <g fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={glyphClassName}>
        <path d="M22.5 8.5H9.75v15H22.5" />
        <path d="M9.75 16h6.3" />
        <circle cx="19.6" cy="16" r="2.9" />
      </g>
    </svg>
  );
}

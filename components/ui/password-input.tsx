'use client';

import * as React from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, type InputProps } from './input';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Renders a left-aligned lock icon, matching the existing login-page field style. */
  showLeftIcon?: boolean;
}

/** Drop-in replacement for `<Input type="password" />` with a right-aligned show/hide toggle. Never changes validation or submit behavior — it only swaps the input's `type`. */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showLeftIcon = false, disabled, id, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        {showLeftIcon && (
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        )}
        <Input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          className={cn(showLeftIcon && 'pl-9', 'pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

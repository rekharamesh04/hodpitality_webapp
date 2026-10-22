import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] cursor-pointer",
    // A button acting as a form field (combobox trigger) keeps reading like an input, not a label.
    "[&[role=combobox]]:text-sm [&[role=combobox]]:normal-case [&[role=combobox]]:tracking-normal",
  ],
  {
    variants: {
      // Filled and outlined buttons carry the editorial label style: small, bold, uppercase,
      // widely tracked. Ghost and link stay in sentence case — they double as menu triggers.
      variant: {
        default:
          "border border-ink bg-ink text-ink-foreground text-[11px] font-bold uppercase tracking-[0.16em] hover:border-primary hover:bg-primary hover:text-primary-foreground",
        destructive:
          "border border-destructive bg-destructive text-destructive-foreground text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-destructive/90",
        outline:
          "border border-border bg-transparent text-foreground text-[11px] font-bold uppercase tracking-[0.16em] hover:border-foreground hover:bg-transparent",
        secondary:
          "border border-border bg-secondary text-secondary-foreground text-[11px] font-bold uppercase tracking-[0.16em] hover:border-foreground/40",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "border border-success bg-success text-background text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-success/90",
        warning:
          "border border-warning bg-warning text-background text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-warning/90",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-sm",
        sm: "h-8 rounded-sm px-3.5 text-xs",
        lg: "h-12 rounded-sm px-8 text-base",
        xl: "h-14 rounded-sm px-10 text-base",
        icon: "h-10 w-10 rounded-sm",
        "icon-sm": "h-8 w-8 rounded-sm",
      },
    },
    compoundVariants: [
      {
        variant: ["default", "destructive", "outline", "secondary", "success", "warning"],
        size: "sm",
        className: "text-[10px]",
      },
      {
        variant: ["default", "destructive", "outline", "secondary", "success", "warning"],
        size: ["lg", "xl"],
        className: "text-xs",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-0.5 size-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

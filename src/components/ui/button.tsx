"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:opacity-90 active:scale-95 font-semibold",
  secondary:
    "bg-transparent border border-outline text-on-surface hover:bg-surface-container-high active:scale-95",
  ghost:
    "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95",
  danger:
    "bg-transparent border border-on-error-container text-on-error-container hover:bg-on-error-container/10 active:scale-95",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg min-h-[36px]",
  md: "px-4 py-2.5 text-sm rounded-xl min-h-[44px]",
  lg: "px-6 py-3 text-base rounded-xl min-h-[52px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2 font-label tracking-wide transition-all cursor-pointer",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-label font-medium uppercase tracking-wider text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full min-h-[44px] px-3 py-2.5 rounded-xl text-sm text-on-surface",
            "bg-surface-container border transition-colors outline-none",
            error
              ? "border-score-over focus:border-score-over"
              : "border-outline-variant/60 focus:border-primary",
            "placeholder:text-on-surface-variant/50",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-on-surface-variant">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-score-over">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

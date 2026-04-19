import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  noPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, noPadding = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "rounded-xl border",
          elevated
            ? "bg-surface-container-high border-outline-variant/60"
            : "bg-surface-container border-outline-variant/40",
          noPadding ? "" : "p-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

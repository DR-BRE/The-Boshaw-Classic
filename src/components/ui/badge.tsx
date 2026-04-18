import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "gold" | "success" | "danger" | "muted" | "live";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-container-high text-on-surface border-outline-variant/40",
  gold: "bg-primary/15 text-primary border-primary/30",
  success: "bg-score-under/15 text-score-under border-score-under/30",
  danger: "bg-score-over/15 text-score-over border-score-over/30",
  muted: "bg-surface-container text-on-surface-variant border-outline-variant/30",
  live: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-label font-medium uppercase tracking-wider border",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

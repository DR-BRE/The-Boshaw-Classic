interface StatBadgeProps {
  value: number;
  className?: string;
}

export function StatBadge({ value, className = "" }: StatBadgeProps) {
  const label = value === 0 ? "E" : value > 0 ? `+${value}` : `${value}`;
  const color =
    value < 0
      ? "text-score-under"
      : value > 0
      ? "text-score-over"
      : "text-score-par";

  return (
    <span
      className={[
        "font-body tabular-nums font-semibold",
        color,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

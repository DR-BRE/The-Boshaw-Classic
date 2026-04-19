import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: string;
}

export function Skeleton({ height = "h-4", className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={[
        "bg-surface-container-high animate-pulse rounded-xl",
        height,
        className,
      ].join(" ")}
      {...props}
    />
  );
}

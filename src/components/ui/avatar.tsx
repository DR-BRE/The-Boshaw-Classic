interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
};

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const sizeClass = sizes[size];
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={[
        "rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/60 flex items-center justify-center flex-shrink-0",
        sizeClass,
        className,
      ].join(" ")}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? "Avatar"} className="object-cover w-full h-full" />
      ) : (
        <span className="font-label font-semibold text-on-surface-variant">{initials}</span>
      )}
    </div>
  );
}

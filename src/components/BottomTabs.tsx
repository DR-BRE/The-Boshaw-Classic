"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  icon: string;
  label: string;
  featured?: boolean;
};

const tabs: Tab[] = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard" },
  { href: "/scorecard", icon: "scoreboard", label: "Scorecard", featured: true },
  { href: "/trip", icon: "luggage", label: "Trip Info" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      style={{
        bottom: "calc(0px - env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      className="fixed left-0 right-0 z-40 bg-surface-container border-t border-outline-variant/40"
    >
      <div className="flex items-stretch h-14">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");

          if (tab.featured) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className="relative flex-1 flex items-start justify-center"
              >
                <span
                  className={[
                    "absolute -top-5 flex items-center justify-center",
                    "w-14 h-14 rounded-full bg-primary-fixed-dim text-on-primary",
                    "shadow-lg shadow-primary-fixed-dim/30 transition-transform",
                    "active:scale-95",
                    active ? "ring-2 ring-primary-fixed/60 ring-offset-2 ring-offset-surface-container" : "",
                  ].join(" ")}
                >
                  <span
                    className="material-symbols-outlined text-[28px]"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    {tab.icon}
                  </span>
                </span>
                <span className="absolute bottom-1 text-[10px] font-label font-medium uppercase tracking-wider text-on-surface-variant">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "relative flex-1 flex flex-col items-center justify-end pb-1 gap-0.5 transition-colors",
                "active:bg-surface-container-high",
                active ? "text-primary" : "text-on-surface-variant",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-label font-medium uppercase tracking-wider">
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

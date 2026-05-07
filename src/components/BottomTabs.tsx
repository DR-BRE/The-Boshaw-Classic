"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard" },
  { href: "/scorecard", icon: "scoreboard", label: "Scorecard" },
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
      }}
      className="fixed left-0 right-0 z-40 bg-surface-container border-t border-outline-variant/40"
    >
      <div className="flex items-stretch h-14">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
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

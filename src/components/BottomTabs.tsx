"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "home", label: "Home", highlight: false },
  { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard", highlight: false },
  { href: "/scorecard", icon: "scoreboard", label: "Scorecard", highlight: true },
  { href: "/trip", icon: "luggage", label: "Trip Info", highlight: false },
  { href: "/profile", icon: "person", label: "Profile", highlight: false },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-2 pb-4 pt-1.5 bg-surface-container-low border-t border-white/[0.06] rounded-t-2xl">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center active:scale-90 transition-transform duration-200 ${
              tab.highlight
                ? "bg-secondary text-on-secondary rounded-xl px-3 py-1.5 shadow-md shadow-secondary/20"
                : isActive
                  ? "bg-white/[0.1] text-secondary rounded-lg px-2.5 py-1"
                  : "text-primary/60 hover:bg-white/[0.06] px-2.5 py-1 rounded-lg"
            }`}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={
                isActive || tab.highlight
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {tab.icon}
            </span>
            <span className={`font-label text-[8px] uppercase tracking-wider leading-tight ${tab.highlight ? "font-black" : "font-bold"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

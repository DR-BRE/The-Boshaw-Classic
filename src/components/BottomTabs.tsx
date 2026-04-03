"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "home", label: "Home", highlight: false },
  { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard", highlight: false },
  { href: "/scoring", icon: "edit_note", label: "Enter Score", highlight: true },
  { href: "/scorecard", icon: "scoreboard", label: "Scorecard", highlight: false },
  { href: "/profile", icon: "person", label: "Profile", highlight: false },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-2 pb-5 pt-2 bg-[#263833]/60 backdrop-blur-xl rounded-t-2xl shadow-[0px_24px_48px_-12px_rgba(1,17,13,0.4)]">
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
                ? "bg-[#e9c349] text-[#3c2f00] rounded-xl px-3 py-1.5 shadow-md shadow-[#e9c349]/20"
                : isActive
                  ? "bg-[#062b21] text-[#e9c349] rounded-lg px-2.5 py-1"
                  : "text-[#a9cfbf]/60 hover:bg-[#1b2d29] px-2.5 py-1 rounded-lg"
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

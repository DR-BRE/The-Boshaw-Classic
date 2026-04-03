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
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[#263833]/60 backdrop-blur-xl rounded-t-3xl shadow-[0px_24px_48px_-12px_rgba(1,17,13,0.4)]">
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
                ? "bg-[#e9c349] text-[#3c2f00] rounded-xl px-4 py-1.5 -mt-2 shadow-lg shadow-[#e9c349]/20"
                : isActive
                  ? "bg-[#062b21] text-[#e9c349] rounded-xl px-3 py-1"
                  : "text-[#a9cfbf]/60 hover:bg-[#1b2d29] p-2 rounded-xl"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={
                isActive || tab.highlight
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {tab.icon}
            </span>
            <span className={`font-label text-[10px] uppercase tracking-wider mt-0.5 ${tab.highlight ? "font-black" : "font-bold"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

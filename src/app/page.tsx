"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import { TOURNAMENT } from "@/lib/tournament";
import type { LeaderboardEntry } from "@/lib/types/leaderboard";

function formatToPar(toPar: number) {
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}

function toParColor(toPar: number) {
  if (toPar < 0) return "text-primary";
  if (toPar > 0) return "text-on-error-container";
  return "text-on-surface";
}

export default function Home() {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data: LeaderboardEntry[]) => setTopPlayers(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-28 -mt-6">
      {/* Hero Section — fills most of the viewport so leaderboard sits near bottom */}
      <section className="relative overflow-hidden px-6 pb-8 flex-1 flex flex-col justify-end">
        {/* Hero background image — extends well above section to prevent logo clipping */}
        <div className="absolute -top-16 left-0 right-0 bottom-0 bg-[url('/hero-bg.png')] bg-cover bg-[center_20%]" />
        {/* Dark gradient overlay for text legibility */}
        <div className="absolute -top-16 left-0 right-0 bottom-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

        <div className="relative z-10">
          {/* Logo spacer — tall enough so logo is fully visible */}
          <div className="h-[50vh]" />

          {/* Countdown */}
          <div className="mb-6">
            <Countdown />
          </div>
        </div>
      </section>

      {/* Leaderboard Preview — Glassmorphism */}
      <section className="px-6 pb-8 mt-2">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-headline text-2xl text-on-surface">
            Leaderboard
          </h3>
          <span className="text-xs font-label text-primary uppercase tracking-widest bg-primary-container px-3 py-1 rounded-full">
            Live Updates
          </span>
        </div>
        {topPlayers.length > 0 ? (
          <div className="bg-surface-container-high/60 backdrop-blur-xl border border-outline-variant/15 rounded-xl p-4">
            <div className="space-y-0">
              {topPlayers.map((player, i) => (
                <div
                  key={player.playerId}
                  className={`flex items-center justify-between py-3 ${
                    i < topPlayers.length - 1 ? "border-b border-outline-variant/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-label font-bold text-sm text-secondary">
                      {i === 0 ? "\u{1F3C6}" : i === 1 ? "\u{1F948}" : "\u{1F949}"}
                    </span>
                    <span className="font-label font-medium text-on-surface text-sm">
                      {player.displayName}
                    </span>
                  </div>
                  <span className={`font-headline font-bold text-base ${toParColor(player.totalToPar)}`}>
                    {formatToPar(player.totalToPar)}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/leaderboard"
              className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-outline-variant/20 text-primary font-label font-bold text-xs uppercase tracking-widest"
            >
              View Full Leaderboard
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-high/60 backdrop-blur-xl border border-outline-variant/15 rounded-xl p-4 text-center">
            <span className="material-symbols-outlined text-secondary text-3xl mb-2">
              sports_golf
            </span>
            <p className="font-headline text-lg text-on-surface">
              Tournament starts{" "}
              {TOURNAMENT.date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {TOURNAMENT.courses.join(" & ")} &middot; {TOURNAMENT.location}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

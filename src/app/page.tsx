"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import Weather from "@/components/Weather";
import { TOURNAMENT } from "@/lib/tournament";
import type { LeaderboardEntry } from "@/lib/types/leaderboard";
import { useLiveRound } from "@/lib/useLiveRound";
import { Card, Badge } from "@/components/ui";

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
  const isLive = useLiveRound();

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data: LeaderboardEntry[]) => setTopPlayers(data.slice(0, 3)))
      .catch(() => {});

    const interval = setInterval(() => {
      fetch("/api/leaderboard")
        .then((res) => res.json())
        .then((data: LeaderboardEntry[]) => setTopPlayers(data.slice(0, 3)))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const heroLocation =
    typeof TOURNAMENT.location === "string" ? TOURNAMENT.location : "Lake Chelan";

  return (
    <div className="pb-28">
      {/* Hero */}
      <div className="relative px-4 pt-8 pb-10 overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
            src="/hero-bg.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">
          {heroLocation} · 2026
        </p>
        <h1 className="font-display text-5xl text-on-surface leading-none mb-6">
          THE BOSHAW<br />CLASSIC
        </h1>
        <Countdown />
      </div>

      {/* Weather */}
      <Card className="mx-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-primary text-lg"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            partly_cloudy_day
          </span>
          <h3 className="font-headline text-xl font-semibold text-on-surface">Weather</h3>
        </div>
        <Weather />
      </Card>

      {/* Tee Times */}
      <Card noPadding className="mx-4 mb-4 overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary text-lg"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            schedule
          </span>
          <h3 className="font-headline text-xl font-semibold text-on-surface">Tee Times</h3>
        </div>
        {TOURNAMENT.schedule.map((day) => (
          <div
            key={day.course}
            className="px-5 py-4 border-t border-outline-variant/30"
          >
            <div className="flex items-baseline justify-between mb-2">
              <p className="font-headline text-base font-semibold text-on-surface">{day.course}</p>
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
                {day.date}
              </p>
            </div>
            <div className="flex gap-2">
              {day.teeTimes.map((t) => (
                <div
                  key={t.group}
                  className="flex-1 bg-surface-container-high border border-outline-variant/40 rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <span className="font-label text-xs font-semibold text-primary uppercase tracking-wider">
                    Group {t.group}
                  </span>
                  <span className="font-headline text-sm font-semibold text-on-surface tabular-nums">
                    {t.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {/* Leaderboard Preview */}
      <Card noPadding className="mx-4 mb-4 overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="font-headline text-xl font-semibold text-on-surface">
            Leaderboard
          </h3>
          {isLive ? (
            <Badge variant="live">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Live
            </Badge>
          ) : (
            <Badge variant="muted">Live Updates</Badge>
          )}
        </div>
        {topPlayers.length > 0 ? (
          <>
            <div className="border-t border-outline-variant/30">
              {topPlayers.map((player, i) => (
                <div
                  key={player.playerId}
                  className={`flex items-center justify-between px-5 py-3 ${
                    i < topPlayers.length - 1 ? "border-b border-outline-variant/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-label font-bold text-sm">
                      {i === 0 ? "\u{1F3C6}" : i === 1 ? "\u{1F948}" : "\u{1F949}"}
                    </span>
                    <span className="font-label font-medium text-on-surface text-sm">
                      {player.displayName}
                    </span>
                  </div>
                  <span
                    className={`font-headline font-bold text-base tabular-nums ${toParColor(player.totalToPar)}`}
                  >
                    {formatToPar(player.totalToPar)}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/leaderboard"
              className="flex items-center justify-center gap-1 px-5 py-3 border-t border-outline-variant/30 text-primary hover:bg-surface-container-high font-label font-bold text-xs uppercase tracking-widest transition-colors"
            >
              View Full Leaderboard
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </>
        ) : (
          <div className="px-5 py-8 text-center border-t border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-3xl mb-2 block">
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
              {TOURNAMENT.courses.slice(0, 2).join(" & ")} &middot; {TOURNAMENT.location}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

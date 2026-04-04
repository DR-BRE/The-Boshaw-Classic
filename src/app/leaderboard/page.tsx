"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/lib/types/leaderboard";

const ROUNDS = [
  { label: "All Rounds", value: "" },
  { label: "Round 1", value: "1" },
  { label: "Round 2", value: "2" },
];

function formatToPar(toPar: number) {
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}

function toParColor(toPar: number) {
  if (toPar < 0) return "text-primary";
  if (toPar > 0) return "text-on-error-container";
  return "text-on-surface";
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <span className="material-symbols-outlined text-on-secondary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
          emoji_events
        </span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center">
        <span className="font-label font-bold text-sm text-on-tertiary">{rank}</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
        <span className="font-label font-bold text-sm text-on-secondary-container">{rank}</span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center">
      <span className="font-label font-bold text-sm text-on-surface-variant">{rank}</span>
    </div>
  );
}

function PlayerAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />;
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
      <span className="font-label font-bold text-sm text-primary">{initials}</span>
    </div>
  );
}

function SkeletonRow() {
  return <div className="bg-white/[0.06] animate-pulse rounded-xl h-[76px] mb-3" />;
}

export default function LeaderboardPage() {
  const [round, setRound] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = round ? `?round=${round}` : "";
    fetch(`/api/leaderboard${params}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const interval = setInterval(() => {
      fetch(`/api/leaderboard${params}`)
        .then((res) => res.json())
        .then((data) => setEntries(data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [round]);

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="font-headline text-3xl text-on-surface mb-1">Leaderboard</h2>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
            Bear Mountain Ranch & Desert Canyon
          </p>
        </div>
        <span className="text-xs font-label text-primary uppercase tracking-widest bg-primary-container px-3 py-1 rounded-full mt-1">
          Live
        </span>
      </div>

      {/* Round Tabs */}
      <div className="bg-white/[0.06] backdrop-blur-lg border border-white/[0.06] rounded-xl p-1 flex gap-1 mb-6">
        {ROUNDS.map((r) => (
          <button
            key={r.value}
            onClick={() => setRound(r.value)}
            className={`flex-1 py-2.5 rounded-lg font-label text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
              round === r.value
                ? "bg-white/[0.1] text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-secondary text-3xl mb-2">sports_golf</span>
          <p className="font-headline text-lg text-on-surface">No scores yet</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Scores will appear here once the tournament begins.
          </p>
        </div>
      )}

      {/* Leaderboard Rows */}
      {!loading && entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.playerId}
              className={`bg-white/[0.06] backdrop-blur-xl border rounded-xl p-4 flex items-center gap-3 ${
                entry.rank === 1 ? "border-secondary/30" : "border-white/[0.08]"
              }`}
            >
              {/* Rank */}
              <RankBadge rank={entry.rank} />

              {/* Avatar */}
              <PlayerAvatar name={entry.displayName} avatarUrl={entry.avatarUrl} />

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <p className="font-label font-bold text-on-surface truncate">
                  {entry.displayName}
                  {entry.rank === 1 && (
                    <span className="material-symbols-outlined text-secondary text-sm ml-1 align-middle" style={{ fontVariationSettings: '"FILL" 1' }}>
                      star
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {entry.firstName} {entry.lastName.charAt(0)}.
                </p>
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">
                  HCP {entry.handicap} · Group {entry.group} · {entry.roundsPlayed} {entry.roundsPlayed === 1 ? "round" : "rounds"}
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className={`font-headline text-xl font-bold ${toParColor(entry.totalToPar)}`}>
                  {formatToPar(entry.totalToPar)}
                </p>
                <p className="text-[11px] text-on-surface-variant tabular-nums">
                  {entry.totalStrokes} strokes
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/lib/types/leaderboard";

const ROUNDS = [
  { label: "All Rounds", value: "", course: "Bear Mountain Ranch, Desert Canyon & Echo Falls" },
  { label: "Round 1", value: "1", course: "Bear Mountain Ranch" },
  { label: "Round 2", value: "2", course: "Desert Canyon" },
  { label: "Round 3", value: "3", course: "Echo Falls" },
];

function formatToPar(toPar: number | null) {
  if (toPar === null) return "–";
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}

function toParColor(toPar: number | null) {
  if (toPar === null) return "text-on-surface-variant";
  if (toPar < 0) return "text-primary";
  if (toPar > 0) return "text-on-error-container";
  return "text-on-surface";
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        <img
          src="/trophy.png"
          alt="1st place"
          className="w-8 h-8 object-contain drop-shadow-lg"
        />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src="/trophy-silver.png"
          alt="2nd place"
          width={32}
          height={32}
          className="w-8 h-8 object-contain drop-shadow-lg"
        />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
        <span className="font-label font-bold text-sm text-on-secondary-container">{rank}</span>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
      <span className="font-label font-bold text-sm text-on-surface-variant">{rank}</span>
    </div>
  );
}

function PlayerAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />;
  }
  return (
    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
      <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
        face
      </span>
    </div>
  );
}

function RoundPill({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="bg-white/[0.06] rounded-md px-2 py-1 text-center min-w-[40px]">
      <p className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="font-label text-xs font-bold text-on-surface tabular-nums">{value}</p>
    </div>
  );
}

function ExpandedDetail({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="border-t border-white/[0.06] mt-3 pt-3 space-y-2">
      {entry.rounds.map((r) => (
        <div key={r.round} className="flex items-center justify-between px-1">
          <div className="flex-1">
            <p className="font-label text-xs font-bold text-on-surface">Round {r.round}</p>
            <p className="text-[11px] text-on-surface-variant">{r.course}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-label text-xs text-on-surface tabular-nums">{r.strokes !== null ? `${r.strokes} strokes` : "In progress"}</p>
            <p className={`font-label text-xs font-bold tabular-nums min-w-[32px] text-right ${toParColor(r.toPar)}`}>
              {formatToPar(r.toPar)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return <div className="bg-white/[0.06] animate-pulse rounded-xl h-[88px] mb-3" />;
}

export default function LeaderboardPage() {
  const [round, setRound] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = round ? `?round=${round}` : "";
    fetch(`/api/leaderboard${params}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const interval = setInterval(() => {
      fetch(`/api/leaderboard${params}`, { cache: "no-store" })
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
          <p className="font-label text-xs uppercase tracking-widest text-secondary mb-1">
            The Boshaw Classic
          </p>
          <h2 className="font-headline text-3xl font-bold text-on-surface uppercase">
            Leaderboard
          </h2>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            {ROUNDS.find((r) => r.value === round)?.course}
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
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.playerId;
            return (
              <div
                key={entry.playerId}
                onClick={() => setExpandedId(isExpanded ? null : entry.playerId)}
                className={`bg-white/[0.06] backdrop-blur-xl border rounded-xl p-4 cursor-pointer transition-all active:scale-[0.99] ${
                  entry.rank === 1 ? "border-secondary/30" : "border-white/[0.08]"
                }`}
              >
                  <div className="flex items-center gap-3">
                  {/* Chevron */}
                  <span
                    className={`material-symbols-outlined text-on-surface-variant text-lg shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>

                  {/* Rank */}
                  <RankBadge rank={entry.rank} />

                  {/* Avatar */}
                  <PlayerAvatar name={`${entry.firstName} ${entry.lastName}`} avatarUrl={entry.avatarUrl} />

                  {/* Name + Round Pills */}
                  <div className="flex-1 min-w-0">
                    <p className="font-label font-bold text-on-surface truncate">{entry.firstName}</p>
                    <p className="font-label text-xs text-on-surface-variant truncate mb-1.5">{entry.lastName}</p>
                    <div className="flex items-center gap-1.5">
                      {entry.rounds.map((r) => (
                        <RoundPill key={r.round} label={`R${r.round}`} value={r.strokes} />
                      ))}
                      <RoundPill label="Tot" value={entry.totalStrokes} />
                    </div>
                  </div>

                  {/* Today + Thru */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-0.5">Today</p>
                      <p className="font-headline text-2xl font-bold text-secondary">
                        {formatToPar(entry.totalToPar)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-0.5">Thru</p>
                      <p className="font-headline text-2xl font-bold text-on-surface">F</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && <ExpandedDetail entry={entry} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

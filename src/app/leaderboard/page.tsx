"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/lib/types/leaderboard";
import { useLiveRound } from "@/lib/useLiveRound";
import { LeaderboardRow } from "@/components/sport";
import { Badge, Card } from "@/components/ui";

const ROUNDS = [
  { label: "All Rounds", value: "", course: "Bear Mountain Ranch & Desert Canyon" },
  { label: "Round 1", value: "1", course: "Bear Mountain Ranch" },
  { label: "Round 2", value: "2", course: "Desert Canyon" },
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

function ExpandedDetail({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="space-y-2">
      {entry.rounds.map((r) => (
        <div key={r.round} className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-label text-xs font-semibold text-on-surface">Round {r.round}</p>
            <p className="text-[11px] text-on-surface-variant">{r.course}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-label text-xs text-on-surface tabular-nums">
              {r.strokes !== null ? `${r.strokes} strokes` : "In progress"}
            </p>
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
  return <div className="bg-surface-container-high animate-pulse rounded-xl h-[72px] mb-2" />;
}

export default function LeaderboardPage() {
  const [round, setRound] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isLive = useLiveRound();

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
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-primary mb-1">
            The Boshaw Classic
          </p>
          <h2 className="font-display text-4xl text-on-surface leading-none">
            LEADERBOARD
          </h2>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-2">
            {ROUNDS.find((r) => r.value === round)?.course}
          </p>
        </div>
        {isLive ? (
          <Badge variant="live">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Live
          </Badge>
        ) : (
          <Badge variant="muted">Live</Badge>
        )}
      </div>

      {/* Round Tabs */}
      <div className="flex bg-surface-container rounded-xl p-1 mb-4">
        {ROUNDS.map((r) => (
          <button
            key={r.value}
            onClick={() => setRound(r.value)}
            className={[
              "flex-1 py-2 rounded-lg text-sm font-label font-medium uppercase tracking-wider transition-all active:scale-95",
              round === r.value
                ? "bg-surface-container-high text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <Card className="text-center py-10">
          <span className="material-symbols-outlined text-primary text-3xl mb-2 block">sports_golf</span>
          <p className="font-headline text-lg text-on-surface">No scores yet</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Scores will appear here once the tournament begins.
          </p>
        </Card>
      )}

      {/* Leaderboard Rows */}
      {!loading && entries.length > 0 && (
        <>
          {/* Column Headers */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-outline-variant/40">
            <span className="w-8" />
            <span className="w-8" />
            <span className="flex-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Player</span>
            <div className="flex gap-4 text-right flex-shrink-0">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant w-10">Tot</span>
            </div>
          </div>

          <Card noPadding className="overflow-hidden">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.playerId;
              return (
                <div key={entry.playerId}>
                  <LeaderboardRow
                    rank={entry.rank}
                    name={entry.displayName}
                    avatarUrl={entry.avatarUrl}
                    scoreToPar={entry.totalToPar}
                    thru={null}
                    today={null}
                    total={entry.totalStrokes}
                    onPress={() => setExpandedId(isExpanded ? null : entry.playerId)}
                  />
                  {isExpanded && (
                    <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/30">
                      <ExpandedDetail entry={entry} />
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </>
      )}
    </div>
  );
}

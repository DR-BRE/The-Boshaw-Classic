"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { ScorecardData, ScorecardPlayer } from "@/lib/types/scorecard";

type ViewMode = "card" | "classic";

const ROUNDS = [
  { label: "Round 1", value: "1" },
  { label: "Round 2", value: "2" },
];

function scoreColor(score: number | null, par: number) {
  if (score === null) return "text-on-surface-variant";
  if (score < par) return "text-primary";
  if (score > par) return "text-on-error-container";
  return "text-on-surface";
}

function netColor(net: number | null, coursePar: number) {
  if (net === null) return "text-on-surface-variant";
  if (net < coursePar) return "text-primary";
  if (net > coursePar) return "text-on-error-container";
  return "text-on-surface";
}

function groupDotColor(group: number) {
  return group === 1 ? "bg-primary" : "bg-secondary";
}

function scoreBg(score: number | null, par: number) {
  if (score === null) return "bg-surface-container-high border-outline-variant/30";
  if (score < par) return "bg-primary/15 border-primary/30";
  if (score > par) return "bg-on-error-container/10 border-on-error-container/30";
  return "bg-surface-container-high border-outline-variant/30";
}

function scoreLabel(score: number | null, par: number) {
  if (score === null) return "—";
  const diff = score - par;
  if (score === 1) return "Ace!";
  if (diff <= -2) return "Eagle!";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double";
  return `+${diff}`;
}

function scoreLabelColor(score: number | null, par: number) {
  if (score === null) return "text-on-surface-variant";
  const diff = score - par;
  if (diff < 0) return "text-primary";
  if (diff === 0) return "text-on-surface-variant";
  return "text-on-error-container";
}

// ─── Card View ─────────────────────────────────────────

function formatToPar(n: number) {
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : `${n}`;
}

function toParColor(n: number) {
  if (n < 0) return "text-primary";
  if (n > 0) return "text-on-error-container";
  return "text-on-surface";
}

function HoleRow({
  hole,
  par,
  score,
  isOwnCard,
  onIncrement,
  onDecrement,
}: {
  hole: number;
  par: number;
  score: number | null;
  isOwnCard: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const diff = score !== null ? score - par : null;

  return (
    <div className="flex items-center py-3 px-4 border-b border-white/[0.04]">
      {/* Hole number */}
      <span className="w-8 font-headline text-lg font-bold text-on-surface tabular-nums">
        {hole}
      </span>

      {/* Par info */}
      <div className="w-16">
        <p className="font-label text-sm font-bold text-on-surface">Par {par}</p>
      </div>

      {/* Score display */}
      <span className={`w-10 text-center font-headline text-lg font-bold tabular-nums ${score !== null ? scoreColor(score, par) : "text-on-surface-variant"}`}>
        {score !== null ? score : "—"}
      </span>

      {/* +/- buttons (only for own card) */}
      {isOwnCard ? (
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onDecrement}
            disabled={score === null || score <= 1}
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-on-surface text-lg">remove</span>
          </button>
          <span className={`w-6 text-center font-headline text-lg font-bold tabular-nums ${score !== null ? scoreColor(score, par) : "text-on-surface-variant"}`}>
            {score !== null ? score : "·"}
          </span>
          <button
            onClick={onIncrement}
            disabled={score !== null && score >= 15}
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-on-surface text-lg">add</span>
          </button>
        </div>
      ) : (
        <span className="ml-auto w-10" />
      )}

      {/* +/- to par */}
      <span className={`w-10 text-right font-label text-sm font-bold tabular-nums ${diff !== null ? (diff < 0 ? "text-primary" : diff > 0 ? "text-on-error-container" : "text-on-surface-variant") : "text-on-surface-variant"}`}>
        {diff !== null ? (diff === 0 ? "E" : diff > 0 ? `+${diff}` : diff) : "—"}
      </span>
    </div>
  );
}

function CardView({
  players,
  holePars,
  selectedPlayer,
  setSelectedPlayer,
  currentUserId,
  onScoreChange,
}: {
  players: ScorecardPlayer[];
  holePars: number[];
  selectedPlayer: number;
  setSelectedPlayer: (i: number) => void;
  currentUserId: string | null;
  onScoreChange: (playerIdx: number, holeIdx: number, delta: number) => void;
}) {
  const player = players[selectedPlayer];
  if (!player) return null;

  const isOwnCard = player.id === currentUserId;
  const frontPars = holePars.slice(0, 9);
  const backPars = holePars.slice(9);
  const frontPar = frontPars.reduce((s, p) => s + p, 0);
  const backPar = backPars.reduce((s, p) => s + p, 0);

  const frontScores = player.scores.slice(0, 9);
  const backScores = player.scores.slice(9);
  const frontTotal = frontScores.every((s) => s !== null)
    ? frontScores.reduce((s, v) => s! + v!, 0)
    : null;
  const backTotal = backScores.every((s) => s !== null)
    ? backScores.reduce((s, v) => s! + v!, 0)
    : null;
  const gross = frontTotal !== null && backTotal !== null ? frontTotal + backTotal : null;
  const toPar = gross !== null ? gross - (frontPar + backPar) : null;
  const net = player.net;

  return (
    <div>
      {/* Player Selector — horizontal scroll */}
      <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">
        Your Scorecard
      </p>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {players.map((p, i) => {
          const active = i === selectedPlayer;
          const initials = p.displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlayer(i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-95 min-w-[72px] ${
                active
                  ? "bg-white/[0.1] border border-secondary/40"
                  : "bg-white/[0.04] border border-white/[0.06]"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  active
                    ? "bg-secondary text-on-secondary"
                    : "bg-white/[0.08] text-on-surface-variant"
                }`}
              >
                {initials}
              </div>
              <span
                className={`font-label text-[9px] font-bold truncate max-w-[64px] ${
                  active ? "text-secondary" : "text-on-surface-variant"
                }`}
              >
                {p.displayName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary Bar */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl p-3 mb-4">
        <div className="flex justify-around text-center">
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Front</p>
            <p className={`font-headline text-lg font-bold tabular-nums ${frontTotal !== null ? "text-on-surface" : "text-on-surface-variant"}`}>
              {frontTotal !== null ? frontTotal : "—"}
            </p>
          </div>
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Back</p>
            <p className={`font-headline text-lg font-bold tabular-nums ${backTotal !== null ? "text-on-surface" : "text-on-surface-variant"}`}>
              {backTotal !== null ? backTotal : "—"}
            </p>
          </div>
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">+/−</p>
            <p className={`font-headline text-lg font-bold tabular-nums ${toPar !== null ? toParColor(toPar) : "text-on-surface-variant"}`}>
              {toPar !== null ? formatToPar(toPar) : "—"}
            </p>
          </div>
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Gross</p>
            <p className={`font-headline text-lg font-bold tabular-nums ${gross !== null ? "text-on-surface" : "text-on-surface-variant"}`}>
              {gross !== null ? gross : "—"}
            </p>
          </div>
          <div>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">Net</p>
            <p className={`font-headline text-lg font-bold tabular-nums ${net !== null ? "text-on-surface" : "text-on-surface-variant"}`}>
              {net !== null ? net : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Front 9 */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden mb-4">
        <div className="flex justify-between items-center bg-secondary px-4 py-2">
          <h3 className="font-headline text-on-secondary text-sm font-bold uppercase tracking-wider">
            Front 9
          </h3>
          <span className="font-headline text-on-secondary text-sm font-bold">
            par {frontPar}
          </span>
        </div>
        {frontPars.map((par, i) => (
          <HoleRow
            key={i}
            hole={i + 1}
            par={par}
            score={player.scores[i]}
            isOwnCard={isOwnCard}
            onIncrement={() => onScoreChange(selectedPlayer, i, 1)}
            onDecrement={() => onScoreChange(selectedPlayer, i, -1)}
          />
        ))}
      </div>

      {/* Back 9 */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden mb-4">
        <div className="flex justify-between items-center bg-secondary px-4 py-2">
          <h3 className="font-headline text-on-secondary text-sm font-bold uppercase tracking-wider">
            Back 9
          </h3>
          <span className="font-headline text-on-secondary text-sm font-bold">
            par {backPar}
          </span>
        </div>
        {backPars.map((par, i) => (
          <HoleRow
            key={i + 9}
            hole={i + 10}
            par={par}
            score={player.scores[i + 9]}
            isOwnCard={isOwnCard}
            onIncrement={() => onScoreChange(selectedPlayer, i + 9, 1)}
            onDecrement={() => onScoreChange(selectedPlayer, i + 9, -1)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Classic View (Grid) ──────────────────────────────

function NineHoleGrid({
  label,
  totalLabel,
  startHole,
  holePars,
  players,
}: {
  label: string;
  totalLabel: string;
  startHole: number;
  holePars: number[];
  players: ScorecardPlayer[];
}) {
  const parTotal = holePars.reduce((sum, p) => sum + p, 0);

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="bg-secondary rounded-t-xl px-4 py-2">
        <h3 className="font-headline text-on-secondary text-center text-lg font-bold uppercase tracking-wider">
          {label}
        </h3>
      </div>

      {/* Scrollable Grid */}
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full min-w-[600px]">
          {/* Column Header — Hole Numbers */}
          <thead>
            <tr className="bg-surface-container">
              <th className="sticky left-0 z-10 bg-surface-container text-left px-3 py-2 font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant min-w-[120px] shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
                Player
              </th>
              {holePars.map((_, i) => (
                <th
                  key={i}
                  className="px-1 py-2 text-center font-label text-xs font-bold text-secondary min-w-[40px]"
                >
                  {startHole + i + 1}
                </th>
              ))}
              <th className="px-2 py-2 text-center font-label text-xs font-bold text-secondary min-w-[44px]">
                {totalLabel}
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Par Row */}
            <tr className="bg-surface-container-high">
              <td className="sticky left-0 z-10 bg-surface-container-high px-3 py-1.5 font-label text-xs text-on-surface-variant shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
                Par
              </td>
              {holePars.map((par, i) => (
                <td
                  key={i}
                  className="px-1 py-1.5 text-center font-label text-xs text-on-surface-variant"
                >
                  {par}
                </td>
              ))}
              <td className="px-2 py-1.5 text-center font-label text-xs font-bold text-on-surface-variant">
                {parTotal}
              </td>
            </tr>

            {/* Player Rows */}
            {players.map((player, pIdx) => {
              const nineScores = player.scores.slice(startHole, startHole + 9);
              const nineTotal =
                nineScores.every((s) => s !== null)
                  ? nineScores.reduce((sum, s) => sum! + s!, 0)
                  : null;
              const rowBg =
                pIdx % 2 === 0 ? "bg-surface" : "bg-surface-container-low";

              return (
                <tr key={player.id} className={rowBg}>
                  <td
                    className={`sticky left-0 z-10 ${rowBg} px-3 py-2 shadow-[2px_0_4px_rgba(0,0,0,0.3)]`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${groupDotColor(player.group)}`}
                      />
                      <span className="font-label text-xs font-bold text-on-surface truncate max-w-[90px]">
                        {player.displayName}
                      </span>
                    </div>
                  </td>
                  {nineScores.map((score, i) => (
                    <td
                      key={i}
                      className={`px-1 py-2 text-center font-label text-sm font-bold tabular-nums ${scoreColor(score, holePars[i])}`}
                    >
                      {score !== null ? score : "—"}
                    </td>
                  ))}
                  <td
                    className={`px-2 py-2 text-center font-label text-sm font-bold tabular-nums ${
                      nineTotal !== null
                        ? nineTotal < parTotal
                          ? "text-primary"
                          : nineTotal > parTotal
                            ? "text-on-error-container"
                            : "text-on-surface"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {nineTotal !== null ? nineTotal : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryTable({
  players,
  coursePar,
  frontPar,
  backPar,
}: {
  players: ScorecardPlayer[];
  coursePar: number;
  frontPar: number;
  backPar: number;
}) {
  return (
    <div className="mb-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="bg-surface-container">
              <th className="sticky left-0 z-10 bg-surface-container text-left px-3 py-2 font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant min-w-[120px] shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
                Player
              </th>
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-secondary">
                HCP
              </th>
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-secondary">
                Front
              </th>
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-secondary">
                Back
              </th>
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-secondary">
                Gross
              </th>
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-secondary">
                Net
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Par Row */}
            <tr className="bg-surface-container-high">
              <td className="sticky left-0 z-10 bg-surface-container-high px-3 py-1.5 font-label text-xs text-on-surface-variant shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
                Par
              </td>
              <td className="px-2 py-1.5 text-center font-label text-xs text-on-surface-variant">
                —
              </td>
              <td className="px-2 py-1.5 text-center font-label text-xs text-on-surface-variant">
                {frontPar}
              </td>
              <td className="px-2 py-1.5 text-center font-label text-xs text-on-surface-variant">
                {backPar}
              </td>
              <td className="px-2 py-1.5 text-center font-label text-xs font-bold text-on-surface-variant">
                {coursePar}
              </td>
              <td className="px-2 py-1.5 text-center font-label text-xs text-on-surface-variant">
                —
              </td>
            </tr>

            {/* Player Rows */}
            {players.map((player, pIdx) => {
              const rowBg =
                pIdx % 2 === 0 ? "bg-surface" : "bg-surface-container-low";
              return (
                <tr key={player.id} className={rowBg}>
                  <td
                    className={`sticky left-0 z-10 ${rowBg} px-3 py-2 shadow-[2px_0_4px_rgba(0,0,0,0.3)]`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${groupDotColor(player.group)}`}
                      />
                      <span className="font-label text-xs font-bold text-on-surface truncate max-w-[90px]">
                        {player.displayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center font-label text-sm text-on-surface tabular-nums">
                    {player.handicap}
                  </td>
                  <td
                    className={`px-2 py-2 text-center font-label text-sm font-bold tabular-nums ${
                      player.front9 !== null
                        ? scoreColor(player.front9, frontPar)
                        : "text-on-surface-variant"
                    }`}
                  >
                    {player.front9 !== null ? player.front9 : "—"}
                  </td>
                  <td
                    className={`px-2 py-2 text-center font-label text-sm font-bold tabular-nums ${
                      player.back9 !== null
                        ? scoreColor(player.back9, backPar)
                        : "text-on-surface-variant"
                    }`}
                  >
                    {player.back9 !== null ? player.back9 : "—"}
                  </td>
                  <td
                    className={`px-2 py-2 text-center font-label text-sm font-bold tabular-nums ${
                      player.gross !== null
                        ? scoreColor(player.gross, coursePar)
                        : "text-on-surface-variant"
                    }`}
                  >
                    {player.gross !== null ? player.gross : "—"}
                  </td>
                  <td
                    className={`px-2 py-2 text-center font-headline text-sm font-bold tabular-nums ${netColor(player.net, coursePar)}`}
                  >
                    {player.net !== null ? player.net : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ScorecardPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<ViewMode>("card");
  const [round, setRound] = useState("1");
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch current user's player ID
  useEffect(() => {
    if (!session) return;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((d) => {
        if (d.player?.id) setCurrentUserId(d.player.id);
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scorecard?round=${round}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setSelectedPlayer(0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [round]);

  // Handle score change from card view +/- buttons
  function handleScoreChange(playerIdx: number, holeIdx: number, delta: number) {
    if (!data) return;
    const player = data.players[playerIdx];
    if (player.id !== currentUserId) return; // only edit own scores
    const current = player.scores[holeIdx];
    if (current === null) return;
    const next = Math.max(1, Math.min(15, current + delta));
    if (next === current) return;

    // Optimistic update
    const newPlayers = data.players.map((p, pi) => {
      if (pi !== playerIdx) return p;
      const newScores = [...p.scores];
      newScores[holeIdx] = next;
      const front9 = newScores.slice(0, 9).every((s) => s !== null)
        ? newScores.slice(0, 9).reduce((sum, s) => sum! + s!, 0)
        : null;
      const back9 = newScores.slice(9).every((s) => s !== null)
        ? newScores.slice(9).reduce((sum, s) => sum! + s!, 0)
        : null;
      const gross = front9 !== null && back9 !== null ? front9 + back9 : null;
      return { ...p, scores: newScores, front9, back9, gross };
    });
    setData({ ...data, players: newPlayers });

    // Save to server (debounced-ish: fire and forget)
    const allScores = newPlayers[playerIdx].scores as number[];
    setSaving(true);
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ round: Number(round), holes: allScores }),
    }).finally(() => setSaving(false));
  }

  const frontPar = data
    ? data.course.holes.slice(0, 9).reduce((s, p) => s + p, 0)
    : 0;
  const backPar = data
    ? data.course.holes.slice(9).reduce((s, p) => s + p, 0)
    : 0;

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <h2 className="font-headline text-3xl text-on-surface mb-5">
        Scorecard
      </h2>

      {/* Round Tabs */}
      <div className="bg-white/[0.06] backdrop-blur-lg border border-white/[0.06] rounded-xl p-1 flex gap-1 mb-4">
        {ROUNDS.map((r) => (
          <button
            key={r.value}
            onClick={() => { setRound(r.value); setSelectedPlayer(0); }}
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
        <div className="space-y-4">
          <div className="bg-white/[0.06] animate-pulse rounded-xl h-10" />
          <div className="bg-white/[0.06] animate-pulse rounded-xl h-64" />
          <div className="bg-white/[0.06] animate-pulse rounded-xl h-64" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !data && (
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-secondary text-3xl mb-2">
            scoreboard
          </span>
          <p className="font-headline text-lg text-on-surface">
            No scorecard data
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            Scores will appear here once the tournament begins.
          </p>
        </div>
      )}

      {/* Scorecard Content */}
      {!loading && data && (
        <>
          {/* Course Info + View Toggle */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-headline text-lg text-on-surface">
                {data.course.name}
              </h3>
              <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
                Par {data.course.par}
              </p>
            </div>

            {/* View Toggle */}
            <div className="bg-white/[0.06] border border-white/[0.06] rounded-lg p-0.5 flex">
              <button
                onClick={() => setView("card")}
                className={`px-3 py-1.5 rounded-md font-label text-[10px] font-bold uppercase tracking-wider transition-all ${
                  view === "card"
                    ? "bg-white/[0.1] text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                Card
              </button>
              <button
                onClick={() => setView("classic")}
                className={`px-3 py-1.5 rounded-md font-label text-[10px] font-bold uppercase tracking-wider transition-all ${
                  view === "classic"
                    ? "bg-white/[0.1] text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                Classic
              </button>
            </div>
          </div>

          {/* Views */}
          {view === "card" ? (
            <CardView
              players={data.players}
              holePars={data.course.holes}
              selectedPlayer={selectedPlayer}
              setSelectedPlayer={setSelectedPlayer}
              currentUserId={currentUserId}
              onScoreChange={handleScoreChange}
            />
          ) : (
            <>
              {/* Front 9 */}
              <NineHoleGrid
                label="Front 9"
                totalLabel="OUT"
                startHole={0}
                holePars={data.course.holes.slice(0, 9)}
                players={data.players}
              />

              {/* Back 9 */}
              <NineHoleGrid
                label="Back 9"
                totalLabel="IN"
                startHole={9}
                holePars={data.course.holes.slice(9)}
                players={data.players}
              />

              {/* Summary */}
              <div className="bg-secondary rounded-t-xl px-4 py-2 mt-2">
                <h3 className="font-headline text-on-secondary text-center text-lg font-bold uppercase tracking-wider">
                  Summary
                </h3>
              </div>
              <SummaryTable
                players={data.players}
                coursePar={data.course.par}
                frontPar={frontPar}
                backPar={backPar}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

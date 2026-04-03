"use client";

import { useEffect, useState } from "react";
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

function CardView({
  players,
  holePars,
  currentHole,
  setCurrentHole,
}: {
  players: ScorecardPlayer[];
  holePars: number[];
  currentHole: number;
  setCurrentHole: (h: number) => void;
}) {
  const par = holePars[currentHole];
  const isFirst = currentHole === 0;
  const isLast = currentHole === 17;

  return (
    <div>
      {/* Hole Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        {Array.from({ length: 18 }, (_, i) => {
          const active = i === currentHole;
          return (
            <button
              key={i}
              onClick={() => setCurrentHole(i)}
              className={`flex-shrink-0 w-9 h-9 rounded-lg font-label text-xs font-bold transition-all active:scale-90 ${
                active
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Hole Info Header */}
      <div className="bg-surface-container rounded-2xl p-5 mb-4">
        <div className="flex justify-between items-center mb-5">
          <div>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              {currentHole < 9 ? "Front 9" : "Back 9"}
            </p>
            <h3 className="font-headline text-3xl text-on-surface">
              Hole {currentHole + 1}
            </h3>
          </div>
          <div className="text-right">
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              Par
            </p>
            <p className="font-headline text-3xl text-secondary">{par}</p>
          </div>
        </div>

        {/* Player Scores */}
        <div className="space-y-2.5">
          {players.map((player) => {
            const score = player.scores[currentHole];
            return (
              <div
                key={player.id}
                className="flex items-center justify-between bg-surface rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${groupDotColor(player.group)}`}
                  />
                  <span className="font-label text-sm font-bold text-on-surface">
                    {player.displayName}
                  </span>
                  <span className="font-label text-[10px] text-on-surface-variant">
                    ({player.handicap})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-label text-[10px] font-bold uppercase tracking-wider ${scoreLabelColor(score, par)}`}>
                    {scoreLabel(score, par)}
                  </span>
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${scoreBg(score, par)}`}>
                    <span className={`font-headline text-lg font-bold tabular-nums ${scoreColor(score, par)}`}>
                      {score !== null ? score : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => !isFirst && setCurrentHole(currentHole - 1)}
          disabled={isFirst}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-outline-variant/40 font-label font-bold text-sm uppercase tracking-wider text-on-surface disabled:opacity-30 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Prev
        </button>
        <button
          onClick={() => !isLast && setCurrentHole(currentHole + 1)}
          disabled={isLast}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-outline-variant/40 font-label font-bold text-sm uppercase tracking-wider text-on-surface disabled:opacity-30 active:scale-95 transition-transform"
        >
          Next
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
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
  const [view, setView] = useState<ViewMode>("card");
  const [round, setRound] = useState("1");
  const [currentHole, setCurrentHole] = useState(0);
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scorecard?round=${round}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [round]);

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
      <div className="bg-surface-container rounded-xl p-1 flex gap-1 mb-4">
        {ROUNDS.map((r) => (
          <button
            key={r.value}
            onClick={() => { setRound(r.value); setCurrentHole(0); }}
            className={`flex-1 py-2.5 rounded-lg font-label text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
              round === r.value
                ? "bg-primary-container text-primary"
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
          <div className="bg-surface-container-high animate-pulse rounded-xl h-10" />
          <div className="bg-surface-container-high animate-pulse rounded-xl h-64" />
          <div className="bg-surface-container-high animate-pulse rounded-xl h-64" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !data && (
        <div className="bg-surface-container-high rounded-xl p-8 text-center">
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
            <div className="bg-surface-container rounded-lg p-0.5 flex">
              <button
                onClick={() => setView("card")}
                className={`px-3 py-1.5 rounded-md font-label text-[10px] font-bold uppercase tracking-wider transition-all ${
                  view === "card"
                    ? "bg-primary-container text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                Card
              </button>
              <button
                onClick={() => setView("classic")}
                className={`px-3 py-1.5 rounded-md font-label text-[10px] font-bold uppercase tracking-wider transition-all ${
                  view === "classic"
                    ? "bg-primary-container text-primary"
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
              currentHole={currentHole}
              setCurrentHole={setCurrentHole}
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

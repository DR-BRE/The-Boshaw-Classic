"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { ScorecardData, ScorecardPlayer } from "@/lib/types/scorecard";
import { COURSE_PARS } from "@/lib/tournament";
import { getWolfForHole, calculateWolfStandings } from "@/lib/wolf";

type ViewMode = "card" | "classic";
type GameMode = "scorecard" | "wolf" | "high-low";

const COURSE_HOLE_IMAGES: Record<string, string> = {
  "Echo Falls": "/courses/echo-falls",
};

const GAME_MODES: { label: string; value: GameMode; icon: string }[] = [
  { label: "Scorecard", value: "scorecard", icon: "scoreboard" },
  { label: "Wolf", value: "wolf", icon: "pets" },
  { label: "High-Low", value: "high-low", icon: "swap_vert" },
];

const ROUNDS = [
  { label: "Round 1", value: "1" },
  { label: "Round 2", value: "2" },
  { label: "Round 3", value: "3" },
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

function sortPlayersByGroup(
  players: ScorecardPlayer[],
  currentPlayerId: string | null
) {
  const currentUser = players.find((p) => p.id === currentPlayerId);
  const userGroup = currentUser?.group ?? 0;

  const self = players.filter((p) => p.id === currentPlayerId);
  const sameGroup = players.filter(
    (p) => p.id !== currentPlayerId && p.group === userGroup && userGroup > 0
  );
  const otherGroup = players.filter(
    (p) => p.id !== currentPlayerId && (p.group !== userGroup || userGroup === 0)
  );

  return { sorted: [...self, ...sameGroup, ...otherGroup], dividerAfter: self.length + sameGroup.length };
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

function ColumnHeaders({ hasYardage }: { hasYardage?: boolean }) {
  return (
    <div className="flex items-center py-2 px-4 border-b border-white/[0.06] bg-white/[0.02]">
      <span className="w-8 font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Hole</span>
      <span className="w-14 font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Par</span>
      <span className="w-8 text-center font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">HCP</span>
      {hasYardage && (
        <span className="w-10 text-center font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Yds</span>
      )}
      <span className="ml-auto font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center" style={{ width: "118px" }}>Score</span>
      <span className="w-10 text-right font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">+/−</span>
    </div>
  );
}

function HoleRow({
  hole,
  par,
  score,
  handicap,
  yardage,
  onYardageClick,
  editable,
  onIncrement,
  onDecrement,
  isWolf,
}: {
  hole: number;
  par: number;
  score: number | null;
  handicap: number;
  yardage?: number;
  onYardageClick?: (hole: number) => void;
  editable: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  isWolf?: boolean;
}) {
  const diff = score !== null ? score - par : null;

  return (
    <div className={`flex items-center py-3 px-4 border-b border-white/[0.04] ${isWolf ? "bg-yellow-500/10" : ""}`}>
      {/* Hole number */}
      <span className="w-8 font-headline text-lg font-bold text-on-surface tabular-nums">
        {isWolf ? "🐺" : hole}
      </span>

      {/* Par info */}
      <div className="w-14">
        <p className="font-label text-sm font-bold text-on-surface">Par {par}</p>
      </div>

      {/* Handicap */}
      <span className="w-8 text-center font-label text-sm text-on-surface-variant tabular-nums">
        {handicap}
      </span>

      {/* Yardage */}
      {yardage !== undefined && (
        <button
          onClick={() => onYardageClick?.(hole)}
          className="w-10 text-center font-label text-sm text-secondary tabular-nums active:scale-95 transition-transform"
        >
          {yardage}
        </button>
      )}

      {/* +/- buttons or read-only score */}
      <div className="flex items-center gap-2 ml-auto">
        {editable && (
          <button
            onClick={onDecrement}
            disabled={score !== null && score <= 1}
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-on-surface text-lg">remove</span>
          </button>
        )}
        <span className={`w-6 text-center font-headline text-lg font-bold tabular-nums ${score !== null ? scoreColor(score, par) : "text-on-surface-variant"}`}>
          {score !== null ? score : "·"}
        </span>
        {editable && (
          <button
            onClick={onIncrement}
            disabled={score !== null && score >= 15}
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-on-surface text-lg">add</span>
          </button>
        )}
      </div>

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
  strokeIndices,
  yardages,
  onYardageClick,
  selectedPlayer,
  setSelectedPlayer,
  onScoreChange,
  currentPlayerId,
  wolfOrder,
  isAdmin,
}: {
  players: ScorecardPlayer[];
  holePars: number[];
  strokeIndices: readonly number[];
  yardages?: number[];
  onYardageClick?: (hole: number) => void;
  selectedPlayer: number;
  setSelectedPlayer: (i: number) => void;
  onScoreChange: (playerIdx: number, holeIdx: number, delta: number) => void;
  currentPlayerId: string | null;
  wolfOrder?: string[] | null;
  isAdmin?: boolean;
}) {
  const player = players[selectedPlayer];
  const canEdit = player?.id === currentPlayerId || !!isAdmin;
  if (!player) return null;

  const frontPars = holePars.slice(0, 9);
  const backPars = holePars.slice(9);
  const frontIndices = strokeIndices.slice(0, 9);
  const backIndices = strokeIndices.slice(9);
  const frontYardages = yardages?.slice(0, 9);
  const backYardages = yardages?.slice(9);
  const frontPar = frontPars.reduce((s, p) => s + p, 0);
  const backPar = backPars.reduce((s, p) => s + p, 0);
  const frontYds = frontYardages?.reduce((s, y) => s + y, 0);
  const backYds = backYardages?.reduce((s, y) => s + y, 0);

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
              {p.avatarUrl ? (
                <img
                  src={p.avatarUrl}
                  alt={p.displayName}
                  className={`w-9 h-9 rounded-full object-cover border-2 ${
                    active ? "border-secondary" : "border-white/[0.08]"
                  }`}
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    active
                      ? "bg-secondary text-on-secondary"
                      : "bg-white/[0.08] text-on-surface-variant"
                  }`}
                >
                  {initials}
                </div>
              )}
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
            {frontYds !== undefined && <>{frontYds} yds &middot; </>}par {frontPar}
          </span>
        </div>
        <ColumnHeaders hasYardage={!!frontYardages} />
        {frontPars.map((par, i) => (
          <HoleRow
            key={i}
            hole={i + 1}
            par={par}
            score={player.scores[i]}
            handicap={frontIndices[i]}
            yardage={frontYardages?.[i]}
            onYardageClick={onYardageClick}
            editable={canEdit}
            onIncrement={() => onScoreChange(selectedPlayer, i, 1)}
            onDecrement={() => onScoreChange(selectedPlayer, i, -1)}
            isWolf={getWolfForHole(wolfOrder ?? null, i + 1) === player.id}
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
            {backYds !== undefined && <>{backYds} yds &middot; </>}par {backPar}
          </span>
        </div>
        <ColumnHeaders hasYardage={!!backYardages} />
        {backPars.map((par, i) => (
          <HoleRow
            key={i + 9}
            hole={i + 10}
            par={par}
            score={player.scores[i + 9]}
            handicap={backIndices[i]}
            yardage={backYardages?.[i]}
            onYardageClick={onYardageClick}
            editable={canEdit}
            onIncrement={() => onScoreChange(selectedPlayer, i + 9, 1)}
            onDecrement={() => onScoreChange(selectedPlayer, i + 9, -1)}
            isWolf={getWolfForHole(wolfOrder ?? null, i + 10) === player.id}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Classic View (Grid) ──────────────────────────────

function ScoreInput({
  value,
  holeIdx,
  onSubmit,
  onClose,
}: {
  value: number | null;
  holeIdx: number;
  onSubmit: (holeIdx: number, score: number) => void;
  onClose: () => void;
}) {
  const [inputValue, setInputValue] = useState(value !== null ? String(value) : "");

  function handleSubmit() {
    const num = parseInt(inputValue);
    if (num >= 1 && num <= 15) {
      onSubmit(holeIdx, num);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-surface-container-high border border-white/[0.1] rounded-2xl p-5 w-48 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">
          Hole {holeIdx + 1}
        </p>
        <input
          autoFocus
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          max={15}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full text-center font-headline text-3xl font-bold text-on-surface bg-white/[0.06] border border-white/[0.1] rounded-xl py-3 mb-3 outline-none focus:border-secondary"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 bg-secondary text-on-secondary font-label text-sm font-bold uppercase tracking-wider rounded-xl active:scale-95 transition-transform"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function wolfPointColor(pts: number) {
  if (pts > 0) return "text-primary";
  if (pts < 0) return "text-on-error-container";
  return "text-on-surface-variant";
}

function NineHoleGrid({
  label,
  totalLabel,
  startHole,
  holePars,
  yardages,
  onYardageClick,
  players,
  currentPlayerId,
  onScoreTap,
  wolfOrder,
  wolfPicks,
  wolfStandings,
  isAdmin,
  onWolfPick,
}: {
  label: string;
  totalLabel: string;
  startHole: number;
  holePars: number[];
  yardages?: number[];
  onYardageClick?: (hole: number) => void;
  players: ScorecardPlayer[];
  currentPlayerId: string | null;
  onScoreTap?: (playerId: string, holeIdx: number) => void;
  wolfOrder?: string[] | null;
  wolfPicks?: Record<number, string | null>;
  wolfStandings?: ReturnType<typeof calculateWolfStandings> | null;
  isAdmin?: boolean;
  onWolfPick?: (hole: number, partnerId: string | null) => void;
}) {
  const parTotal = holePars.reduce((sum, p) => sum + p, 0);
  const ydsTotal = yardages?.reduce((sum, y) => sum + y, 0);

  const { sorted: sortedPlayers, dividerAfter } = sortPlayersByGroup(players, currentPlayerId);

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

            {/* Yardage Row */}
            {yardages && (
              <tr className="bg-surface-container-high">
                <td className="sticky left-0 z-10 bg-surface-container-high px-3 py-1.5 font-label text-xs text-on-surface-variant shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
                  Yds
                </td>
                {yardages.map((yds, i) => (
                  <td key={i} className="px-1 py-1.5 text-center">
                    <button
                      onClick={() => onYardageClick?.(startHole + i + 1)}
                      className="font-label text-xs text-secondary tabular-nums active:scale-95 transition-transform"
                    >
                      {yds}
                    </button>
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center font-label text-xs font-bold text-secondary tabular-nums">
                  {ydsTotal}
                </td>
              </tr>
            )}

            {/* Player Rows */}
            {sortedPlayers.map((player, pIdx) => {
              const isCurrentUser = player.id === currentPlayerId;
              const nineScores = player.scores.slice(startHole, startHole + 9);
              const nineTotal =
                nineScores.every((s) => s !== null)
                  ? nineScores.reduce((sum, s) => sum! + s!, 0)
                  : null;
              const rowBg = isCurrentUser
                ? "bg-secondary/10"
                : pIdx % 2 === 0
                  ? "bg-surface"
                  : "bg-surface-container-low";
              const stickyBg = isCurrentUser ? "bg-surface-container-low" : rowBg;

              return (
                <React.Fragment key={player.id}>
                  <tr className={rowBg}>
                    <td
                      className={`sticky left-0 z-10 ${stickyBg} px-3 py-2 shadow-[2px_0_4px_rgba(0,0,0,0.3)] ${isCurrentUser ? "border-l-2 border-secondary" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {isCurrentUser && player.avatarUrl ? (
                          <img
                            src={player.avatarUrl}
                            alt={player.displayName}
                            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${groupDotColor(player.group)}`}
                          />
                        )}
                        <span className={`font-label font-bold text-on-surface truncate max-w-[90px] ${isCurrentUser ? "text-sm text-secondary" : "text-xs"}`}>
                          {player.displayName}
                        </span>
                      </div>
                    </td>
                    {nineScores.map((score, i) => {
                      const holeNum = startHole + i + 1;
                      const isWolf = getWolfForHole(wolfOrder ?? null, holeNum) === player.id;
                      return (
                        <td
                          key={i}
                          className={`px-1 py-2 text-center font-label tabular-nums ${scoreColor(score, holePars[i])} ${
                            isCurrentUser ? "text-base font-extrabold" : "text-sm font-bold"
                          } ${isCurrentUser && onScoreTap ? "cursor-pointer active:bg-white/[0.15] rounded-md bg-white/[0.06] border border-white/[0.1]" : ""} ${isWolf ? "bg-yellow-500/10" : ""}`}
                          onClick={isCurrentUser && onScoreTap ? () => onScoreTap(player.id, startHole + i) : undefined}
                        >
                          {isWolf && <div className="text-[8px] leading-none">🐺</div>}
                          {score !== null ? score : "—"}
                        </td>
                      );
                    })}
                    <td
                      className={`px-2 py-2 text-center font-label tabular-nums ${
                        isCurrentUser ? "text-base font-extrabold" : "text-sm font-bold"
                      } ${
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
                  {pIdx + 1 === dividerAfter && pIdx + 1 < sortedPlayers.length && (
                    <tr>
                      <td colSpan={holePars.length + 2} className="py-0.5 bg-white/[0.08]" />
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* Wolf Pick Row — shows who the wolf picked per hole */}
            {wolfOrder && wolfPicks && onWolfPick && (() => {
              const groupPlayers = players.filter((p) => wolfOrder.includes(p.id));
              return (
                <tr className="bg-yellow-500/5 border-t border-yellow-500/20">
                  <td className="sticky left-0 z-10 bg-[#1a1a10] px-3 py-2 font-label text-[11px] font-bold uppercase tracking-widest text-yellow-500 shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
                    Wolf Pick
                  </td>
                  {holePars.map((_, i) => {
                    const holeNum = startHole + i + 1;
                    const wolfId = getWolfForHole(wolfOrder, holeNum);
                    if (!wolfId) return <td key={i} className="px-1 py-2 text-center text-on-surface-variant text-[10px]">—</td>;
                    const isWolf = currentPlayerId === wolfId;
                    const canPick = isWolf || isAdmin;
                    const pick = wolfPicks[holeNum];
                    const hasPick = pick !== undefined;
                    const partnerName = pick ? groupPlayers.find((p) => p.id === pick)?.displayName : null;

                    if (!canPick) {
                      return (
                        <td key={i} className="px-1 py-1 text-center">
                          {hasPick ? (
                            <span className="font-label text-[9px] font-bold text-yellow-500 leading-tight block">
                              {pick === null ? "Lone" : partnerName?.split(" ")[0] ?? "?"}
                            </span>
                          ) : (
                            <span className="text-on-surface-variant text-[10px]">—</span>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td key={i} className="px-0.5 py-1 text-center">
                        {!hasPick ? (
                          <button
                            onClick={() => {
                              // Show pick modal - cycle: first 3 non-wolf players, then lone wolf
                              const nonWolf = groupPlayers.filter((p) => p.id !== wolfId);
                              const options = [...nonWolf.map((p) => p.id), null];
                              onWolfPick(holeNum, options[0]);
                            }}
                            className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 rounded px-1 py-0.5 active:scale-95"
                          >
                            Pick
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              // Cycle through options: non-wolf players + lone wolf
                              const nonWolf = groupPlayers.filter((p) => p.id !== wolfId);
                              const options: (string | null)[] = [...nonWolf.map((p) => p.id), null];
                              const currentIdx = options.indexOf(pick);
                              const nextIdx = (currentIdx + 1) % options.length;
                              onWolfPick(holeNum, options[nextIdx]);
                            }}
                            className="font-label text-[9px] font-bold text-yellow-500 leading-tight block active:scale-95"
                          >
                            {pick === null ? "Lone" : partnerName?.split(" ")[0] ?? "?"}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center text-on-surface-variant text-[10px]" />
                </tr>
              );
            })()}

            {/* Wolf Points Row — shows points per hole */}
            {wolfStandings && wolfOrder && (
              <tr className="bg-yellow-500/5 border-t border-yellow-500/10">
                <td className="sticky left-0 z-10 bg-[#1a1a10] px-3 py-1.5 font-label text-[11px] font-bold uppercase tracking-widest text-yellow-500 shadow-[2px_0_4px_rgba(0,0,0,0.3)]">
                  Wolf Pts
                </td>
                {holePars.map((_, i) => {
                  const holeNum = startHole + i + 1;
                  const holeResult = wolfStandings.holes[holeNum - 1];
                  if (!holeResult || !currentPlayerId) {
                    return <td key={i} className="px-1 py-1.5 text-center text-on-surface-variant text-[10px]">—</td>;
                  }
                  const pts = holeResult.points[currentPlayerId] ?? 0;
                  return (
                    <td key={i} className={`px-1 py-1.5 text-center font-label text-xs font-bold tabular-nums ${wolfPointColor(pts)}`}>
                      {pts > 0 ? `+${pts}` : pts === 0 ? "·" : pts}
                    </td>
                  );
                })}
                <td className="px-2 py-1.5 text-center text-on-surface-variant text-[10px]" />
              </tr>
            )}
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
  currentPlayerId,
  wolfTotals,
}: {
  players: ScorecardPlayer[];
  coursePar: number;
  frontPar: number;
  backPar: number;
  currentPlayerId: string | null;
  wolfTotals?: Record<string, number> | null;
}) {
  const { sorted: sortedPlayers, dividerAfter } = sortPlayersByGroup(players, currentPlayerId);
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
              {wolfTotals && (
                <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-yellow-500">
                  Wolf
                </th>
              )}
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
              {wolfTotals && (
                <td className="px-2 py-1.5 text-center font-label text-xs text-on-surface-variant">
                  —
                </td>
              )}
            </tr>

            {/* Player Rows */}
            {sortedPlayers.map((player, pIdx) => {
              const isCurrentUser = player.id === currentPlayerId;
              const rowBg = isCurrentUser
                ? "bg-secondary/10"
                : pIdx % 2 === 0
                  ? "bg-surface"
                  : "bg-surface-container-low";
              const stickyBg = isCurrentUser ? "bg-surface-container-low" : rowBg;
              return (
                <React.Fragment key={player.id}>
                  <tr className={rowBg}>
                    <td
                      className={`sticky left-0 z-10 ${stickyBg} px-3 py-2 shadow-[2px_0_4px_rgba(0,0,0,0.3)] ${isCurrentUser ? "border-l-2 border-secondary" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${groupDotColor(player.group)}`}
                        />
                        <span className={`font-label font-bold text-on-surface truncate max-w-[90px] ${isCurrentUser ? "text-sm text-secondary" : "text-xs"}`}>
                          {player.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center font-label text-sm text-on-surface tabular-nums">
                      {player.handicap}
                    </td>
                    <td
                      className={`px-2 py-2 text-center font-label tabular-nums ${isCurrentUser ? "text-base font-extrabold" : "text-sm font-bold"} ${
                        player.front9 !== null
                          ? scoreColor(player.front9, frontPar)
                          : "text-on-surface-variant"
                      }`}
                    >
                      {player.front9 !== null ? player.front9 : "—"}
                    </td>
                    <td
                      className={`px-2 py-2 text-center font-label tabular-nums ${isCurrentUser ? "text-base font-extrabold" : "text-sm font-bold"} ${
                        player.back9 !== null
                          ? scoreColor(player.back9, backPar)
                          : "text-on-surface-variant"
                      }`}
                    >
                      {player.back9 !== null ? player.back9 : "—"}
                    </td>
                    <td
                      className={`px-2 py-2 text-center font-label tabular-nums ${isCurrentUser ? "text-base font-extrabold" : "text-sm font-bold"} ${
                        player.gross !== null
                          ? scoreColor(player.gross, coursePar)
                          : "text-on-surface-variant"
                      }`}
                    >
                      {player.gross !== null ? player.gross : "—"}
                    </td>
                    <td
                      className={`px-2 py-2 text-center font-headline tabular-nums ${isCurrentUser ? "text-base font-extrabold" : "text-sm font-bold"} ${netColor(player.net, coursePar)}`}
                    >
                      {player.net !== null ? player.net : "—"}
                    </td>
                    {wolfTotals && (() => {
                      const pts = wolfTotals[player.id] ?? 0;
                      return (
                        <td className={`px-2 py-2 text-center font-headline tabular-nums ${isCurrentUser ? "text-base font-extrabold" : "text-sm font-bold"} ${wolfPointColor(pts)}`}>
                          {pts > 0 ? `+${pts}` : pts}
                        </td>
                      );
                    })()}
                  </tr>
                  {pIdx + 1 === dividerAfter && pIdx + 1 < sortedPlayers.length && (
                    <tr>
                      <td colSpan={wolfTotals ? 7 : 6} className="py-0.5 bg-white/[0.08]" />
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function loadSettings() {
  if (typeof window === "undefined") return { defaultRound: "1", scorecardView: "card" };
  try {
    const raw = localStorage.getItem("boshaw-settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        defaultRound: parsed.defaultRound || "1",
        scorecardView: parsed.scorecardView || "card",
      };
    }
  } catch {}
  return { defaultRound: "1", scorecardView: "card" };
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
  const [editingHole, setEditingHole] = useState<{ playerId: string; holeIdx: number } | null>(null);
  const [courseImageHole, setCourseImageHole] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("scorecard");
  const [gameModeOpen, setGameModeOpen] = useState(false);
  const [wolfOrder, setWolfOrder] = useState<string[] | null>(null);
  const [wolfPicks, setWolfPicks] = useState<Record<number, string | null>>({});
  const isAdmin = session?.user?.email === "brettwfrancoeur@gmail.com";

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const settings = loadSettings();
    setView(settings.scorecardView as ViewMode);
    setRound(settings.defaultRound);
  }, []);

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

  // Fetch wolf order when wolf mode is active
  const currentUserGroup = data?.players.find((p) => p.id === currentUserId)?.group ?? 0;
  useEffect(() => {
    if (gameMode !== "wolf" || !currentUserGroup) {
      setWolfOrder(null);
      return;
    }
    fetch(`/api/wolf?round=${round}&group=${currentUserGroup}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.order) {
          setWolfOrder(d.order);
        } else if (isAdmin) {
          // Auto-create wolf order for admin
          fetch("/api/wolf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ round: Number(round), group: currentUserGroup }),
          })
            .then((res) => res.json())
            .then((d) => { if (d.order) setWolfOrder(d.order); })
            .catch(() => {});
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      fetch(`/api/wolf?round=${round}&group=${currentUserGroup}`)
        .then((res) => res.json())
        .then((d) => { if (d.order) setWolfOrder(d.order); })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [gameMode, round, currentUserGroup, isAdmin]);

  // Fetch wolf picks when wolf mode is active
  useEffect(() => {
    if (gameMode !== "wolf" || !currentUserGroup) {
      setWolfPicks({});
      return;
    }
    const fetchPicks = () =>
      fetch(`/api/wolf-picks?round=${round}&group=${currentUserGroup}`)
        .then((res) => res.json())
        .then((d) => { if (d.picks) setWolfPicks(d.picks); })
        .catch(() => {});
    fetchPicks();
    const interval = setInterval(fetchPicks, 5000);
    return () => clearInterval(interval);
  }, [gameMode, round, currentUserGroup]);

  function handleWolfPick(hole: number, partnerId: string | null) {
    // Optimistic update
    setWolfPicks((prev) => ({ ...prev, [hole]: partnerId }));
    fetch("/api/wolf-picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ round: Number(round), group: currentUserGroup, hole, partnerId }),
    }).catch(() => {});
  }

  // Calculate wolf standings from current data
  const wolfStandings = React.useMemo(() => {
    if (!wolfOrder || !data || gameMode !== "wolf") return null;
    const groupPlayers = data.players.filter((p) => wolfOrder.includes(p.id));
    if (groupPlayers.length !== 4) return null;
    const playerScoresPerHole: Record<string, (number | null)[]> = {};
    for (const p of groupPlayers) {
      playerScoresPerHole[p.id] = p.scores;
    }
    return calculateWolfStandings(wolfOrder, wolfPicks, playerScoresPerHole);
  }, [wolfOrder, wolfPicks, data, gameMode]);

  function shuffleWolf() {
    if (!currentUserGroup) return;
    fetch("/api/wolf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ round: Number(round), group: currentUserGroup }),
    })
      .then((res) => res.json())
      .then((d) => {
        if (d.order) {
          setWolfOrder(d.order);
          setWolfPicks({}); // Clear picks on reshuffle
        }
      })
      .catch(() => {});
  }

  const savingRef = React.useRef(false);
  React.useEffect(() => { savingRef.current = saving; }, [saving]);

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

    const interval = setInterval(() => {
      if (savingRef.current) return;
      fetch(`/api/scorecard?round=${round}`)
        .then((res) => res.json())
        .then((d) => setData(d))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [round]);

  // Handle score change from card view +/- buttons
  function handleScoreChange(playerIdx: number, holeIdx: number, delta: number) {
    if (!data) return;
    // playerIdx refers to the sorted array, so look up by sorted order
    const sortedCards = sortPlayersByGroup(data.players, currentUserId).sorted;
    const player = sortedCards[playerIdx];
    if (!player) return;
    const current = player.scores[holeIdx];
    // If no score yet, initialize to par then apply delta
    const base = current !== null ? current : data.course.holes[holeIdx];
    const next = Math.max(1, Math.min(15, base + delta));
    if (current !== null && next === current) return;

    // Optimistic update
    const newPlayers = data.players.map((p) => {
      if (p.id !== player.id) return p;
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
    const updatedPlayer = newPlayers.find((p) => p.id === player.id);
    if (!updatedPlayer) return;
    const allScores = updatedPlayer.scores as number[];
    setSaving(true);
    const isOtherPlayer = player.id !== currentUserId;
    if (isAdmin && isOtherPlayer) {
      fetch("/api/admin/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, round: Number(round), holes: allScores }),
      }).finally(() => setSaving(false));
    } else {
      fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round: Number(round), holes: allScores }),
      }).finally(() => setSaving(false));
    }
  }

  // Handle direct score entry from classic view number pad
  function handleDirectScoreChange(holeIdx: number, score: number) {
    if (!data) return;
    const playerIdx = data.players.findIndex((p) => p.id === currentUserId);
    if (playerIdx === -1) return;

    const newPlayers = data.players.map((p, pi) => {
      if (pi !== playerIdx) return p;
      const newScores = [...p.scores];
      newScores[holeIdx] = score;
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
      {/* Header + Game Mode Dropdown */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-headline text-3xl text-on-surface">
          {GAME_MODES.find((m) => m.value === gameMode)?.label}
        </h2>
        <div className="relative">
          <button
            onClick={() => setGameModeOpen(!gameModeOpen)}
            className="flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-secondary text-lg">
              {GAME_MODES.find((m) => m.value === gameMode)?.icon}
            </span>
            <span className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
              {GAME_MODES.find((m) => m.value === gameMode)?.label}
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">
              {gameModeOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
          {gameModeOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setGameModeOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-surface-container-high border border-white/[0.1] rounded-xl overflow-hidden shadow-lg min-w-[160px]">
                {GAME_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => { setGameMode(mode.value); setGameModeOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${
                      gameMode === mode.value
                        ? "bg-secondary/15 text-secondary"
                        : "text-on-surface hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{mode.icon}</span>
                    <span className="font-label text-sm font-bold">{mode.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Wolf Shuffle Button (admin only) */}
      {gameMode === "wolf" && isAdmin && wolfOrder && (
        <button
          onClick={shuffleWolf}
          className="mb-4 flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-secondary text-lg">shuffle</span>
          <span className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
            Shuffle Wolf Order
          </span>
        </button>
      )}

      {/* Round Tabs */}
      <div className="bg-white/[0.06] backdrop-blur-lg border border-white/[0.06] rounded-xl p-1 flex gap-1 mb-4">
        {ROUNDS.map((r) => (
          <button
            key={r.value}
            onClick={() => {
              setRound(r.value);
              setSelectedPlayer(0);
              try {
                const raw = localStorage.getItem("boshaw-settings");
                const s = raw ? JSON.parse(raw) : {};
                s.defaultRound = r.value;
                localStorage.setItem("boshaw-settings", JSON.stringify(s));
              } catch {}
            }}
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
              players={sortPlayersByGroup(data.players, currentUserId).sorted}
              holePars={data.course.holes}
              strokeIndices={COURSE_PARS[data.course.name as keyof typeof COURSE_PARS].strokeIndex}
              yardages={data.course.yardages}
              onYardageClick={data.course.name in COURSE_HOLE_IMAGES ? (hole: number) => setCourseImageHole(hole) : undefined}
              selectedPlayer={selectedPlayer}
              setSelectedPlayer={setSelectedPlayer}
              onScoreChange={handleScoreChange}
              currentPlayerId={currentUserId}
              wolfOrder={wolfOrder}
              isAdmin={isAdmin}
            />
          ) : (
            <>
              {/* Front 9 */}
              <NineHoleGrid
                label="Front 9"
                totalLabel="OUT"
                startHole={0}
                holePars={data.course.holes.slice(0, 9)}
                yardages={data.course.yardages?.slice(0, 9)}
                onYardageClick={data.course.name in COURSE_HOLE_IMAGES ? (hole: number) => setCourseImageHole(hole) : undefined}
                players={data.players}
                currentPlayerId={currentUserId}
                onScoreTap={(playerId, holeIdx) => setEditingHole({ playerId, holeIdx })}
                wolfOrder={wolfOrder}
                wolfPicks={gameMode === "wolf" ? wolfPicks : undefined}
                wolfStandings={wolfStandings}
                isAdmin={isAdmin}
                onWolfPick={gameMode === "wolf" ? handleWolfPick : undefined}
              />

              {/* Back 9 */}
              <NineHoleGrid
                label="Back 9"
                totalLabel="IN"
                startHole={9}
                holePars={data.course.holes.slice(9)}
                yardages={data.course.yardages?.slice(9)}
                onYardageClick={data.course.name in COURSE_HOLE_IMAGES ? (hole: number) => setCourseImageHole(hole) : undefined}
                players={data.players}
                currentPlayerId={currentUserId}
                onScoreTap={(playerId, holeIdx) => setEditingHole({ playerId, holeIdx })}
                wolfOrder={wolfOrder}
                wolfPicks={gameMode === "wolf" ? wolfPicks : undefined}
                wolfStandings={wolfStandings}
                isAdmin={isAdmin}
                onWolfPick={gameMode === "wolf" ? handleWolfPick : undefined}
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
                currentPlayerId={currentUserId}
                wolfTotals={wolfStandings?.totals}
              />

              {/* Wolf Standings */}
              {wolfStandings && wolfOrder && (
                <div className="mb-6">
                  <div className="bg-yellow-500/20 rounded-t-xl px-4 py-2">
                    <h3 className="font-headline text-yellow-500 text-center text-lg font-bold uppercase tracking-wider">
                      Wolf Standings
                    </h3>
                  </div>
                  <div className="bg-white/[0.06] backdrop-blur-xl border border-yellow-500/20 rounded-b-xl overflow-hidden">
                    {wolfOrder
                      .map((id) => ({
                        id,
                        name: data.players.find((p) => p.id === id)?.displayName ?? "?",
                        pts: wolfStandings.totals[id] ?? 0,
                      }))
                      .sort((a, b) => b.pts - a.pts)
                      .map((entry, i) => (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between px-4 py-3 ${
                            i > 0 ? "border-t border-white/[0.06]" : ""
                          } ${entry.id === currentUserId ? "bg-secondary/10" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-headline text-lg font-bold text-on-surface-variant w-6 text-center">
                              {i + 1}
                            </span>
                            <span className={`font-label text-sm font-bold ${entry.id === currentUserId ? "text-secondary" : "text-on-surface"}`}>
                              {entry.name}
                            </span>
                          </div>
                          <span className={`font-headline text-xl font-bold tabular-nums ${wolfPointColor(entry.pts)}`}>
                            {entry.pts > 0 ? `+${entry.pts}` : entry.pts}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Score Input Modal */}
      {editingHole && data && (
        <ScoreInput
          value={data.players.find((p) => p.id === editingHole.playerId)?.scores[editingHole.holeIdx] ?? null}
          holeIdx={editingHole.holeIdx}
          onSubmit={handleDirectScoreChange}
          onClose={() => setEditingHole(null)}
        />
      )}

      {/* Hole Image Modal */}
      {courseImageHole !== null && data && COURSE_HOLE_IMAGES[data.course.name] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setCourseImageHole(null)}
        >
          <div
            className="relative max-w-lg w-full bg-surface-container-high border border-white/[0.1] rounded-2xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <h3 className="font-headline text-lg font-bold text-on-surface">Hole {courseImageHole}</h3>
              <button
                onClick={() => setCourseImageHole(null)}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
              </button>
            </div>
            <img
              src={`${COURSE_HOLE_IMAGES[data.course.name]}/hole-${courseImageHole}.jpg`}
              alt={`${data.course.name} hole ${courseImageHole}`}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

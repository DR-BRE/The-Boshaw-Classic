"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { ScorecardData, ScorecardPlayer } from "@/lib/types/scorecard";
import { COURSE_PARS } from "@/lib/tournament";
import { getWolfForHole, calculateWolfStandings } from "@/lib/wolf";

type ViewMode = "card" | "classic";
type GameMode = "scorecard" | "wolf";

const COURSE_HOLE_IMAGES: Record<string, { path: string; ext: string }> = {
  "Echo Falls": { path: "/courses/echo-falls", ext: "jpg" },
  "Desert Canyon": { path: "/courses/desert-canyon", ext: "png" },
};

const GAME_MODES: { label: string; value: GameMode; icon: string }[] = [
  { label: "Scorecard", value: "scorecard", icon: "scoreboard" },
  { label: "Wolf", value: "wolf", icon: "pets" },
];

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
    <div className="flex items-center py-2 px-4 border-b border-outline-variant/40 bg-surface-container-low">
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
  wolfPickLabel,
  onPickWolf,
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
  wolfPickLabel?: string; // "Pick", "Lone", or partner first name
  onPickWolf?: () => void; // if provided, label renders as interactive button
}) {
  const diff = score !== null ? score - par : null;
  const showWolfPickStrip = isWolf && wolfPickLabel !== undefined;

  return (
    <div className={`border-b border-outline-variant/30 ${isWolf ? "bg-yellow-500/10" : ""}`}>
      <div className="flex items-center py-3 px-4">
        {/* Hole number */}
        <span className="w-8 font-display text-2xl text-on-surface-variant leading-none tabular-nums">
          {isWolf ? <img src="/wolf.png" alt="Wolf" className="w-5 h-5 rounded-full object-cover inline-block" /> : hole}
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
            className="w-10 text-center font-label text-sm text-primary tabular-nums active:scale-95 transition-transform"
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
              className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
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
              className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
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

      {/* Wolf pick strip — shown only when player is wolf on this hole */}
      {showWolfPickStrip && (
        <div className="flex items-center gap-2 px-4 pb-2 -mt-1">
          <span className="font-label text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest">
            Wolf Partner
          </span>
          {onPickWolf ? (
            <button
              onClick={onPickWolf}
              className="font-label text-[11px] font-bold text-yellow-500 bg-yellow-500/15 border border-yellow-500/30 rounded-full px-2.5 py-0.5 active:scale-95 transition-transform"
            >
              {wolfPickLabel}
            </button>
          ) : (
            <span className="font-label text-[11px] font-bold text-yellow-500/80">
              {wolfPickLabel}
            </span>
          )}
        </div>
      )}
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
  wolfPicks,
  onOpenWolfPick,
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
  wolfPicks?: Record<number, string | null>;
  onOpenWolfPick?: (hole: number) => void;
  isAdmin?: boolean;
}) {
  const player = players[selectedPlayer];
  const canEdit = player?.id === currentPlayerId || !!isAdmin;
  if (!player) return null;

  // Compute wolf pick UI for a given hole — label + optional click handler.
  // Returns {} when the pick strip shouldn't show (wrong mode, not the wolf, read-only + no pick yet).
  function wolfInfo(holeNum: number): { wolfPickLabel?: string; onPickWolf?: () => void } {
    if (!wolfPicks || !wolfOrder) return {};
    const wolfId = getWolfForHole(wolfOrder, holeNum);
    if (!wolfId || player.id !== wolfId) return {};
    const pick = wolfPicks[holeNum];
    const amWolf = currentPlayerId === wolfId;
    let label: string;
    if (pick === undefined) {
      if (!amWolf) return {}; // don't show "Pick" on another player's card
      label = "Pick";
    } else if (pick === null) {
      label = "Lone";
    } else {
      const partner = players.find((p) => p.id === pick);
      label = partner?.displayName.split(" ")[0] ?? "?";
    }
    return {
      wolfPickLabel: label,
      onPickWolf: amWolf && onOpenWolfPick ? () => onOpenWolfPick(holeNum) : undefined,
    };
  }

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
                  ? "bg-surface-bright border border-primary/40"
                  : "bg-surface-container border border-outline-variant/40"
              }`}
            >
              {p.avatarUrl ? (
                <img
                  src={p.avatarUrl}
                  alt={p.displayName}
                  className={`w-9 h-9 rounded-full object-cover border-2 ${
                    active ? "border-primary" : "border-outline-variant/50"
                  }`}
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {initials}
                </div>
              )}
              <span
                className={`font-label text-[9px] font-bold truncate max-w-[64px] ${
                  active ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {p.displayName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary Bar */}
      <div className="bg-surface-container-high backdrop-blur-xl border border-outline-variant/50 rounded-xl p-3 mb-4">
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
      <div className="bg-surface-container-high backdrop-blur-xl border border-outline-variant/50 rounded-2xl overflow-hidden mb-4">
        <div className="flex justify-between items-center bg-primary px-4 py-2">
          <h3 className="font-headline text-on-primary text-sm font-bold uppercase tracking-wider">
            Front 9
          </h3>
          <span className="font-headline text-on-primary text-sm font-bold">
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
            {...wolfInfo(i + 1)}
          />
        ))}
      </div>

      {/* Back 9 */}
      <div className="bg-surface-container-high backdrop-blur-xl border border-outline-variant/50 rounded-2xl overflow-hidden mb-4">
        <div className="flex justify-between items-center bg-primary px-4 py-2">
          <h3 className="font-headline text-on-primary text-sm font-bold uppercase tracking-wider">
            Back 9
          </h3>
          <span className="font-headline text-on-primary text-sm font-bold">
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
            {...wolfInfo(i + 10)}
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
        className="bg-surface-container-high border border-outline-variant/60 rounded-2xl p-5 w-48 text-center"
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
          className="w-full text-center font-headline text-3xl font-bold text-on-surface bg-surface-container-high border border-outline-variant/60 rounded-xl py-3 mb-3 outline-none focus:border-primary"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-wider rounded-xl active:scale-95 transition-transform"
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

function WolfPickModal({
  hole,
  wolfId,
  players,
  currentPick,
  onPick,
  onClose,
}: {
  hole: number;
  wolfId: string;
  players: ScorecardPlayer[];
  currentPick: string | null | undefined;
  onPick: (hole: number, partnerId: string | null) => void;
  onClose: () => void;
}) {
  const options = players.filter((p) => p.id !== wolfId);

  function select(partnerId: string | null) {
    onPick(hole, partnerId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-surface-container-high border border-yellow-500/20 rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-label text-xs text-yellow-500 uppercase tracking-widest">Hole {hole}</p>
            <h3 className="font-headline text-xl font-bold text-on-surface">Pick your partner</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {options.map((p) => {
            const selected = currentPick === p.id;
            return (
              <button
                key={p.id}
                onClick={() => select(p.id)}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all active:scale-[0.98] ${
                  selected
                    ? "bg-yellow-500/15 border-yellow-500/40"
                    : "bg-surface-container border-outline-variant/50 active:bg-surface-container-highest"
                }`}
              >
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
                    <span className="font-headline text-sm font-bold text-on-surface-variant">
                      {p.displayName.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="font-headline text-base font-bold text-on-surface">{p.displayName}</span>
                {selected && (
                  <span className="material-symbols-outlined text-yellow-500 ml-auto">check_circle</span>
                )}
              </button>
            );
          })}

          {/* Lone Wolf option */}
          <button
            onClick={() => select(null)}
            className={`flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all active:scale-[0.98] ${
              currentPick === null
                ? "bg-yellow-500/15 border-yellow-500/40"
                : "bg-surface-container border-outline-variant/50 active:bg-surface-container-highest"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <img src="/wolf.png" alt="Lone Wolf" className="w-6 h-6 rounded-full object-cover" />
            </div>
            <span className="font-headline text-base font-bold text-yellow-500">Lone Wolf</span>
            {currentPick === null && (
              <span className="material-symbols-outlined text-yellow-500 ml-auto">check_circle</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
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
  onOpenWolfPick,
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
  onOpenWolfPick?: (hole: number) => void;
}) {
  const parTotal = holePars.reduce((sum, p) => sum + p, 0);
  const ydsTotal = yardages?.reduce((sum, y) => sum + y, 0);

  const { sorted: sortedPlayers, dividerAfter } = sortPlayersByGroup(players, currentPlayerId);

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="bg-primary rounded-t-xl px-4 py-2">
        <h3 className="font-headline text-on-primary text-center text-lg font-bold uppercase tracking-wider">
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
                  className="px-1 py-2 text-center min-w-[40px]"
                >
                  <span className="font-display text-2xl text-on-surface-variant leading-none">
                    {startHole + i + 1}
                  </span>
                </th>
              ))}
              <th className="px-2 py-2 text-center font-label text-xs font-bold text-primary min-w-[44px]">
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
                      className="font-label text-xs text-primary tabular-nums active:scale-95 transition-transform"
                    >
                      {yds}
                    </button>
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center font-label text-xs font-bold text-primary tabular-nums">
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
                ? "bg-primary/10"
                : pIdx % 2 === 0
                  ? "bg-surface"
                  : "bg-surface-container-low";
              const stickyBg = isCurrentUser ? "bg-surface-container-low" : rowBg;

              return (
                <React.Fragment key={player.id}>
                  <tr className={rowBg}>
                    <td
                      className={`sticky left-0 z-10 ${stickyBg} px-3 py-2 shadow-[2px_0_4px_rgba(0,0,0,0.3)] ${isCurrentUser ? "border-l-2 border-primary" : ""}`}
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
                        <span className={`font-label font-bold text-on-surface truncate max-w-[90px] ${isCurrentUser ? "text-sm text-primary" : "text-xs"}`}>
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
                          } ${isCurrentUser && onScoreTap ? "cursor-pointer active:bg-surface-bright rounded-md bg-surface-container-high border border-outline-variant/60" : ""} ${isWolf ? "bg-yellow-500/10" : ""}`}
                          onClick={isCurrentUser && onScoreTap ? () => onScoreTap(player.id, startHole + i) : undefined}
                        >
                          {isWolf && <div className="leading-none"><img src="/wolf.png" alt="Wolf" className="w-3 h-3 rounded-full object-cover inline-block" /></div>}
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
                      <td colSpan={holePars.length + 2} className="py-0.5 bg-surface-container-highest" />
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* Wolf Pick Row — shows who the wolf picked per hole */}
            {wolfOrder && wolfPicks && onOpenWolfPick && (() => {
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
                    const pick = wolfPicks[holeNum];
                    const hasPick = pick !== undefined;
                    const partnerName = pick ? groupPlayers.find((p) => p.id === pick)?.displayName : null;

                    if (!isWolf) {
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
                        <button
                          onClick={() => onOpenWolfPick(holeNum)}
                          className={`text-[9px] font-bold text-yellow-500 rounded px-1 py-0.5 active:scale-95 ${
                            hasPick ? "" : "bg-yellow-500/10"
                          }`}
                        >
                          {!hasPick ? "Pick" : pick === null ? "Lone" : partnerName?.split(" ")[0] ?? "?"}
                        </button>
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
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-primary">
                HCP
              </th>
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-primary">
                Front
              </th>
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-primary">
                Back
              </th>
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-primary">
                Gross
              </th>
              <th className="px-2 py-2 text-center font-label text-[11px] font-bold uppercase tracking-widest text-primary">
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
                ? "bg-primary/10"
                : pIdx % 2 === 0
                  ? "bg-surface"
                  : "bg-surface-container-low";
              const stickyBg = isCurrentUser ? "bg-surface-container-low" : rowBg;
              return (
                <React.Fragment key={player.id}>
                  <tr className={rowBg}>
                    <td
                      className={`sticky left-0 z-10 ${stickyBg} px-3 py-2 shadow-[2px_0_4px_rgba(0,0,0,0.3)] ${isCurrentUser ? "border-l-2 border-primary" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${groupDotColor(player.group)}`}
                        />
                        <span className={`font-label font-bold text-on-surface truncate max-w-[90px] ${isCurrentUser ? "text-sm text-primary" : "text-xs"}`}>
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
                      <td colSpan={wolfTotals ? 7 : 6} className="py-0.5 bg-surface-container-highest" />
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
        gameMode: parsed.gameMode || "scorecard",
      };
    }
  } catch {}
  return { defaultRound: "1", scorecardView: "card", gameMode: "scorecard" };
}

export default function ScorecardPage() {
  const { data: session } = useSession();
  const initSettings = loadSettings();
  const [view, setView] = useState<ViewMode>(initSettings.scorecardView as ViewMode);
  const [round, setRound] = useState(initSettings.defaultRound);
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [editingHole, setEditingHole] = useState<{ playerId: string; holeIdx: number } | null>(null);
  const [courseImageHole, setCourseImageHole] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(initSettings.gameMode as GameMode);
  const [gameModeOpen, setGameModeOpen] = useState(false);
  const [wolfOrder, setWolfOrder] = useState<string[] | null>(null);
  const [wolfPicks, setWolfPicks] = useState<Record<number, string | null>>({});
  const [wolfPickModal, setWolfPickModal] = useState<number | null>(null);
  // Holes the user dismissed without picking this session — don't re-pop the
  // modal for them on subsequent focus events. Cleared on reshuffle.
  const [dismissedWolfHoles, setDismissedWolfHoles] = useState<Set<number>>(new Set());
  const isAdmin = session?.user?.email === "brettwfrancoeur@gmail.com";

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
          setDismissedWolfHoles(new Set()); // Reset dismiss state on reshuffle
          // Shuffle is an explicit action — if the user is hole-1 wolf, pop now.
          if (d.order[0] === currentUserId) setWolfPickModal(1);
        }
      })
      .catch(() => {});
  }

  // Earliest hole (1–16) where the current user is wolf, hasn't picked, hasn't
  // dismissed this session, and either it's hole 1 or they've scored the prior
  // hole. This drives the focus-based modal trigger below — matching the real
  // flow of scoring the last hole, driving to the next tee, then opening the
  // phone to pick.
  const pendingWolfPickHole = React.useMemo(() => {
    if (gameMode !== "wolf" || !wolfOrder || !currentUserId || !data) return null;
    const me = data.players.find((p) => p.id === currentUserId);
    if (!me) return null;
    for (let h = 1; h <= 16; h++) {
      if (getWolfForHole(wolfOrder, h) !== currentUserId) continue;
      if (wolfPicks[h] !== undefined) continue;
      if (dismissedWolfHoles.has(h)) continue;
      if (h === 1 || me.scores[h - 2] !== null) return h;
    }
    return null;
  }, [gameMode, wolfOrder, currentUserId, wolfPicks, data, dismissedWolfHoles]);

  // Open the pick modal when the user *returns* to the app (focus or tab
  // becomes visible) with a pending pick. Also fires once on initial page
  // load. Does NOT fire on mid-session state changes (e.g. scoring the prior
  // hole) — those are handled passively via the yellow pill in card view.
  const didInitialPickCheckRef = React.useRef(false);
  useEffect(() => {
    if (pendingWolfPickHole === null) return;
    // One-time pop on initial mount when the page loads with a pending pick.
    if (!didInitialPickCheckRef.current) {
      didInitialPickCheckRef.current = true;
      if (typeof document === "undefined" || document.visibilityState === "visible") {
        setWolfPickModal((cur) => (cur === null ? pendingWolfPickHole : cur));
      }
    }
    // Re-entry triggers: only pop on real focus/visibility events, not on
    // every deps change (which would fire the moment scoring makes a new
    // hole pending — exactly what we're trying to avoid).
    const onReturn = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      setWolfPickModal((cur) => (cur === null ? pendingWolfPickHole : cur));
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onReturn);
    }
    window.addEventListener("focus", onReturn);
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onReturn);
      }
      window.removeEventListener("focus", onReturn);
    };
  }, [pendingWolfPickHole]);

  const savingRef = React.useRef(false);

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
    // If no score yet, first press sets to par; after that, +/- adjusts normally
    const next = current !== null
      ? Math.max(1, Math.min(15, current + delta))
      : data.course.holes[holeIdx];
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
    savingRef.current = true;
    const isOtherPlayer = player.id !== currentUserId;
    if (isAdmin && isOtherPlayer) {
      fetch("/api/admin/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, round: Number(round), holes: allScores }),
      }).finally(() => { setTimeout(() => { savingRef.current = false; }, 500); });
    } else {
      fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ round: Number(round), holes: allScores }),
      }).finally(() => { setTimeout(() => { savingRef.current = false; }, 500); });
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
    savingRef.current = true;
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ round: Number(round), holes: allScores }),
    }).finally(() => { setTimeout(() => { savingRef.current = false; }, 500); });
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
      <div className="flex items-center justify-between mb-5 pr-12">
        <h2 className="font-headline text-3xl text-on-surface">
          {GAME_MODES.find((m) => m.value === gameMode)?.label}
        </h2>
        <div className="relative">
          <button
            onClick={() => setGameModeOpen(!gameModeOpen)}
            className="flex items-center gap-1 bg-surface-container-high border border-outline-variant/50 rounded-lg px-2 py-1.5 active:scale-95 transition-transform"
          >
            {gameMode === "wolf" ? (
              <img src="/wolf.png" alt="Wolf" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-primary text-base">
                {GAME_MODES.find((m) => m.value === gameMode)?.icon}
              </span>
            )}
            <span className="font-label text-[11px] font-bold text-on-surface uppercase tracking-wider">
              {GAME_MODES.find((m) => m.value === gameMode)?.label}
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">
              {gameModeOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
          {gameModeOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setGameModeOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-surface-container-high border border-outline-variant/60 rounded-xl overflow-hidden shadow-lg min-w-[160px]">
                {GAME_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => { setGameMode(mode.value); setGameModeOpen(false); try { const raw = localStorage.getItem("boshaw-settings"); const s = raw ? JSON.parse(raw) : {}; s.gameMode = mode.value; localStorage.setItem("boshaw-settings", JSON.stringify(s)); } catch {} }}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${
                      gameMode === mode.value
                        ? "bg-primary/15 text-primary"
                        : "text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    {mode.value === "wolf" ? (
                      <img src="/wolf.png" alt="Wolf" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-lg">{mode.icon}</span>
                    )}
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
          className="mb-4 flex items-center gap-2 bg-surface-container-high border border-outline-variant/50 rounded-xl px-4 py-2.5 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-primary text-lg">shuffle</span>
          <span className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
            Shuffle Wolf Order
          </span>
        </button>
      )}

      {/* Round Tabs */}
      <div className="flex bg-surface-container rounded-xl p-1 mb-4">
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
        <div className="space-y-4">
          <div className="bg-surface-container-high animate-pulse rounded-xl h-10" />
          <div className="bg-surface-container-high animate-pulse rounded-xl h-64" />
          <div className="bg-surface-container-high animate-pulse rounded-xl h-64" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !data && (
        <div className="bg-surface-container-high backdrop-blur-xl border border-outline-variant/50 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-2">
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
            <div className="flex bg-surface-container rounded-xl p-1">
              <button
                onClick={() => {
                  setView("card");
                  try {
                    const raw = localStorage.getItem("boshaw-settings");
                    const s = raw ? JSON.parse(raw) : {};
                    s.scorecardView = "card";
                    localStorage.setItem("boshaw-settings", JSON.stringify(s));
                  } catch {}
                }}
                className={[
                  "flex-1 px-3 py-1.5 rounded-lg text-xs font-label font-medium uppercase tracking-wider transition-all active:scale-95",
                  view === "card"
                    ? "bg-surface-container-high text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                ].join(" ")}
              >
                Card
              </button>
              <button
                onClick={() => {
                  setView("classic");
                  try {
                    const raw = localStorage.getItem("boshaw-settings");
                    const s = raw ? JSON.parse(raw) : {};
                    s.scorecardView = "classic";
                    localStorage.setItem("boshaw-settings", JSON.stringify(s));
                  } catch {}
                }}
                className={[
                  "flex-1 px-3 py-1.5 rounded-lg text-xs font-label font-medium uppercase tracking-wider transition-all active:scale-95",
                  view === "classic"
                    ? "bg-surface-container-high text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                ].join(" ")}
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
              wolfPicks={gameMode === "wolf" ? wolfPicks : undefined}
              onOpenWolfPick={gameMode === "wolf" ? (hole: number) => setWolfPickModal(hole) : undefined}
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
                onOpenWolfPick={gameMode === "wolf" ? (hole: number) => setWolfPickModal(hole) : undefined}
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
                onOpenWolfPick={gameMode === "wolf" ? (hole: number) => setWolfPickModal(hole) : undefined}
              />

              {/* Summary */}
              <div className="bg-primary rounded-t-xl px-4 py-2 mt-2">
                <h3 className="font-headline text-on-primary text-center text-lg font-bold uppercase tracking-wider">
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
                  <div className="bg-surface-container-high backdrop-blur-xl border border-yellow-500/20 rounded-b-xl overflow-hidden">
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
                            i > 0 ? "border-t border-outline-variant/40" : ""
                          } ${entry.id === currentUserId ? "bg-primary/10" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-headline text-lg font-bold text-on-surface-variant w-6 text-center">
                              {i + 1}
                            </span>
                            <span className={`font-label text-sm font-bold ${entry.id === currentUserId ? "text-primary" : "text-on-surface"}`}>
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

      {/* Wolf Pick Modal */}
      {wolfPickModal !== null && wolfOrder && data && (() => {
        const wolfId = getWolfForHole(wolfOrder, wolfPickModal);
        if (!wolfId) return null;
        const groupPlayers = data.players.filter((p) => wolfOrder.includes(p.id));
        return (
          <WolfPickModal
            hole={wolfPickModal}
            wolfId={wolfId}
            players={groupPlayers}
            currentPick={wolfPicks[wolfPickModal]}
            onPick={handleWolfPick}
            onClose={() => {
              const dismissed = wolfPickModal;
              setWolfPickModal(null);
              // If they closed without picking, don't re-pop on next focus.
              // Picking auto-closes too, but then wolfPicks[hole] is set so
              // pendingWolfPickHole won't match it anyway.
              if (dismissed !== null && wolfPicks[dismissed] === undefined) {
                setDismissedWolfHoles((prev) => {
                  const next = new Set(prev);
                  next.add(dismissed);
                  return next;
                });
              }
            }}
          />
        );
      })()}

      {/* Hole Image Modal */}
      {courseImageHole !== null && data && COURSE_HOLE_IMAGES[data.course.name] && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm px-3 pt-4 pb-3"
          onClick={() => setCourseImageHole(null)}
        >
          <div
            className="relative max-w-xs w-full h-[92vh] h-[92dvh] flex flex-col bg-surface-container-high border border-outline-variant/60 rounded-2xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-outline-variant/40 shrink-0">
              <h3 className="font-headline text-sm font-bold text-on-surface">Hole {courseImageHole}</h3>
              <button
                onClick={() => setCourseImageHole(null)}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-surface-bright hover:bg-surface-bright flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-on-surface text-base">close</span>
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2">
              <img
                src={`${COURSE_HOLE_IMAGES[data.course.name].path}/hole-${courseImageHole}.${COURSE_HOLE_IMAGES[data.course.name].ext}`}
                alt={`${data.course.name} hole ${courseImageHole}`}
                className="w-full h-auto block mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Settings = {
  defaultRound: "1" | "2";
  scorecardView: "card" | "classic";
  notifyLeaderboard: boolean;
  notifyScores: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  defaultRound: "1",
  scorecardView: "card",
  notifyLeaderboard: true,
  notifyScores: true,
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("boshaw-settings");
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Settings) {
  localStorage.setItem("boshaw-settings", JSON.stringify(settings));
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? "bg-secondary" : "bg-white/[0.1]"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SegmentedToggle({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="bg-white/[0.06] border border-white/[0.06] rounded-xl p-1 flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 rounded-lg font-label text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
            value === opt.value
              ? "bg-white/[0.1] text-primary"
              : "text-on-surface-variant"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}


const ADMIN_EMAIL = "brettwfrancoeur@gmail.com";
const GROUP_LABELS = ["Unassigned", "Group 1", "Group 2"] as const;

type PlayerGroup = { id: string; displayName: string; group: number };

type ScoreRecord = {
  id: string;
  round: number;
  course: string;
  hole1: number; hole2: number; hole3: number; hole4: number;
  hole5: number; hole6: number; hole7: number; hole8: number;
  hole9: number; hole10: number; hole11: number; hole12: number;
  hole13: number; hole14: number; hole15: number; hole16: number;
  hole17: number; hole18: number;
  totalStrokes: number;
  toPar: number;
};

type PlayerWithScores = {
  id: string;
  displayName: string;
  scores: ScoreRecord[];
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const [players, setPlayers] = useState<PlayerGroup[]>([]);
  const [groupsDirty, setGroupsDirty] = useState(false);
  const [groupsSaving, setGroupsSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Add player
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newHandicap, setNewHandicap] = useState("0");
  const [addingPlayer, setAddingPlayer] = useState(false);

  // Admin score editing
  const [allPlayers, setAllPlayers] = useState<PlayerWithScores[]>([]);
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
  const [editRound, setEditRound] = useState(1);
  const [editHoles, setEditHoles] = useState<number[]>(Array(18).fill(4));
  const [scoreSaving, setScoreSaving] = useState(false);
  const [scoreMsg, setScoreMsg] = useState("");

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/groups")
        .then((res) => res.json())
        .then((data) => {
          if (data.players) setPlayers(data.players);
        })
        .catch(() => {});
      fetch("/api/admin/scores")
        .then((res) => res.json())
        .then((data) => {
          if (data.players) setAllPlayers(data.players);
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  function loadScoreForEdit(playerId: string, round: number) {
    const player = allPlayers.find((p) => p.id === playerId);
    const score = player?.scores.find((s) => s.round === round);
    if (score) {
      setEditHoles([
        score.hole1, score.hole2, score.hole3, score.hole4,
        score.hole5, score.hole6, score.hole7, score.hole8,
        score.hole9, score.hole10, score.hole11, score.hole12,
        score.hole13, score.hole14, score.hole15, score.hole16,
        score.hole17, score.hole18,
      ]);
    } else {
      // Default to par for the course
      const pars = round === 1
        ? [4,4,3,4,5,4,3,5,4,4,3,4,4,5,4,4,3,5]
        : [4,4,5,3,4,4,5,3,4,5,4,4,4,3,5,3,4,4];
      setEditHoles([...pars]);
    }
    setEditPlayerId(playerId);
    setEditRound(round);
    setScoreMsg("");
  }

  async function saveAdminScore() {
    if (!editPlayerId) return;
    setScoreSaving(true);
    setScoreMsg("");
    try {
      const res = await fetch("/api/admin/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: editPlayerId, round: editRound, holes: editHoles }),
      });
      if (!res.ok) throw new Error("Failed to save");
      // Refresh data
      const refreshRes = await fetch("/api/admin/scores");
      const data = await refreshRes.json();
      if (data.players) setAllPlayers(data.players);
      setScoreMsg("Saved!");
    } catch {
      setScoreMsg("Error saving score");
    }
    setScoreSaving(false);
  }

  async function deleteAdminScore(playerId: string, round: number) {
    try {
      await fetch(`/api/admin/scores?playerId=${playerId}&round=${round}`, { method: "DELETE" });
      const res = await fetch("/api/admin/scores");
      const data = await res.json();
      if (data.players) setAllPlayers(data.players);
      if (editPlayerId === playerId && editRound === round) {
        setEditPlayerId(null);
      }
    } catch {}
  }

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  if (!mounted) {
    return (
      <div className="px-4 py-6">
        <h2 className="font-headline text-3xl text-on-surface mb-6">
          Settings
        </h2>
        <div className="bg-white/[0.06] rounded-xl h-48" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24">
      <h2 className="font-headline text-3xl text-on-surface mb-6">Settings</h2>

      {/* Preferences */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-5">
        <h3 className="font-headline text-lg text-on-surface mb-4">
          Preferences
        </h3>

        <div className="space-y-5">
          {/* Default Round */}
          <div>
            <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">
              Default Round
            </label>
            <SegmentedToggle
              options={[
                { label: "Round 1", value: "1" },
                { label: "Round 2", value: "2" },
              ]}
              value={settings.defaultRound}
              onChange={(v) => update({ defaultRound: v as "1" | "2" })}
            />
            <p className="text-[11px] text-on-surface-variant mt-1.5">
              Which round to show by default on scorecard and scoring pages
            </p>
          </div>

          {/* Scorecard View */}
          <div>
            <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-2">
              Scorecard View
            </label>
            <SegmentedToggle
              options={[
                { label: "Card", value: "card" },
                { label: "Classic", value: "classic" },
              ]}
              value={settings.scorecardView}
              onChange={(v) =>
                update({ scorecardView: v as "card" | "classic" })
              }
            />
            <p className="text-[11px] text-on-surface-variant mt-1.5">
              Your preferred scorecard layout
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-5">
        <h3 className="font-headline text-lg text-on-surface mb-4">
          Notifications
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label text-sm font-bold text-on-surface">
                Leaderboard Updates
              </p>
              <p className="text-[11px] text-on-surface-variant">
                When someone takes the lead
              </p>
            </div>
            <Toggle
              enabled={settings.notifyLeaderboard}
              onChange={(v) => update({ notifyLeaderboard: v })}
            />
          </div>

          <div className="border-t border-white/[0.06]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-label text-sm font-bold text-on-surface">
                Score Submissions
              </p>
              <p className="text-[11px] text-on-surface-variant">
                When a player submits their round
              </p>
            </div>
            <Toggle
              enabled={settings.notifyScores}
              onChange={(v) => update({ notifyScores: v })}
            />
          </div>
        </div>
      </div>

      {/* Add Player (admin only) */}
      {isAdmin && (
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg text-on-surface">Add Player</h3>
            <button
              onClick={() => setShowAddPlayer(!showAddPlayer)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary text-on-secondary active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-lg">
                {showAddPlayer ? "close" : "person_add"}
              </span>
            </button>
          </div>

          {showAddPlayer && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="First name"
                  value={newFirst}
                  onChange={(e) => setNewFirst(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={newLast}
                  onChange={(e) => setNewLast(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
                />
              </div>
              <input
                type="number"
                placeholder="Handicap"
                value={newHandicap}
                onChange={(e) => setNewHandicap(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.06] text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
              />
              <button
                onClick={async () => {
                  if (!newFirst.trim() || !newLast.trim()) return;
                  setAddingPlayer(true);
                  try {
                    await fetch("/api/groups", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        firstName: newFirst.trim(),
                        lastName: newLast.trim(),
                        handicap: Number(newHandicap) || 0,
                        group: 0,
                      }),
                    });
                    // Refresh player lists
                    const [groupsRes, scoresRes] = await Promise.all([
                      fetch("/api/groups"),
                      fetch("/api/admin/scores"),
                    ]);
                    const groupsData = await groupsRes.json();
                    const scoresData = await scoresRes.json();
                    if (groupsData.players) setPlayers(groupsData.players);
                    if (scoresData.players) setAllPlayers(scoresData.players);
                    setNewFirst("");
                    setNewLast("");
                    setNewHandicap("0");
                    setShowAddPlayer(false);
                  } catch {}
                  setAddingPlayer(false);
                }}
                disabled={addingPlayer || !newFirst.trim() || !newLast.trim()}
                className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                {addingPlayer ? "Adding…" : "Add Player"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manage Groups (admin only) */}
      {isAdmin && players.length > 0 && (
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-5">
          <h3 className="font-headline text-lg text-on-surface mb-4">
            Manage Groups
          </h3>
          <p className="text-[11px] text-on-surface-variant mb-4">
            Tap a player to cycle: Unassigned → Group 1 → Group 2
          </p>

          <div className="space-y-2">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextGroup = (p.group + 1) % 3;
                    if (nextGroup > 0) {
                      const count = players.filter(
                        (pl) => pl.id !== p.id && pl.group === nextGroup
                      ).length;
                      if (count >= 4) return;
                    }
                    setPlayers((prev) =>
                      prev.map((pl) =>
                        pl.id === p.id
                          ? { ...pl, group: nextGroup }
                          : pl
                      )
                    );
                    setGroupsDirty(true);
                  }}
                  className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a2e28] border border-white/[0.06] active:scale-[0.98] transition-transform"
                >
                  <span className="font-label text-sm font-bold text-on-surface">
                    {p.displayName}
                  </span>
                  <span
                    className={`font-label text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      p.group === 1
                        ? "bg-secondary/20 text-secondary"
                        : p.group === 2
                        ? "bg-primary/20 text-primary"
                        : "bg-white/[0.06] text-on-surface-variant"
                    }`}
                  >
                    {GROUP_LABELS[p.group]}
                  </span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await fetch(`/api/groups?playerId=${p.id}`, { method: "DELETE" });
                      setPlayers((prev) => prev.filter((pl) => pl.id !== p.id));
                    } catch {}
                  }}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-red-500/15 text-red-400 active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            ))}
          </div>

          {groupsDirty && (
            <button
              onClick={async () => {
                setGroupsSaving(true);
                try {
                  await fetch("/api/groups", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      assignments: players.map((p) => ({
                        playerId: p.id,
                        group: p.group,
                      })),
                    }),
                  });
                  setGroupsDirty(false);
                } catch {}
                setGroupsSaving(false);
              }}
              disabled={groupsSaving}
              className="mt-4 w-full py-3 rounded-xl bg-secondary text-on-secondary font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              {groupsSaving ? "Saving…" : "Save Groups"}
            </button>
          )}
        </div>
      )}

      {/* Edit Scores (admin only) */}
      {isAdmin && allPlayers.length > 0 && (
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-5">
          <h3 className="font-headline text-lg text-on-surface mb-4">
            Edit Scores
          </h3>
          <p className="text-[11px] text-on-surface-variant mb-4">
            Select a player and round to view or edit their scorecard.
          </p>

          {/* Player list with score summary */}
          <div className="space-y-2 mb-4">
            {allPlayers.map((p) => (
              <div key={p.id} className="rounded-xl bg-[#1a2e28] border border-white/[0.06] p-3">
                <p className="font-label text-sm font-bold text-on-surface mb-2">{p.displayName}</p>
                <div className="flex gap-2">
                  {[1, 2].map((r) => {
                    const score = p.scores.find((s) => s.round === r);
                    const isActive = editPlayerId === p.id && editRound === r;
                    return (
                      <button
                        key={r}
                        onClick={() => loadScoreForEdit(p.id, r)}
                        className={`flex-1 py-2 rounded-lg font-label text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                          isActive
                            ? "bg-secondary text-on-secondary"
                            : score
                            ? "bg-primary/20 text-primary"
                            : "bg-white/[0.06] text-on-surface-variant"
                        }`}
                      >
                        R{r}: {score ? `${score.totalStrokes} (${score.toPar > 0 ? "+" : ""}${score.toPar})` : "No score"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Score editor */}
          {editPlayerId && (
            <div className="rounded-xl bg-[#0d1f1a] border border-white/[0.08] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-label text-sm font-bold text-on-surface">
                  {allPlayers.find((p) => p.id === editPlayerId)?.displayName} — Round {editRound}
                </p>
                <button
                  onClick={() => setEditPlayerId(null)}
                  className="material-symbols-outlined text-on-surface-variant text-lg"
                >
                  close
                </button>
              </div>

              {/* Hole grid */}
              <div className="grid grid-cols-9 gap-1 mb-3">
                {/* Front 9 */}
                {editHoles.slice(0, 9).map((val, i) => (
                  <div key={i} className="text-center">
                    <p className="font-label text-[9px] text-on-surface-variant mb-1">{i + 1}</p>
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => {
                          const next = [...editHoles];
                          next[i]++;
                          setEditHoles(next);
                          setScoreMsg("");
                        }}
                        className="w-full text-[10px] text-on-surface-variant active:scale-90"
                      >
                        +
                      </button>
                      <span className="font-label text-xs font-bold text-on-surface tabular-nums">{val}</span>
                      <button
                        onClick={() => {
                          const next = [...editHoles];
                          if (next[i] > 1) next[i]--;
                          setEditHoles(next);
                          setScoreMsg("");
                        }}
                        className="w-full text-[10px] text-on-surface-variant active:scale-90"
                      >
                        −
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-9 gap-1 mb-3">
                {/* Back 9 */}
                {editHoles.slice(9, 18).map((val, i) => (
                  <div key={i + 9} className="text-center">
                    <p className="font-label text-[9px] text-on-surface-variant mb-1">{i + 10}</p>
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => {
                          const next = [...editHoles];
                          next[i + 9]++;
                          setEditHoles(next);
                          setScoreMsg("");
                        }}
                        className="w-full text-[10px] text-on-surface-variant active:scale-90"
                      >
                        +
                      </button>
                      <span className="font-label text-xs font-bold text-on-surface tabular-nums">{val}</span>
                      <button
                        onClick={() => {
                          const next = [...editHoles];
                          if (next[i + 9] > 1) next[i + 9]--;
                          setEditHoles(next);
                          setScoreMsg("");
                        }}
                        className="w-full text-[10px] text-on-surface-variant active:scale-90"
                      >
                        −
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3">
                <p className="font-label text-xs text-on-surface-variant">
                  Total: <span className="text-on-surface font-bold">{editHoles.reduce((a, b) => a + b, 0)}</span>
                </p>
                {scoreMsg && (
                  <p className={`font-label text-xs font-bold ${scoreMsg === "Saved!" ? "text-primary" : "text-on-error-container"}`}>
                    {scoreMsg}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveAdminScore}
                  disabled={scoreSaving}
                  className="flex-1 py-3 rounded-xl bg-secondary text-on-secondary font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
                >
                  {scoreSaving ? "Saving…" : "Save Score"}
                </button>
                {allPlayers.find((p) => p.id === editPlayerId)?.scores.find((s) => s.round === editRound) && (
                  <button
                    onClick={() => deleteAdminScore(editPlayerId, editRound)}
                    className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clear Players (admin only) */}
      {isAdmin && (
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-5">
          <h3 className="font-headline text-lg text-on-surface mb-2">
            Clear Players
          </h3>
          <p className="text-[11px] text-on-surface-variant mb-4">
            Delete all player accounts and scores except yours. Use this before going live.
          </p>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform"
            >
              Clear All Players
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-3 rounded-xl bg-white/[0.06] text-on-surface-variant font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setClearing(true);
                  try {
                    await fetch("/api/groups", { method: "DELETE" });
                    setPlayers((prev) =>
                      prev.filter(
                        (p) =>
                          players.find(
                            (pl) => pl.id === p.id && pl.displayName === session?.user?.name
                          ) !== undefined
                      )
                    );
                    // Re-fetch to get accurate state
                    const res = await fetch("/api/groups");
                    const data = await res.json();
                    if (data.players) setPlayers(data.players);
                  } catch {}
                  setClearing(false);
                  setConfirmClear(false);
                }}
                disabled={clearing}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                {clearing ? "Clearing…" : "Confirm"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* About */}
      <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
        <h3 className="font-headline text-lg text-on-surface mb-4">About</h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-label text-sm text-on-surface-variant">
              Tournament
            </span>
            <span className="font-label text-sm text-on-surface">
              The Boshaw Classic
            </span>
          </div>
          <div className="border-t border-white/[0.06]" />
          <div className="flex justify-between items-center">
            <span className="font-label text-sm text-on-surface-variant">
              Location
            </span>
            <span className="font-label text-sm text-on-surface">
              Lake Chelan, WA
            </span>
          </div>
          <div className="border-t border-white/[0.06]" />
          <div className="flex justify-between items-center">
            <span className="font-label text-sm text-on-surface-variant">
              Date
            </span>
            <span className="font-label text-sm text-on-surface">
              May 2026
            </span>
          </div>
          <div className="border-t border-white/[0.06]" />
          <div className="flex justify-between items-center">
            <span className="font-label text-sm text-on-surface-variant">
              Version
            </span>
            <span className="font-label text-sm text-on-surface">v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

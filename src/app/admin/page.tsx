"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { COURSE_PARS } from "@/lib/tournament";

const ADMIN_EMAIL = "brettwfrancoeur@gmail.com";

type Score = {
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

type Player = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  handicap: number;
  group: number;
  avatarUrl: string | null;
  scores: Score[];
};

function getHoles(s: Score): number[] {
  return [s.hole1, s.hole2, s.hole3, s.hole4, s.hole5, s.hole6, s.hole7, s.hole8, s.hole9,
    s.hole10, s.hole11, s.hole12, s.hole13, s.hole14, s.hole15, s.hole16, s.hole17, s.hole18];
}

const ROUND_COURSES: Record<number, string> = {
  1: "Bear Mountain Ranch",
  2: "Desert Canyon",
  3: "Echo Falls",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing player info
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editHandicap, setEditHandicap] = useState("");
  const [savingPlayer, setSavingPlayer] = useState(false);

  // Editing scores
  const [editingScore, setEditingScore] = useState<{ playerId: string; round: number } | null>(null);
  const [editHoles, setEditHoles] = useState<number[]>(Array(18).fill(4));
  const [savingScore, setSavingScore] = useState(false);
  const [scoreMsg, setScoreMsg] = useState("");

  // Add player
  const [showAdd, setShowAdd] = useState(false);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newHandicap, setNewHandicap] = useState("0");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchPlayers();
  }, [isAdmin]);

  async function fetchPlayers() {
    try {
      const res = await fetch("/api/admin/scores");
      const data = await res.json();
      if (data.players) setPlayers(data.players);
    } catch {}
    setLoading(false);
  }

  function startEditPlayer(p: Player) {
    setEditingPlayer(p.id);
    setEditFirst(p.firstName);
    setEditLast(p.lastName);
    setEditHandicap(String(p.handicap));
    setEditingScore(null);
  }

  async function savePlayer() {
    if (!editingPlayer) return;
    setSavingPlayer(true);
    try {
      await fetch("/api/admin/scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: editingPlayer,
          firstName: editFirst.trim(),
          lastName: editLast.trim(),
          handicap: Number(editHandicap) || 0,
        }),
      });
      await fetchPlayers();
      setEditingPlayer(null);
    } catch {}
    setSavingPlayer(false);
  }

  async function deletePlayer(id: string) {
    try {
      await fetch(`/api/groups?playerId=${id}`, { method: "DELETE" });
      await fetchPlayers();
      if (editingPlayer === id) setEditingPlayer(null);
      if (editingScore?.playerId === id) setEditingScore(null);
    } catch {}
  }

  function startEditScore(playerId: string, round: number) {
    const player = players.find((p) => p.id === playerId);
    const score = player?.scores.find((s) => s.round === round);
    if (score) {
      setEditHoles(getHoles(score));
    } else {
      const courseName = ROUND_COURSES[round] as keyof typeof COURSE_PARS;
      setEditHoles([...COURSE_PARS[courseName].holes]);
    }
    setEditingScore({ playerId, round });
    setEditingPlayer(null);
    setScoreMsg("");
  }

  async function saveScore() {
    if (!editingScore) return;
    setSavingScore(true);
    setScoreMsg("");
    try {
      const res = await fetch("/api/admin/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: editingScore.playerId,
          round: editingScore.round,
          holes: editHoles,
        }),
      });
      if (!res.ok) throw new Error();
      await fetchPlayers();
      setScoreMsg("Saved!");
    } catch {
      setScoreMsg("Error");
    }
    setSavingScore(false);
  }

  async function deleteScore(playerId: string, round: number) {
    try {
      await fetch(`/api/admin/scores?playerId=${playerId}&round=${round}`, { method: "DELETE" });
      await fetchPlayers();
      if (editingScore?.playerId === playerId && editingScore?.round === round) {
        setEditingScore(null);
      }
    } catch {}
  }

  async function addPlayer() {
    if (!newFirst.trim() || !newLast.trim()) return;
    setAdding(true);
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
      await fetchPlayers();
      setNewFirst("");
      setNewLast("");
      setNewHandicap("0");
      setShowAdd(false);
    } catch {}
    setAdding(false);
  }

  if (status === "loading" || loading) {
    return (
      <div className="px-4 py-6">
        <h2 className="font-headline text-3xl text-on-surface mb-6">Admin</h2>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/[0.06] animate-pulse rounded-xl h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="px-4 py-6">
        <h2 className="font-headline text-3xl text-on-surface mb-4">Admin</h2>
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-on-error-container text-3xl mb-2">lock</span>
          <p className="font-headline text-lg text-on-surface">Access Denied</p>
          <p className="text-xs text-on-surface-variant mt-1">Admin access only.</p>
        </div>
      </div>
    );
  }

  const courseName = editingScore
    ? ROUND_COURSES[editingScore.round] as keyof typeof COURSE_PARS
    : null;
  const holePars = courseName ? [...COURSE_PARS[courseName].holes] : [];

  return (
    <div className="px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-secondary mb-1">
            The Boshaw Classic
          </p>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Admin</h2>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-on-secondary active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-xl">
            {showAdd ? "close" : "person_add"}
          </span>
        </button>
      </div>

      {/* Add Player */}
      {showAdd && (
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 mb-5">
          <h3 className="font-headline text-lg text-on-surface mb-3">Add Player</h3>
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
              onClick={addPlayer}
              disabled={adding || !newFirst.trim() || !newLast.trim()}
              className="w-full py-3 rounded-xl bg-secondary text-on-secondary font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add Player"}
            </button>
          </div>
        </div>
      )}

      {/* Player List */}
      <div className="space-y-3">
        {players.map((p) => {
          const isEditing = editingPlayer === p.id;
          const isEditingScoreForPlayer = editingScore?.playerId === p.id;

          return (
            <div
              key={p.id}
              className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden"
            >
              {/* Player Header */}
              <div className="flex items-center gap-3 p-4">
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt={p.displayName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>
                      face
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-label font-bold text-on-surface truncate">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    HCP {p.handicap} · Group {p.group || "—"}
                  </p>
                </div>

                <button
                  onClick={() => isEditing ? setEditingPlayer(null) : startEditPlayer(p)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">
                    {isEditing ? "close" : "edit"}
                  </span>
                </button>
                <button
                  onClick={() => deletePlayer(p.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500/15 active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
                </button>
              </div>

              {/* Edit Player Info */}
              {isEditing && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editFirst}
                      onChange={(e) => setEditFirst(e.target.value)}
                      placeholder="First name"
                      className="flex-1 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.06] text-on-surface font-label text-sm outline-none focus:border-primary/50"
                    />
                    <input
                      type="text"
                      value={editLast}
                      onChange={(e) => setEditLast(e.target.value)}
                      placeholder="Last name"
                      className="flex-1 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.06] text-on-surface font-label text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                  <input
                    type="number"
                    value={editHandicap}
                    onChange={(e) => setEditHandicap(e.target.value)}
                    placeholder="Handicap"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.06] text-on-surface font-label text-sm outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={savePlayer}
                    disabled={savingPlayer}
                    className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
                  >
                    {savingPlayer ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}

              {/* Round Score Buttons */}
              <div className="flex gap-2 px-4 pb-4">
                {[1, 2, 3].map((r) => {
                  const score = p.scores.find((s) => s.round === r);
                  const active = isEditingScoreForPlayer && editingScore?.round === r;
                  return (
                    <button
                      key={r}
                      onClick={() => active ? setEditingScore(null) : startEditScore(p.id, r)}
                      className={`flex-1 py-2.5 rounded-xl font-label text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                        active
                          ? "bg-secondary text-on-secondary"
                          : score
                          ? "bg-primary/20 text-primary border border-primary/20"
                          : "bg-white/[0.06] text-on-surface-variant border border-white/[0.06]"
                      }`}
                    >
                      R{r}: {score ? `${score.totalStrokes} (${score.toPar > 0 ? "+" : ""}${score.toPar})` : "No score"}
                    </button>
                  );
                })}
              </div>

              {/* Score Editor */}
              {isEditingScoreForPlayer && editingScore && (
                <div className="border-t border-white/[0.06] p-4">
                  <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">
                    Round {editingScore.round} — {ROUND_COURSES[editingScore.round]}
                  </p>

                  {/* Front 9 */}
                  <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Front 9</p>
                  <div className="grid grid-cols-9 gap-1 mb-3">
                    {editHoles.slice(0, 9).map((val, i) => {
                      const par = holePars[i];
                      const color = val < par ? "text-primary" : val > par ? "text-on-error-container" : "text-on-surface";
                      return (
                        <div key={i} className="text-center">
                          <p className="font-label text-[9px] text-on-surface-variant">{i + 1}</p>
                          <p className="font-label text-[8px] text-on-surface-variant/50">p{par}</p>
                          <button
                            onClick={() => { const n = [...editHoles]; n[i]++; setEditHoles(n); setScoreMsg(""); }}
                            className="w-full text-xs text-on-surface-variant active:scale-90 py-0.5"
                          >+</button>
                          <span className={`font-label text-sm font-bold tabular-nums ${color}`}>{val}</span>
                          <button
                            onClick={() => { const n = [...editHoles]; if (n[i] > 1) n[i]--; setEditHoles(n); setScoreMsg(""); }}
                            className="w-full text-xs text-on-surface-variant active:scale-90 py-0.5"
                          >−</button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Back 9 */}
                  <p className="font-label text-[10px] text-secondary uppercase tracking-widest mb-1">Back 9</p>
                  <div className="grid grid-cols-9 gap-1 mb-3">
                    {editHoles.slice(9, 18).map((val, i) => {
                      const par = holePars[i + 9];
                      const color = val < par ? "text-primary" : val > par ? "text-on-error-container" : "text-on-surface";
                      return (
                        <div key={i + 9} className="text-center">
                          <p className="font-label text-[9px] text-on-surface-variant">{i + 10}</p>
                          <p className="font-label text-[8px] text-on-surface-variant/50">p{par}</p>
                          <button
                            onClick={() => { const n = [...editHoles]; n[i + 9]++; setEditHoles(n); setScoreMsg(""); }}
                            className="w-full text-xs text-on-surface-variant active:scale-90 py-0.5"
                          >+</button>
                          <span className={`font-label text-sm font-bold tabular-nums ${color}`}>{val}</span>
                          <button
                            onClick={() => { const n = [...editHoles]; if (n[i + 9] > 1) n[i + 9]--; setEditHoles(n); setScoreMsg(""); }}
                            className="w-full text-xs text-on-surface-variant active:scale-90 py-0.5"
                          >−</button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total + Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-label text-xs text-on-surface-variant">
                      Total: <span className="text-on-surface font-bold tabular-nums">{editHoles.reduce((a, b) => a + b, 0)}</span>
                      <span className="ml-2">
                        ({(() => { const t = editHoles.reduce((a, b) => a + b, 0) - holePars.reduce((a, b) => a + b, 0); return t === 0 ? "E" : t > 0 ? `+${t}` : t; })()})
                      </span>
                    </p>
                    {scoreMsg && (
                      <p className={`font-label text-xs font-bold ${scoreMsg === "Saved!" ? "text-primary" : "text-on-error-container"}`}>
                        {scoreMsg}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveScore}
                      disabled={savingScore}
                      className="flex-1 py-2.5 rounded-xl bg-secondary text-on-secondary font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
                    >
                      {savingScore ? "Saving…" : "Save Score"}
                    </button>
                    {players.find((pl) => pl.id === editingScore.playerId)?.scores.find((s) => s.round === editingScore.round) && (
                      <button
                        onClick={() => deleteScore(editingScore.playerId, editingScore.round)}
                        className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Settings = {
  theme: "dark" | "light";
  notifyLeaderboard: boolean;
  notifyScores: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
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


const ADMIN_EMAIL = "brettwfrancoeur@gmail.com";
const GROUP_LABELS = ["Unassigned", "Group 1", "Group 2"] as const;

type PlayerGroup = { id: string; displayName: string; group: number };

type PlayerWithScores = {
  id: string;
  displayName: string;
  scores: unknown[];
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

  // For refreshing after add player
  const [allPlayers, setAllPlayers] = useState<PlayerWithScores[]>([]);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    applyTheme(s.theme);
    setMounted(true);
  }, []);

  function applyTheme(theme: "dark" | "light") {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }

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



  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    if (patch.theme) applyTheme(patch.theme);
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
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-label text-sm font-bold text-on-surface">
                Light Mode
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Switch between dark and light theme
              </p>
            </div>
            <Toggle
              enabled={settings.theme === "light"}
              onChange={(v) => update({ theme: v ? "light" : "dark" })}
            />
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
                  className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container border border-white/[0.06] active:scale-[0.98] transition-transform"
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

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui";

type Settings = {
  theme: "dark" | "light";
  notifyLeaderboard: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  notifyLeaderboard: true,
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
  label,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      style={{
        position: "relative",
        display: "inline-block",
        width: 44,
        height: 24,
        borderRadius: 9999,
        backgroundColor: enabled ? "#C9A227" : "rgba(255,255,255,0.1)",
        transition: "background-color 0.2s",
        flexShrink: 0,
        border: "none",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: enabled ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          transition: "left 0.2s",
          display: "block",
        }}
      />
    </button>
  );
}


const ADMIN_EMAIL = "brettwfrancoeur@gmail.com";
const GROUP_LABELS = ["Unassigned", "Group 1", "Group 2"] as const;

type PlayerGroup = { id: string; displayName: string; group: number };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const [players, setPlayers] = useState<PlayerGroup[]>([]);
  const [groupsDirty, setGroupsDirty] = useState(false);
  const [groupsSaving, setGroupsSaving] = useState(false);

  // Add player
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newHandicap, setNewHandicap] = useState("0");
  const [addingPlayer, setAddingPlayer] = useState(false);

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
    }
  }, [isAdmin]);



  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    if (patch.theme) {
      if (patch.theme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  }

  if (!mounted) {
    return (
      <div className="px-4 py-6">
        <h2 className="font-display text-4xl text-on-surface mb-6 leading-none">SETTINGS</h2>
        <div className="bg-surface-container-high rounded-xl h-48" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h2 className="font-display text-4xl text-on-surface mb-6 leading-none">SETTINGS</h2>

      {/* Preferences */}
      <div className="bg-surface-container-high backdrop-blur-xl border border-outline-variant/50 rounded-2xl p-5 mb-5">
        <h3 className="font-headline text-lg text-on-surface mb-4">
          Preferences
        </h3>

        <div className="space-y-5">
          {/* Theme */}
          <div className="flex items-center justify-between py-3 border-b border-outline-variant/30">
            <div>
              <p className="text-sm font-medium text-on-surface">
                Light Mode
              </p>
              <p className="text-xs text-on-surface-variant">
                Switch between dark and light theme
              </p>
            </div>
            <Toggle
              enabled={settings.theme === "light"}
              onChange={(v) => update({ theme: v ? "light" : "dark" })}
              label="Light Mode"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface-container-high backdrop-blur-xl border border-outline-variant/50 rounded-2xl p-5 mb-5">
        <h3 className="font-headline text-lg text-on-surface mb-4">
          Notifications
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-outline-variant/30">
            <div>
              <p className="text-sm font-medium text-on-surface">
                Leaderboard Updates
              </p>
              <p className="text-xs text-on-surface-variant">
                When someone takes the lead or shoots under par
              </p>
            </div>
            <Toggle
              enabled={settings.notifyLeaderboard}
              onChange={(v) => update({ notifyLeaderboard: v })}
              label="Leaderboard Updates"
            />
          </div>
        </div>
      </div>

      {/* Add Player (admin only) */}
      {isAdmin && (
        <div className="bg-surface-container-high backdrop-blur-xl border border-outline-variant/50 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg text-on-surface">Add Player</h3>
            <button
              onClick={() => setShowAddPlayer(!showAddPlayer)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-on-primary active:scale-90 transition-transform"
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
                  className="flex-1 px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={newLast}
                  onChange={(e) => setNewLast(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
                />
              </div>
              <input
                type="number"
                placeholder="Handicap"
                value={newHandicap}
                onChange={(e) => setNewHandicap(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
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
                    const groupsRes = await fetch("/api/groups");
                    const groupsData = await groupsRes.json();
                    if (groupsData.players) setPlayers(groupsData.players);
                    setNewFirst("");
                    setNewLast("");
                    setNewHandicap("0");
                    setShowAddPlayer(false);
                  } catch {}
                  setAddingPlayer(false);
                }}
                disabled={addingPlayer || !newFirst.trim() || !newLast.trim()}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                {addingPlayer ? "Adding…" : "Add Player"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manage Groups (admin only) */}
      {isAdmin && players.length > 0 && (
        <div className="bg-surface-container-high backdrop-blur-xl border border-outline-variant/50 rounded-2xl p-5 mb-5">
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
                  className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 active:scale-[0.98] transition-transform"
                >
                  <span className="font-label text-sm font-bold text-on-surface">
                    {p.displayName}
                  </span>
                  <span
                    className={`font-label text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      p.group === 1
                        ? "bg-tertiary/20 text-tertiary"
                        : p.group === 2
                        ? "bg-primary/20 text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
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
              className="mt-4 w-full py-3 rounded-xl bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              {groupsSaving ? "Saving…" : "Save Groups"}
            </button>
          )}
        </div>
      )}

      {/* About */}
      <Card className="p-5">
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
          <div className="border-t border-outline-variant/30" />
          <div className="flex justify-between items-center">
            <span className="font-label text-sm text-on-surface-variant">
              Location
            </span>
            <span className="font-label text-sm text-on-surface">
              Lake Chelan, WA
            </span>
          </div>
          <div className="border-t border-outline-variant/30" />
          <div className="flex justify-between items-center">
            <span className="font-label text-sm text-on-surface-variant">
              Date
            </span>
            <span className="font-label text-sm text-on-surface">
              May 2026
            </span>
          </div>
          <div className="border-t border-outline-variant/30" />
          <div className="flex justify-between items-center">
            <span className="font-label text-sm text-on-surface-variant">
              Version
            </span>
            <span className="font-label text-sm text-on-surface">v1.0</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

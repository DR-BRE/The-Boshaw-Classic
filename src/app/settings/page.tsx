"use client";

import React, { useEffect, useRef, useState } from "react";
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

function SwipeableRow({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const direction = useRef<"none" | "horizontal" | "vertical">("none");

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = 0;
    swiping.current = false;
    direction.current = "none";
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Lock direction on first significant movement
    if (direction.current === "none" && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      direction.current = Math.abs(dy) > Math.abs(dx) ? "vertical" : "horizontal";
    }

    // Only allow horizontal swipe if locked to horizontal
    if (direction.current !== "horizontal") return;

    if (dx < -30) swiping.current = true;
    const offset = Math.min(0, Math.max(-80, dx));
    currentX.current = offset;
    if (rowRef.current) {
      // Disable transition during drag for responsiveness
      rowRef.current.style.transition = "none";
      rowRef.current.style.transform = `translateX(${offset}px)`;
    }
  }

  function handleTouchEnd() {
    if (direction.current === "horizontal") {
      // Re-enable transition for snap animation
      if (rowRef.current) rowRef.current.style.transition = "";
      if (currentX.current < -40) {
        if (rowRef.current) rowRef.current.style.transform = "translateX(-80px)";
      } else {
        if (rowRef.current) rowRef.current.style.transform = "translateX(0)";
      }
    }
    direction.current = "none";
  }

  function handleClick(e: React.MouseEvent) {
    if (swiping.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
        <button
          onClick={onDelete}
          className="w-full h-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-white text-xl">
            delete
          </span>
        </button>
      </div>
      <div
        ref={rowRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClickCapture={handleClick}
        className="relative z-10 transition-transform duration-150"
      >
        {children}
      </div>
    </div>
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
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

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
              <SwipeableRow
                key={p.id}
                onDelete={async () => {
                  try {
                    await fetch(`/api/groups?playerId=${p.id}`, { method: "DELETE" });
                    setPlayers((prev) => prev.filter((pl) => pl.id !== p.id));
                  } catch {}
                }}
              >
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
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a2e28] border border-white/[0.06] active:scale-[0.98] transition-transform"
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
              </SwipeableRow>
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

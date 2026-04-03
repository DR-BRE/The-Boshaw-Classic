"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

type Player = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  handicap: number;
  group: number;
  avatarUrl: string | null;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handicap, setHandicap] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.player) {
          setPlayer(data.player);
          setFirstName(data.player.firstName);
          setLastName(data.player.lastName);
          setDisplayName(data.player.displayName);
          setHandicap(String(data.player.handicap));
          setAvatarUrl(data.player.avatarUrl);
        } else if (session?.user) {
          // Pre-fill from GitHub profile
          const parts = (session.user.name || "").split(" ");
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
          setDisplayName(
            parts[0] ? `${parts[0]} ${(parts[1] || "")[0] || ""}.`.trim() : ""
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, session]);

  // Only auto-generate display name when creating a new profile
  // (not when editing an existing one)
  useEffect(() => {
    if (!player && firstName && lastName) {
      setDisplayName(`${firstName} ${lastName[0]}.`);
    }
  }, [firstName, lastName, player]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setAvatarUrl(data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          firstName,
          lastName,
          handicap: Number(handicap) || 0,
        }),
      });
      const data = await res.json();
      if (data.player) {
        setPlayer(data.player);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  // Not signed in
  if (status === "unauthenticated") {
    return (
      <div className="px-4 py-6">
        <h2 className="font-headline text-3xl text-on-surface mb-2">Profile</h2>
        <div className="bg-surface-container-high rounded-xl p-8 text-center mt-4">
          <span
            className="material-symbols-outlined text-secondary text-4xl mb-3"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            person
          </span>
          <p className="font-headline text-lg text-on-surface mb-1">
            Sign in to join the tournament
          </p>
          <p className="text-xs text-on-surface-variant mb-6">
            Set up your player profile and track your scores
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-label font-bold uppercase tracking-widest text-sm px-6 py-3 rounded-xl active:scale-95 transition-transform"
          >
            Sign In with Google
            <span className="material-symbols-outlined text-lg">login</span>
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading || status === "loading") {
    return (
      <div className="px-4 py-6">
        <h2 className="font-headline text-3xl text-on-surface mb-6">Profile</h2>
        <div className="space-y-4">
          <div className="bg-surface-container-high animate-pulse rounded-xl h-24" />
          <div className="bg-surface-container-high animate-pulse rounded-xl h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h2 className="font-headline text-3xl text-on-surface mb-6">Profile</h2>

      {/* User Card */}
      <div className="bg-surface-container-high rounded-xl p-4 flex items-center gap-4 mb-6">
        <label className="relative cursor-pointer group flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          {avatarUrl || session?.user?.image ? (
            <img
              src={avatarUrl || session?.user?.image || ""}
              alt="Avatar"
              className="w-14 h-14 rounded-full border-2 border-secondary/30 object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center border-2 border-secondary/30">
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white text-lg">
              {uploading ? "hourglass_empty" : "photo_camera"}
            </span>
          </div>
        </label>
        <div className="flex-1 min-w-0">
          <p className="font-label font-bold text-on-surface truncate">
            {player?.displayName || session?.user?.name || "Player"}
          </p>
          <p className="text-xs text-on-surface-variant truncate">
            {session?.user?.email}
          </p>
          {player && (
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-label text-primary uppercase tracking-widest bg-primary-container px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
              Registered
            </span>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-surface-container rounded-xl p-5">
        <h3 className="font-headline text-lg text-on-surface mb-4">
          {player ? "Edit Profile" : "Set Up Profile"}
        </h3>

        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1.5">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Ryan"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Boshaw"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Ryan B."
            />
            <p className="text-[11px] text-on-surface-variant mt-1">
              Shown on the leaderboard
            </p>
          </div>

          {/* Handicap */}
          <div>
            <label className="block font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1.5">
              Handicap
            </label>
            <input
              type="number"
              min="0"
              max="54"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg px-4 py-3 text-on-surface font-body text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="18"
            />
            <p className="text-[11px] text-on-surface-variant mt-1">
              Your USGA handicap index (0–54)
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !firstName || !lastName || !displayName}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary font-label font-bold uppercase tracking-widest text-sm py-4 rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
        >
          {saving ? "Saving..." : saved ? "Saved!" : player ? "Update Profile" : "Create Profile"}
          <span className="material-symbols-outlined text-lg">
            {saved ? "check" : "save"}
          </span>
        </button>
      </div>

      {/* Stats Card (if registered) */}
      {player && player.group > 0 && (
        <div className="bg-surface-container-high rounded-xl p-4 mt-6">
          <h3 className="font-headline text-lg text-on-surface mb-3">Tournament Info</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container rounded-lg p-3 text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Group</p>
              <p className="font-headline text-xl text-secondary">{player.group}</p>
            </div>
            <div className="bg-surface-container rounded-lg p-3 text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Handicap</p>
              <p className="font-headline text-xl text-on-surface">{player.handicap}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out */}
      <button
        onClick={() => signOut()}
        className="mt-6 w-full flex items-center justify-center gap-2 border border-outline-variant/40 text-on-surface-variant font-label font-bold uppercase tracking-widest text-xs py-3 rounded-xl hover:bg-surface-container-high/50 transition-colors"
      >
        Sign Out
        <span className="material-symbols-outlined text-base">logout</span>
      </button>
    </div>
  );
}

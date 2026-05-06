"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, Input, Button, Card } from "@/components/ui";

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
      // If no player profile exists yet, create one first
      if (!player) {
        const profileRes = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: displayName || firstName || "Player",
            firstName: firstName || "",
            lastName: lastName || "",
            handicap: Number(handicap) || 0,
          }),
        });
        const profileData = await profileRes.json();
        if (profileData.player) {
          setPlayer(profileData.player);
        }
      }

      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setAvatarUrl(data.url);
      } else if (data.error) {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected
      e.target.value = "";
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
        <h2 className="font-display text-4xl text-on-surface mb-6 leading-none">PROFILE</h2>
        <Card className="text-center py-10">
          <span
            className="material-symbols-outlined text-primary text-4xl mb-3 block"
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
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-label font-semibold uppercase tracking-widest text-sm px-6 py-3 rounded-lg active:scale-95 transition-transform"
          >
            Sign In with Google
            <span className="material-symbols-outlined text-lg">login</span>
          </Link>
        </Card>
      </div>
    );
  }

  // Loading
  if (loading || status === "loading") {
    return (
      <div className="px-4 py-6">
        <h2 className="font-display text-4xl text-on-surface mb-6 leading-none">PROFILE</h2>
        <div className="space-y-4">
          <div className="bg-surface-container-high animate-pulse rounded-xl h-24" />
          <div className="bg-surface-container-high animate-pulse rounded-xl h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h2 className="font-display text-4xl text-on-surface mb-6 leading-none">PROFILE</h2>

      {/* User Card with Avatar */}
      <Card className="flex items-center gap-4 mb-6">
        <label className="relative cursor-pointer group flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            aria-label="Upload avatar photo"
            className="hidden"
          />
          <Avatar
            src={avatarUrl || session?.user?.image || null}
            name={player?.displayName || session?.user?.name || "Player"}
            size="lg"
          />
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-60 sm:opacity-0 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white text-lg">
              {uploading ? "hourglass_empty" : "photo_camera"}
            </span>
          </div>
        </label>
        <div className="flex-1 min-w-0">
          <p className="font-headline text-lg font-semibold text-on-surface truncate">
            {player?.displayName || session?.user?.name || "Player"}
          </p>
          <p className="text-xs text-on-surface-variant truncate">
            {session?.user?.email}
          </p>
          {player && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-label font-semibold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
              Registered
            </span>
          )}
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="mb-6">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">
          {player ? "Edit Profile" : "Set Up Profile"}
        </h3>

        <div className="space-y-4">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ryan"
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Boshaw"
          />
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ryan B."
            hint="Shown on the leaderboard"
          />
          <Input
            label="Handicap"
            type="number"
            min={0}
            max={54}
            value={handicap}
            onChange={(e) => setHandicap(e.target.value)}
            placeholder="18"
            hint="Your USGA handicap index (0–54)"
          />
        </div>

        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!firstName || !lastName || !displayName}
          className="mt-6 w-full"
        >
          {saved ? "Saved!" : player ? "Update Profile" : "Create Profile"}
        </Button>
      </Card>

      {/* Stats Card (if registered and assigned group) */}
      {player && player.group > 0 && (
        <Card className="mb-6">
          <h3 className="font-headline text-lg font-semibold text-on-surface mb-3">Tournament Info</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-high border border-outline-variant/40 rounded-lg p-3 text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Group</p>
              <p className="font-display text-3xl text-primary leading-none">{player.group}</p>
            </div>
            <div className="bg-surface-container-high border border-outline-variant/40 rounded-lg p-3 text-center">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Handicap</p>
              <p className="font-display text-3xl text-on-surface leading-none tabular-nums">{player.handicap}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Sign Out */}
      <Button variant="ghost" onClick={() => signOut()} className="w-full">
        Sign Out
        <span className="material-symbols-outlined text-base">logout</span>
      </Button>
    </div>
  );
}

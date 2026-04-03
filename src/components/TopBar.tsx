"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function TopBar() {
  const { data: session, status } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.player?.avatarUrl) {
          setAvatarUrl(data.player.avatarUrl);
        }
      })
      .catch(() => {});
  }, [status]);

  const profileImage = avatarUrl || session?.user?.image;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-4 py-2 bg-white/[0.06] backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center">
        <Link href="/" className="material-symbols-outlined text-primary hover:bg-surface-variant/60 transition-colors p-1.5 rounded-lg cursor-pointer text-xl">
          menu
        </Link>
      </div>
      <div className="flex items-center">
        {profileImage ? (
          <Link href="/profile">
            <img
              src={profileImage}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-outline-variant/30 object-cover"
            />
          </Link>
        ) : session ? (
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-primary text-lg">
              person
            </span>
          </Link>
        ) : (
          <Link
            href="/api/auth/signin"
            className="text-sm font-label text-secondary uppercase tracking-widest"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

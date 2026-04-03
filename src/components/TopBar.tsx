"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#051612] flex justify-between items-center w-full px-6 py-4">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary hover:bg-surface-variant/60 transition-colors p-2 rounded-lg cursor-pointer">
          menu
        </span>
        <Link href="/" className="font-headline text-secondary text-2xl tracking-widest uppercase">
          BACHELOR BASH
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {session?.user?.image ? (
          <Link href="/profile">
            <img
              src={session.user.image}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-outline-variant/30 object-cover"
            />
          </Link>
        ) : session ? (
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-primary text-xl">
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

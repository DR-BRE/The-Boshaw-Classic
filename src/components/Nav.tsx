"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/scoring", label: "Score" },
  { href: "/feed", label: "Trash Talk" },
  { href: "/players", label: "Players" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-green-950 border-b border-gold/20">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-gold font-bold text-lg tracking-wide">
          TBC
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-gold"
                  : "text-green-300/70 hover:text-green-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <div className="flex items-center gap-3">
              <Link href="/profile">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-8 h-8 rounded-full border border-gold/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-800 border border-gold/30" />
                )}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-green-300/70 hover:text-green-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="text-sm font-medium text-gold hover:text-gold/80"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-green-300 p-2"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gold/10 bg-green-950 px-4 py-3 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-base font-medium ${
                pathname === link.href
                  ? "text-gold"
                  : "text-green-300/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-base font-medium text-green-300/70"
              >
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="block py-2 text-base font-medium text-green-300/70"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/api/auth/signin"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-base font-medium text-gold"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

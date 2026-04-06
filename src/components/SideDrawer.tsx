"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

const ADMIN_EMAIL = "brettwfrancoeur@gmail.com";

const navLinks = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard" },
  { href: "/scorecard", icon: "scoreboard", label: "Scorecard" },
  { href: "/trip", icon: "luggage", label: "Trip Info" },
  { href: "/profile", icon: "person", label: "Profile" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

const adminLink = { href: "/admin", icon: "admin_panel_settings", label: "Admin" };

export default function SideDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#0d1f1a] border-r border-white/[0.06] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-white/[0.06]">
          <h2 className="font-headline text-lg text-on-surface">
            The Boshaw Classic
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-lg">
              close
            </span>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {[...navLinks, ...(session?.user?.email === ADMIN_EMAIL ? [adminLink] : [])].map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-white/[0.1] text-secondary"
                    : "text-on-surface-variant hover:bg-white/[0.06] hover:text-on-surface"
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {link.icon}
                </span>
                <span className="font-label text-sm font-bold">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          {session?.user ? (
            <div>
              <p className="text-xs text-on-surface-variant truncate mb-2">
                {session.user.email}
              </p>
              <button
                onClick={() => {
                  onClose();
                  signOut();
                }}
                className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface text-xs font-label font-bold uppercase tracking-widest transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  logout
                </span>
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              onClick={onClose}
              className="flex items-center gap-2 text-secondary font-label font-bold text-xs uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

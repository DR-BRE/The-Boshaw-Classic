"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import SideDrawer from "@/components/SideDrawer";
import BottomTabs from "@/components/BottomTabs";
import ScoreToastProvider from "@/components/ScoreToastProvider";
import NotificationBell from "@/components/NotificationBell";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const hideAvatar = ["/leaderboard", "/scorecard", "/trip"].includes(pathname);
  const hideHamburger = ["/leaderboard", "/scorecard", "/trip"].includes(pathname);

  // Apply saved theme on mount (after React hydration)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("boshaw-settings");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.theme === "light") {
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
        }
      }
    } catch {}
  }, []);

  // Re-fetch avatar on every page navigation (catches profile updates)
  useEffect(() => {
    if (session?.user) {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.player?.avatarUrl) {
            setAvatarUrl(data.player.avatarUrl);
          }
        })
        .catch(() => {});
    }
  }, [session, pathname]);

  return (
    <>
      {/* Hamburger Button */}
      {!hideHamburger && (
        <button
          onClick={() => setDrawerOpen(true)}
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
          className="fixed left-3 z-40 w-9 h-9 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-on-surface text-lg">
            menu
          </span>
        </button>
      )}

      {/* Notification Bell */}
      <div
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
        className={`fixed z-40 ${hideAvatar ? "right-3" : "right-14"}`}
      >
        <NotificationBell />
      </div>

      {/* Profile Avatar Button */}
      {!hideAvatar && (
        <Link
          href="/profile"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
          className="fixed right-3 z-40 w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.06] flex items-center justify-center active:scale-90 transition-transform overflow-hidden"
        >
          {avatarUrl || session?.user?.image ? (
            <img
              src={avatarUrl || session?.user?.image || ""}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined text-on-surface text-xl">
              person
            </span>
          )}
        </Link>
      )}

      {/* Side Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main Content */}
      <main
        style={hideHamburger ? { paddingTop: "env(safe-area-inset-top, 0px)" } : undefined}
        className={`${hideHamburger ? "pt-0" : "pt-6"} pb-32`}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomTabs />

      {/* App-wide score toasts (birdies / eagles / aces) */}
      <ScoreToastProvider />
    </>
  );
}

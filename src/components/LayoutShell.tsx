"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SideDrawer from "@/components/SideDrawer";
import BottomTabs from "@/components/BottomTabs";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed top-3 left-3 z-40 w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-on-surface text-xl">
          menu
        </span>
      </button>

      {/* Profile Avatar Button */}
      <Link
        href="/profile"
        className="fixed top-3 right-3 z-40 w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.06] flex items-center justify-center active:scale-90 transition-transform overflow-hidden"
      >
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-on-surface text-xl">
            person
          </span>
        )}
      </Link>

      {/* Side Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main Content */}
      <main className="flex-grow pt-6 pb-32">{children}</main>

      {/* Bottom Navigation */}
      <BottomTabs />
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NotificationDrawer, { type NotificationItem } from "@/components/NotificationDrawer";

const POLL_MS = 30000;
const AUTO_OPEN_KEY = "boshaw-notif-auto-opened";
const SETTINGS_KEY = "boshaw-settings";
const SETTINGS_EVENT = "boshaw-settings-changed";

type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  lastSeenAt: string | null;
};

function readNotifyLeaderboard(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw) as { notifyLeaderboard?: boolean };
    return parsed.notifyLeaderboard !== false;
  } catch {
    return true;
  }
}

export default function NotificationBell() {
  const { status } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [notifyLeaderboard, setNotifyLeaderboard] = useState(true);

  useEffect(() => {
    setNotifyLeaderboard(readNotifyLeaderboard());
    const sync = () => setNotifyLeaderboard(readNotifyLeaderboard());
    window.addEventListener("storage", sync);
    window.addEventListener(SETTINGS_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SETTINGS_EVENT, sync);
    };
  }, []);

  const fetchNotifications = useCallback(async (): Promise<NotificationsResponse | undefined> => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = (await res.json()) as NotificationsResponse;
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setLastSeenAt(data.lastSeenAt);
      return data;
    } catch {}
  }, [status]);

  const openDrawer = useCallback(async () => {
    setDrawerOpen(true);
    setUnreadCount(0);
    try {
      const res = await fetch("/api/notifications/seen", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { seenAt: string };
        setLastSeenAt(data.seenAt);
      }
    } catch {}
  }, []);

  // Initial fetch + auto-open once per session when unread items exist
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchNotifications().then((data) => {
      if (!data) return;
      if (!notifyLeaderboard) return;
      const alreadyOpened = sessionStorage.getItem(AUTO_OPEN_KEY);
      if (!alreadyOpened && data.unreadCount > 0) {
        sessionStorage.setItem(AUTO_OPEN_KEY, "1");
        openDrawer();
      }
    });
  }, [status, fetchNotifications, openDrawer, notifyLeaderboard]);

  // Poll every 30s while authenticated
  useEffect(() => {
    if (status !== "authenticated") return;
    const iv = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(iv);
  }, [status, fetchNotifications]);

  // Refresh when tab regains focus
  useEffect(() => {
    if (status !== "authenticated") return;
    const onFocus = () => { void fetchNotifications(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [status, fetchNotifications]);

  if (status !== "authenticated") return null;

  const visibleNotifications = notifyLeaderboard ? notifications : [];
  const visibleUnread = notifyLeaderboard ? unreadCount : 0;

  return (
    <>
      <button
        onClick={() => { void openDrawer(); }}
        aria-label={
          visibleUnread > 0 ? `${visibleUnread} unread notifications` : "Notifications"
        }
        className="relative w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-on-surface text-xl">
          notifications
        </span>
        {visibleUnread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {visibleUnread > 9 ? "9+" : visibleUnread}
          </span>
        )}
      </button>

      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={visibleNotifications}
        lastSeenAt={lastSeenAt}
      />
    </>
  );
}

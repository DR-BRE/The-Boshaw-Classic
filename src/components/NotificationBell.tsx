"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NotificationDrawer, { type NotificationItem } from "@/components/NotificationDrawer";

const POLL_MS = 30000;
const AUTO_OPEN_KEY = "boshaw-notif-auto-opened";
const CLEARED_AT_KEY = "boshaw-notif-cleared-at";
const DRAWER_OPEN_EVENT = "boshaw-notif-drawer-open";
const DRAWER_CLOSE_EVENT = "boshaw-notif-drawer-close";

type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  lastSeenAt: string | null;
};

function readClearedAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CLEARED_AT_KEY);
  } catch {
    return null;
  }
}

function isAfter(iso: string, threshold: string | null): boolean {
  if (!threshold) return true;
  return new Date(iso) > new Date(threshold);
}

export default function NotificationBell() {
  const { status } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);
  const [clearedAt, setClearedAt] = useState<string | null>(null);

  useEffect(() => {
    setClearedAt(readClearedAt());
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      window.dispatchEvent(new Event(DRAWER_OPEN_EVENT));
    } else {
      window.dispatchEvent(new Event(DRAWER_CLOSE_EVENT));
    }
  }, [drawerOpen]);

  const fetchNotifications = useCallback(async (): Promise<NotificationsResponse | undefined> => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = (await res.json()) as NotificationsResponse;
      setNotifications(data.notifications);
      setLastSeenAt(data.lastSeenAt);
      return data;
    } catch {}
  }, [status]);

  const openDrawer = useCallback(async () => {
    setDrawerOpen(true);
    try {
      const res = await fetch("/api/notifications/seen", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { seenAt: string };
        setLastSeenAt(data.seenAt);
      }
    } catch {}
  }, []);

  const clearNotifications = useCallback(() => {
    const now = new Date().toISOString();
    try {
      localStorage.setItem(CLEARED_AT_KEY, now);
    } catch {}
    setClearedAt(now);
  }, []);

  // Initial fetch + auto-open once per session when unread items exist
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchNotifications().then((data) => {
      if (!data) return;
      const cleared = readClearedAt();
      const visibleUnread = data.notifications.filter(
        (n) =>
          isAfter(n.createdAt, cleared) &&
          (data.lastSeenAt === null || new Date(n.createdAt) > new Date(data.lastSeenAt))
      ).length;
      const alreadyOpened = sessionStorage.getItem(AUTO_OPEN_KEY);
      if (!alreadyOpened && visibleUnread > 0) {
        sessionStorage.setItem(AUTO_OPEN_KEY, "1");
        openDrawer();
      }
    });
  }, [status, fetchNotifications, openDrawer]);

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

  const visibleNotifications = notifications.filter((n) =>
    isAfter(n.createdAt, clearedAt)
  );
  const unreadCount = drawerOpen
    ? 0
    : visibleNotifications.filter((n) =>
        lastSeenAt === null ? true : new Date(n.createdAt) > new Date(lastSeenAt)
      ).length;

  return (
    <>
      <button
        onClick={() => { void openDrawer(); }}
        aria-label={
          unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"
        }
        className="relative w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.06] flex items-center justify-center active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-on-surface text-xl">
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearNotifications}
        notifications={visibleNotifications}
        lastSeenAt={lastSeenAt}
      />
    </>
  );
}

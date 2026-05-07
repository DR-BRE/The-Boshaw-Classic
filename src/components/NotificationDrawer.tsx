"use client";

import { useEffect } from "react";

export type NotificationItem = {
  id: string;
  type: "BIRDIE" | "EAGLE" | "DOUBLE_EAGLE" | "HOLE_IN_ONE" | "LEADER_CHANGE";
  round: number | null;
  course: string | null;
  hole: number | null;
  strokes: number | null;
  playerId: string | null;
  playerName: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};

const TYPE_ICON: Record<NotificationItem["type"], string> = {
  BIRDIE: "🐦",
  EAGLE: "🦅",
  DOUBLE_EAGLE: "🐦‍⬛",
  HOLE_IN_ONE: "🏌️",
  LEADER_CHANGE: "👑",
};

const TYPE_LABEL: Record<NotificationItem["type"], string> = {
  BIRDIE: "Birdie",
  EAGLE: "Eagle",
  DOUBLE_EAGLE: "Albatross",
  HOLE_IN_ONE: "HOLE-IN-ONE",
  LEADER_CHANGE: "Leader Change",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationCard({
  notification,
  lastSeenAt,
}: {
  notification: NotificationItem;
  lastSeenAt: string | null;
}) {
  const isUnread =
    lastSeenAt === null || new Date(notification.createdAt) > new Date(lastSeenAt);
  const icon = TYPE_ICON[notification.type];
  const timeStr = relativeTime(notification.createdAt);

  let title = "";
  let subtitle = "";

  if (notification.type === "LEADER_CHANGE") {
    title = `${notification.playerName ?? "Someone"} has taken the overall lead`;
    subtitle = timeStr;
  } else {
    const label = TYPE_LABEL[notification.type];
    title = `${notification.playerName ?? "Someone"} — ${label} on ${notification.hole}`;
    subtitle = [
      notification.course,
      notification.round !== null ? `R${notification.round}` : null,
      timeStr,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl ${
        isUnread ? "bg-surface-container" : ""
      }`}
    >
      {isUnread && (
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary" />
      )}
      <span className="text-xl mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-label text-sm font-bold text-on-surface leading-snug">{title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  onClear,
  notifications,
  lastSeenAt,
}: {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  notifications: NotificationItem[];
  lastSeenAt: string | null;
}) {
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
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel — full-width from right on all sizes */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full md:w-96 bg-surface-container-high border-l border-outline-variant/60 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-outline-variant/40">
          <h2 className="font-headline text-lg text-on-surface">Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClear}
                aria-label="Clear notifications"
                className="px-3 h-8 rounded-full bg-surface-container hover:bg-surface-container-highest font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant active:scale-95 transition-transform"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-highest flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-lg">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">
                notifications_none
              </span>
              <p className="font-label text-sm text-center px-8">
                No notifications yet — go birdie something.
              </p>
            </div>
          ) : (
            <div className="space-y-1 px-2">
              {notifications.map((n) => (
                <NotificationCard key={n.id} notification={n} lastSeenAt={lastSeenAt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

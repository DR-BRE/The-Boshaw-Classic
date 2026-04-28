# In-App Notifications — Design Spec

**Date:** 2026-04-26
**Status:** Approved for implementation planning
**Scope:** v1, in-app only (no push, no email, no SMS)

## Problem

The Boshaw Classic has no persistent notification system. Players who close the app and reopen it later have no way to know what happened while they were away. Score toasts ([ScoreToastProvider.tsx](../../../src/components/ScoreToastProvider.tsx)) are ephemeral and only visible to the player who triggered them.

We want broadcast hype moments and lead changes to persist and be surfaced when a player reopens the app — they shouldn't have to scroll the leaderboard to figure out what they missed.

## Goals

- Persist notable tournament moments to the database.
- Surface unread notifications prominently on app reopen so they don't get missed.
- Keep the system simple — small fixed feature surface, no background jobs, no real-time infrastructure.

## Non-goals (v1)

- Push notifications (web push / iOS PWA / native).
- Email or SMS delivery.
- Per-user preferences or mute toggles.
- Notification reactions, replies, or comments.
- Group-only or personal-only notifications.
- Non-broadcast events (Wolf game turn alerts, tee-time reminders, score deadline warnings, etc.).
- Admin compose / broadcast tooling.

## Notification types

All notifications are **broadcast** to every signed-in player.

| Type | Trigger | Detection |
|------|---------|-----------|
| `BIRDIE` | A player records a hole at 1 under par | `strokes - par === -1` |
| `EAGLE` | A player records a hole at 2 under par | `strokes - par === -2` |
| `DOUBLE_EAGLE` | A player records a hole at 3 under par | `strokes - par === -3` |
| `HOLE_IN_ONE` | A player records 1 stroke on any hole | `strokes === 1` (takes precedence over the par-delta check) |
| `LEADER_CHANGE` | The single clearly-leading player by overall (cumulative) toPar changes | Compare new overall #1 to most recent `LEADER_CHANGE` row; ties suppress firing |

Birdie volume is acceptable at the Boshaw's scale (8 players, 2 rounds). No volume filter applied.

## Architecture

Synchronous detection inside the existing score upsert flow. No background workers, no queues, no real-time push.

### Data model

Two changes to [prisma/schema.prisma](../../../prisma/schema.prisma):

```prisma
model Notification {
  id        String           @id @default(cuid())
  type      NotificationType
  round     Int              // 1, 2, ...
  playerId  String?          // who triggered it (nullable for LEADER_CHANGE if needed)
  hole      Int?             // 1-18, null for LEADER_CHANGE
  course    String?          // course name from COURSE_PARS, null for LEADER_CHANGE
  strokes   Int?             // strokes on the hole, null for LEADER_CHANGE
  payload   Json             // flexible extras: { displayName, previousLeaderId, ... }
  createdAt DateTime         @default(now())
  player    Player?          @relation(fields: [playerId], references: [id])

  @@index([createdAt])
}

enum NotificationType {
  BIRDIE
  EAGLE
  DOUBLE_EAGLE
  HOLE_IN_ONE
  LEADER_CHANGE
}

model Player {
  // ...existing fields...
  notificationsSeenAt DateTime?
  notifications       Notification[]
}
```

**Read state model:** "unread for me" is computed as `Notification.createdAt > player.notificationsSeenAt`. A null `notificationsSeenAt` means the player has never opened the drawer; treat all notifications as unread.

**Why JSON payload:** lets type-specific extras (e.g., `previousLeaderId` for `LEADER_CHANGE`, `displayName` snapshot for resilience to renames) live without schema churn.

### Detection logic

Runs inline in the score upsert handlers — both [/api/scores](../../../src/app/api/scores/route.ts) (POST) and [/api/scorecard](../../../src/app/api/scorecard/route.ts) (POST).

In a single Prisma transaction:

1. **Load the previous score** (if any) for `(playerId, round)`.
2. **Upsert the new score.**
3. **For each hole that changed value** (was null/different before, now has a new strokes value):
   - Look up `COURSE_PARS[course].holes[holeIndex]` from [src/lib/tournament.ts:33](../../../src/lib/tournament.ts:33) to get par.
   - Determine type:
     - `strokes === 1` → `HOLE_IN_ONE`
     - else `strokes - par === -3` → `DOUBLE_EAGLE`
     - else `strokes - par === -2` → `EAGLE`
     - else `strokes - par === -1` → `BIRDIE`
     - else: no notification
   - Insert one `Notification` row per qualifying hole, with `round`, `course`, `hole`, `strokes`, `playerId`, and a `payload` snapshot (`{ displayName }`).
4. **Leader-change check** (after the score row is saved, still in transaction):
   - Recompute the overall leaderboard (cumulative toPar across all rounds, same logic the existing leaderboard endpoint uses).
   - Identify the single clearly-leading player (lowest cumulative toPar with no tie at #1).
   - If there's no clear leader (a tie at #1), no notification.
   - If there is a clear leader, look up the most recent `LEADER_CHANGE` row's `playerId`.
     - If different (or no prior `LEADER_CHANGE` exists): insert a new `LEADER_CHANGE` row with `payload: { newLeaderId, newLeaderName, previousLeaderId, previousLeaderName }`.
     - If the same: no notification.

**Score correction behavior:**
- If a score is corrected from par to birdie (e.g., 4 → 3 on par 4), a new `BIRDIE` row fires.
- If a score is corrected from birdie back to par (e.g., 3 → 4), the prior `BIRDIE` row is **not** removed. The moment was already broadcast; suppressing the retraction is simpler and avoids fighting to "unsend" hype.

**Transactionality:** if the score upsert fails, no notifications are inserted (atomic rollback). If notification insertion fails, the score upsert also rolls back — fail loudly rather than silently lose moments.

### API surface

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/notifications` | Returns the most recent 50 notifications + the signed-in player's `unreadCount` and `lastSeenAt`. Sorted `createdAt desc`. |
| `POST` | `/api/notifications/seen` | Sets the signed-in player's `notificationsSeenAt = now()`. No body. Returns `{ ok: true, seenAt }`. |
| (modified) | `POST /api/scores`, `POST /api/scorecard` | Existing handlers add detection logic and notification inserts in the same transaction as the score upsert. |

All endpoints require an authenticated session (existing `auth()` pattern). No admin-only endpoints in v1. No DELETE / PATCH on notifications — they're append-only from the user's perspective.

**`GET /api/notifications` response shape:**

```json
{
  "notifications": [
    {
      "id": "ckxyz...",
      "type": "EAGLE",
      "round": 2,
      "course": "Desert Canyon",
      "hole": 12,
      "strokes": 3,
      "playerId": "abc",
      "playerName": "Bob",
      "payload": { "displayName": "Bob" },
      "createdAt": "2026-05-16T14:23:11Z"
    }
  ],
  "unreadCount": 3,
  "lastSeenAt": "2026-05-16T13:50:00Z"
}
```

`playerName` is joined from the `Player` relation at read time (so renames are reflected); `payload.displayName` is the snapshot at fire time (used as a fallback if the Player row was deleted).

## UI

### Bell

- New `<NotificationBell />` component placed in the global site header alongside the user avatar.
- Renders a 🔔 icon with a small red badge showing `unreadCount` when > 0; no badge when 0.
- Tapping toggles the drawer.
- Opening the drawer calls `POST /api/notifications/seen` and clears the badge in local state immediately (optimistic update).

### Drawer

- Slides down on mobile (full-width sheet from the top); slides in from the right on desktop (side panel).
- Header: "Notifications" title + close button.
- Body: list of notification cards, newest first, capped at 50.
- Empty state: "No notifications yet — go birdie something."
- Cards (one line each, with type-specific icon + relative time):
  - 🐦 **{Player} — Birdie on {hole}** · *{course} · R{round} · {relative time}*
  - 🦅 **{Player} — Eagle on {hole}** · *{course} · R{round} · {relative time}*
  - 🐦‍⬛ **{Player} — Albatross on {hole}** · *{course} · R{round} · {relative time}*
  - 🏌️ **{Player} — HOLE-IN-ONE on {hole}** · *{course} · R{round} · {relative time}*
  - 👑 **{Player} has taken the overall lead** · *{relative time}*
- Unread cards have a subtle left-edge accent in the brand color; read cards are flat.
- Polling: while the page is in the foreground (visible), the bell polls `GET /api/notifications` every 30 seconds. No SSE/WebSocket.
- Visual treatment uses the existing brand system via the [boshaw-components](../../../.claude/skills/boshaw-components/SKILL.md) and [boshaw-brand](../../../.claude/skills/boshaw-brand/SKILL.md) skills during implementation.

### Auto-open on reopen

- The bell is mounted in the global header and persists across client-side route changes. It fetches `/api/notifications` on initial mount, on tab `focus` events, and on a 30-second interval.
- If `unreadCount > 0` **and** the drawer has not been auto-opened in this browser session, the drawer opens automatically once.
- "This session" is tracked via `sessionStorage` (a flag set when auto-open fires).
- Whenever the drawer opens (by tap, by badge tap, or by auto-open), `notificationsSeenAt` is updated and the badge clears optimistically. The drawer will not auto-open again in this session even if new notifications arrive after `notificationsSeenAt` — the badge will reappear, but the user must tap to view them.
- A fresh session (new tab, hard refresh, browser reopen) with any unread items pops the drawer once on first mount. This is the "don't miss it on reopen" behavior.

## Migration & rollout

- A single Prisma migration adds the `Notification` table, the `NotificationType` enum, and the `notificationsSeenAt` column on `Player` (nullable, default null).
- No backfill — past scores do not retroactively generate notifications. Notifications begin populating with new score writes after deploy.
- On first load after deploy, every player has `notificationsSeenAt = null` and zero notifications, so nothing surfaces.
- Between tournament years, clear state by deleting all `Notification` rows and resetting `Player.notificationsSeenAt = null`. (Manual SQL, not exposed via UI.)

## Edge cases

| Case | Behavior |
|------|----------|
| Score fix (par → birdie) | Fires a new `BIRDIE` |
| Score fix (birdie → par) | Prior `BIRDIE` row is left in place, not deleted |
| Tie at the lead | No `LEADER_CHANGE` fires |
| First clear leader of the tournament | One `LEADER_CHANGE` fires |
| Lead bounces back to a previous leader | Each switch fires its own `LEADER_CHANGE` (one per change of identity) |
| Hole-in-one on a par 5 | Fires `HOLE_IN_ONE` (takes precedence over par-delta — would otherwise be DOUBLE_EAGLE+) |
| Player record deleted after a notification fires | Notification still readable; falls back to `payload.displayName` snapshot |
| Score posted with empty/null hole values | No detection runs for those holes |
| Multiple holes posted at once | Each qualifying hole produces one row |

## Testing

The repo has no existing test suite, so this is greenfield. Recommended unit tests:

- **Detection per type:** par-3 + 1 stroke → `HOLE_IN_ONE`; par-5 + 2 → `DOUBLE_EAGLE`; par-4 + 2 → `EAGLE`; par-4 + 3 → `BIRDIE`; par-4 + 4 → no notification.
- **Score correction:** par→birdie diff produces one `BIRDIE`; birdie→par diff produces nothing and leaves the prior row alone.
- **Leader-change:** ties produce nothing; first clear leader produces one row; switching leaders produces one row per switch; same leader produces nothing.
- **Read state:** notification with `createdAt > seenAt` is unread; with `createdAt <= seenAt` is read; null `seenAt` makes everything unread.

## Open questions / decisions to revisit later

- Whether to extend to push notifications, email, or SMS once the in-app feed proves out.
- Whether to add per-user mute toggles if certain players find the cadence noisy.
- Whether to add a leader-change cooldown if mid-round swings get spammy in practice.
- Whether to surface notifications for Wolf game events, tee-time reminders, or admin announcements in v2.

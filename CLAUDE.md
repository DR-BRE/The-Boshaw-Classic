@AGENTS.md

# The Boshaw Classic — agent guide

## Project

Golf tournament scoring PWA for an 8-player, 3-round private event (May 14–16, 2026). Includes a custom "wolf" side-game with per-hole partner picks. iPhone-first — must run as an installed PWA. Single-tenant; auth is gated to known players' Google accounts.

## Tech stack

- Next.js **16.2.2** (App Router, `src/app/`) — APIs differ from older Next; `node_modules/next/dist/docs/` does NOT actually exist on disk despite AGENTS.md claiming to. When uncertain, read the running code, not training data.
- React 19.2.4
- TypeScript 5, strict mode
- Tailwind CSS v4 via `@tailwindcss/postcss` (no `tailwind.config.*` file — design tokens live in `src/app/globals.css`)
- Prisma 7.6 + `@prisma/adapter-pg` over Postgres
- NextAuth 4 with Google provider, database sessions
- Vitest 4
- Package manager: **npm**

## Commands

```
npm install                        # install
npm run dev                        # dev server on port 3001 (not 3000)
npm test                           # vitest run
npm run test:watch                 # vitest watch
npm run lint                       # eslint (flat config)
npx tsc --noEmit                   # typecheck (no dedicated script)
npx prisma generate                # regen client into src/generated/prisma
npx prisma migrate dev --name <n>  # local migration
npm run build                      # prisma generate && next build
npm run migrate:deploy             # prisma migrate deploy (prod)
npm run lighthouse                 # lighthouse against http://localhost:3001
```

There is no dedicated `typecheck` script; run `tsc --noEmit` before claiming a task is done.

## Architecture

- **Routing**: App Router under `src/app/`. All page components default to `"use client"`. Top-level routes: `/`, `/leaderboard`, `/scorecard`, `/scoring`, `/players`, `/profile`, `/settings`, `/trip`, `/admin`.
- **API**: route handlers under `src/app/api/*/route.ts`. They return **raw JSON** (no `{data, error}` envelope). Errors: `NextResponse.json({ error: "..." }, { status })`.
- **Auth**: `src/lib/auth.ts` exports `authOptions` and `ADMIN_EMAIL`. In every protected API route:
  ```ts
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  ```
- **Database**: a single Prisma client lives in `src/lib/prisma.ts` (globalThis-cached). Always `import { prisma } from "@/lib/prisma"` — never instantiate a new `PrismaClient`.
- **Scoring**: `Score` rows store one row per (player, round) with `hole1..hole18` columns. Leaderboard is **always recomputed live** from those hole columns (`extractHoles` + `computeFromHoles`); ignore the cached `totalStrokes` / `toPar` fields when reasoning about leader logic.
- **Wolf game**: `src/lib/wolf.ts`. Wolf rotates by `wolfOrder[(hole - 1) % 4]` for **holes 1–16 only**; holes 17–18 are solo and excluded from wolf scoring.
- **Notifications**: `src/lib/notifications.ts`. `detectAndInsertNotifications()` runs synchronously inside the score upsert transaction in `POST /api/scores`. Types: `BIRDIE`, `EAGLE`, `DOUBLE_EAGLE`, `HOLE_IN_ONE`, `LEADER_CHANGE`. Client polls `/api/notifications` and marks read via `/api/notifications/seen`.
- **PWA**: `src/app/manifest.ts` (Next 16 MetadataRoute), `appleWebApp` block in `src/app/layout.tsx`. Layout uses `env(safe-area-inset-*)` and dynamic viewport units (`100dvh`).

## Code conventions

- Import alias: `@/` → `./src/`. Use it. Don't write `../../lib/...`.
- TypeScript strict; no `any` without a `// reason:` comment.
- File names: PascalCase for top-level components (`TopBar.tsx`, `LayoutShell.tsx`), kebab-case for primitives in `src/components/ui/` (`card.tsx`, `stat-badge.tsx`).
- Components default to `"use client"` at top of file. Server components are the exception; only switch a file to server when there's a reason.
- Styling: Tailwind v4 utility classes only, using the MD3 tokens defined in `globals.css` (`text-primary`, `bg-surface-container`, `border-outline-variant/40`, etc.). No inline `style` except for dynamic values that can't be expressed as classes (e.g. safe-area math).
- DB columns mix camelCase (Prisma model fields) and snake_case (NextAuth fields like `refresh_token`). Match what's already in `schema.prisma`.
- Prisma client is imported from `@/generated/prisma/client`, not `@prisma/client`.

## Do / don't

**Do**
- Run `npm run lint` and `npx tsc --noEmit` before declaring a task done. Run `npm test` if you touched anything in `src/lib/` or `src/app/api/`.
- Use the project's skills proactively: `boshaw-brand` and `boshaw-components` for any UI change, `debug-scoring` for scoring/leaderboard/wolf bugs, `api-route` when adding endpoints.
- Reuse `prisma`, `getServerSession(authOptions)`, `extractHoles`, `computeFromHoles`, `getWolfForHole`, `detectAndInsertNotifications` rather than re-implementing them.
- Use `America/Los_Angeles` for any timezone-sensitive logic (cron, scrapers, date display).
- Test UI changes in the browser and on iPhone PWA viewport sizes — the layout uses safe-area math that desktop dev tools don't always show correctly.

**Don't**
- Don't edit anything under `src/generated/prisma/` — it's regenerated by `prisma generate`.
- Don't instantiate a new `PrismaClient` or `getServerSession` wrapper. Use the existing ones.
- Don't deploy to Vercel without explicit user confirmation of the project name/ID.
- Don't submit multiple consecutive PRs for the same visual fix. Reason through CSS cascade and safe-area constraints before pushing.
- Don't trust your training data on Next.js APIs — version 16 has breaking changes. When in doubt, grep the codebase or read the actual installed version.
- Don't add a `tailwind.config.*` file. Tokens go in `globals.css`.

## Gotchas

- **Dev port is 3001**, not 3000 (per `.claude/launch.json` and the lighthouse scripts). If you spawn a dev server elsewhere, expect collisions.
- **`prisma generate` is not automatic on dev** — only `npm run build` runs it. After editing `schema.prisma`, run `npx prisma generate` or types will be stale.
- **Score POST is heavy**: it upserts the score row, then synchronously runs `detectAndInsertNotifications` inside the same transaction. Client uses debounced saves so notifications fire on the final score, not every +/- tap. Don't break the debounce when refactoring scorecard input.
- **Wolf game holes 17–18 are solo**. `calculateWolfHole` returns `null` for those — don't add them to wolf totals.
- **Active rounds are gated** by `ACTIVE_ROUNDS` in `src/lib/tournament.ts`. Currently `new Set([1, 2])`. Round 3 will need to be added on event day.
- **`ADMIN_EMAIL` is hardcoded** in `src/lib/auth.ts` (`brettwfrancoeur@gmail.com`). Admin-only routes compare `session.user.email` against this constant.
- **PWA viewport is locked**: `userScalable: false`, `maximumScale: 1`. Don't rely on pinch-zoom for accessibility — design the layout to be readable at one zoom level.
- **No `.env.example`**. Required env: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `BLOB_READ_WRITE_TOKEN`.
- **README.md is the stock create-next-app boilerplate**. Ignore it; this file and AGENTS.md are the source of truth.
- **`prisma migrate deploy` is not in the build script** (it was removed — see commit `b33094d`). Run it explicitly via `npm run migrate:deploy` during deploys.

## Files worth knowing

- `src/app/layout.tsx` — root layout, fonts, `appleWebApp`, viewport.
- `src/app/globals.css` — MD3 design tokens (colors, typography). All Tailwind classes resolve through these.
- `src/lib/prisma.ts` — Prisma singleton. Always import from here.
- `src/lib/auth.ts` — NextAuth config and `ADMIN_EMAIL` constant.
- `src/lib/tournament.ts` — courses, par/yardage data, `ACTIVE_ROUNDS`.
- `src/lib/wolf.ts` — wolf rotation and per-hole point calculation.
- `src/lib/notifications.ts` — score-event detection (birdie/eagle/leader change).
- `src/lib/useLiveRound.ts` — polling hook used by scorecard and leaderboard.
- `src/app/api/scores/route.ts` — score upsert + notification dispatch (the hot path).
- `src/app/api/leaderboard/route.ts` — live recomputation from hole columns.
- `prisma/schema.prisma` — data model (Player, Score, WolfOrder, WolfPick, Notification).
- `docs/superpowers/specs/2026-04-26-notifications-design.md` — notifications architecture spec.

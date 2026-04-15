---
name: debug-scoring
description: Debug tournament scoring, leaderboard calculations, and wolf game logic — trace data through the database and scoring functions
allowed-tools: Read Grep Glob Bash(npx prisma studio) Bash(npx tsx *)
---

# Debug Scoring

Diagnose issues with tournament scoring, leaderboard calculations, or wolf game logic. Use `$ARGUMENTS` to understand what the user is seeing vs. what they expect.

## Key Files to Read

- `src/lib/tournament.ts` — `TOURNAMENT` config, `COURSE_PARS` (par values per hole per course)
- `src/lib/wolf.ts` — Wolf game scoring functions
- `src/app/api/leaderboard/route.ts` — Leaderboard calculation logic
- `src/app/api/scores/route.ts` — Score submission and retrieval
- `src/app/api/wolf/route.ts` — Wolf game data endpoint
- `src/app/api/wolf-picks/route.ts` — Wolf pick submission
- `prisma/schema.prisma` — Database models

## Tournament Structure

- **3 rounds**, one per course:
  - Round 1: Bear Mountain Ranch (par 72)
  - Round 2: Desert Canyon (par 72)
  - Round 3: Echo Falls (par 71)
- **8 players** in **2 groups** of 4
- Scores stored per-hole (`hole1`-`hole18`) plus computed `totalStrokes` and `toPar`
- Unique constraint: one score per player per round (`[playerId, round]`)

## Debugging Approach

### Leaderboard issues
1. Read `src/app/api/leaderboard/route.ts` to understand the current calculation
2. Check if the issue is with:
   - **Partial scores** — Are incomplete rounds being handled correctly?
   - **toPar calculation** — Compare `totalStrokes` minus course par against the stored `toPar`
   - **Round filtering** — Is the correct round/course being queried?
   - **Sorting** — Leaderboard should sort by `toPar` ascending (lowest first)

### Score entry issues
1. Read `src/app/api/scores/route.ts`
2. Check the upsert logic — uses composite key `playerId_round`
3. Verify all 18 holes are being submitted (validation requires `holes.length === 18`)
4. Check that `totalStrokes` and `toPar` are computed correctly from hole scores and `COURSE_PARS`

### Wolf game issues
1. Read `src/lib/wolf.ts` for the scoring rules:
   - `getWolfForHole(wolfOrder, holeNumber)` — rotation: `wolfOrder[(holeNumber - 1) % 4]`, holes 1-16 only (17-18 are non-wolf)
   - `calculateWolfHole()`:
     - **Lone wolf** (partnerId = null): Wolf gets **2 points** for winning, opponents get **1 each** for winning
     - **Paired** (partnerId = string): Wolf + partner get **1 point each** for winning, opponents get **1 each** for winning
     - **Best ball**: Compare lowest score on wolf team vs. lowest score on opponent team
     - **Tie = push** (no points)
2. Check `WolfOrder` table — is the rotation correct for the round/group?
3. Check `WolfPick` table — are picks being stored for the right holes?

## Useful Queries

If you need to inspect the database directly, open Prisma Studio with `npx prisma studio` or write a quick script with `npx tsx` to query specific data.

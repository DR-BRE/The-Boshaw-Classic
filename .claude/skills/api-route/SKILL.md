---
name: api-route
description: Scaffold a new Next.js API route matching the project's exact patterns — auth, Prisma, error handling, response format
allowed-tools: Read Write Edit Glob Grep
---

# Scaffold API Route

Generate a new API route at `src/app/api/<name>/route.ts` that matches the existing codebase conventions exactly. Use `$ARGUMENTS` to determine the route name and behavior.

## Before Writing

1. Read 1-2 existing routes under `src/app/api/` to confirm patterns are still current
2. Read `prisma/schema.prisma` if the route involves database operations

## Route Template

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    // extract query params: const foo = searchParams.get("foo");

    // Prisma query
    const data = await prisma.model.findMany({ /* ... */ });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/<name> error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

## Conventions

**Imports (always in this order):**
1. `NextResponse` from `next/server`
2. `getServerSession` from `next-auth`
3. `authOptions` (and `ADMIN_EMAIL` if admin-only) from `@/lib/auth`
4. `prisma` from `@/lib/prisma`
5. Any other imports (types, tournament config, etc.)

**Authentication:**
- Standard user auth: `if (!session?.user?.id)` -> 401
- Admin-only: `import { ADMIN_EMAIL } from "@/lib/auth"`, then `if (!session?.user?.email || session.user.email !== ADMIN_EMAIL)` -> 403
- Public routes (e.g., leaderboard): skip auth check entirely

**HTTP methods:** Export named async functions: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

**Input parsing:**
- Query params: `const { searchParams } = new URL(request.url)`
- Request body: `const body = await request.json()`

**Validation pattern:**
```typescript
const { field1, field2 } = body;
if (!field1 || !field2) {
  return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
}
```

**Response format:**
- Success: `NextResponse.json(data)` (200 implicit)
- With cache headers: `NextResponse.json(data, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } })`
- Errors: `NextResponse.json({ error: "message" }, { status: 4xx/5xx })`

**Error handling:** Every handler wrapped in try/catch. Catch block logs `console.error("METHOD /api/<name> error:", error)` and returns 500.

**Force dynamic (for real-time routes):**
```typescript
export const dynamic = "force-dynamic";
```

**Prisma patterns used in this project:**
- `findUnique` with `where: { userId: session.user.id }`
- `findMany` with `include`, `orderBy`
- `upsert` with composite keys: `where: { playerId_round: { playerId, round } }`
- `delete` / `deleteMany`

## Available Models

User, Account, Session, VerificationToken, Player, Score, WolfOrder, WolfPick.
See `prisma/schema.prisma` for full field definitions.

## Available Utilities

- `@/lib/auth` — `authOptions`, `ADMIN_EMAIL`
- `@/lib/prisma` — `prisma` client
- `@/lib/tournament` — `TOURNAMENT` config, `COURSE_PARS` lookup
- `@/lib/wolf` — `getWolfForHole()`, `calculateWolfHole()`, `calculateWolfStandings()`

---
name: component
description: Scaffold a new React component or page matching the project's existing patterns — Tailwind MD3 tokens, client components, auth checks, data fetching
allowed-tools: Read Write Edit Glob Grep
---

# Scaffold Component or Page

Generate a new component or page that matches the existing codebase conventions exactly. Use `$ARGUMENTS` to determine what to create.

## Before Writing

1. Read 1-2 existing files similar to what's being requested to confirm patterns are still current
2. Determine if this is a **page** (`src/app/<route>/page.tsx`) or a **component** (`src/components/<Name>.tsx`)

## Page Pattern

Pages go in `src/app/<route>/page.tsx`. Follow this structure:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// other imports as needed, using @/* path alias

export default function PageName() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  // other state

  useEffect(() => {
    // fetch data from API
    fetch("/api/endpoint", { cache: "no-store" })
      .then(res => res.json())
      .then(data => { /* set state */ setLoading(false); });
  }, []);

  if (status === "unauthenticated") {
    return (/* sign-in prompt */);
  }
  if (loading) {
    return (/* loading skeleton */);
  }

  return (/* main UI */);
}
```

**Key conventions:**
- `"use client"` at the top (almost all pages are client components)
- Auth via `useSession()` from `next-auth/react` with conditional renders
- Data fetching via `fetch()` in `useEffect`, not server components
- For live data, add polling with `setInterval` (5s) and cleanup via `return () => clearInterval(interval)`

## Component Pattern

Components go in `src/components/<Name>.tsx`:

```typescript
"use client";

// props interface if needed
interface Props {
  children: React.ReactNode;
}

export default function ComponentName({ children }: Props) {
  return (/* JSX */);
}
```

## Tailwind & Styling Conventions

**Color system (Material Design 3 tokens — always use these, never raw colors):**
- Text: `text-primary`, `text-secondary`, `text-on-surface`, `text-on-surface-variant`
- Backgrounds: `bg-surface-container`, `bg-surface-container-low`, `bg-primary-container`
- Scoring: `text-primary` (under par), `text-on-error-container` (over par), `text-on-surface` (even)

**Glass morphism cards:**
```
bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl
```

**Typography:**
- Headlines: `font-headline text-3xl font-bold text-on-surface`
- Labels: `font-label text-xs uppercase tracking-widest text-on-surface-variant`
- Body: `font-body`

**Interactive elements:**
- Tap feedback: `active:scale-95 transition-transform`
- Disabled: `disabled:opacity-30` or `disabled:opacity-50`
- Hover: `hover:bg-white/[0.06]`

**Spacing:** `px-4 py-6` for page padding, `gap-3`/`gap-4`/`gap-6` for flex gaps.

**Borders:** `border border-white/[0.06]` or `border border-white/[0.08]`

## Path Alias

Always use `@/*` which maps to `./src/*`. Example: `import { prisma } from "@/lib/prisma"`.

# UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the teal glassmorphic design with a premium PGA Tour-style aesthetic — dark navy + refined gold, Inter + Bebas Neue typography, and a reusable component library across all 8 pages.

**Architecture:** Design tokens first (globals.css), then foundation UI components, then sport-specific components, then all pages rebuilt using those components. Zero backend changes — this is purely presentational.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, TypeScript. New fonts: Inter + Bebas Neue (both Google Fonts). New components live in `src/components/ui/` and `src/components/sport/`.

---

## File Map

**Modify:**
- `src/app/globals.css` — new color tokens, font tokens, glass-card utility
- `src/app/layout.tsx` — new Google Fonts imports, themeColor update

**Create:**
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/modal.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/index.ts`
- `src/components/sport/score-cell.tsx`
- `src/components/sport/leaderboard-row.tsx`
- `src/components/sport/stat-badge.tsx`
- `src/components/sport/index.ts`

**Rebuild (full replacement):**
- `src/components/BottomTabs.tsx`
- `src/components/SideDrawer.tsx`
- `src/components/Countdown.tsx`
- `src/app/page.tsx`
- `src/app/leaderboard/page.tsx`
- `src/app/scorecard/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/trip/page.tsx`

---

## Task 1: Design Tokens — globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace all CSS custom properties in `:root`**

Replace the entire `:root` block (lines 3–59) with:

```css
:root {
  /* Surfaces — dark navy-black */
  --background: #0D1117;
  --surface: #0D1117;
  --surface-dim: #0A0C10;
  --surface-container-lowest: #090B0F;
  --surface-container-low: #0F1419;
  --surface-container: #161B22;
  --surface-container-high: #1C2128;
  --surface-container-highest: #21262D;
  --surface-bright: #2D333B;
  --surface-variant: #1C2128;

  /* Primary — refined gold */
  --primary: #C9A227;
  --primary-container: #3D2F00;
  --primary-fixed: #F0D060;
  --primary-fixed-dim: #C9A227;
  --on-primary: #1A1400;
  --on-primary-container: #F0D060;
  --inverse-primary: #946D00;

  /* Secondary — muted slate */
  --secondary: #8B949E;
  --secondary-container: #21262D;
  --secondary-fixed: #B0BAC4;
  --on-secondary: #0D1117;
  --on-secondary-container: #E6EDF3;

  /* Tertiary */
  --tertiary: #58A6FF;
  --on-tertiary: #0D1117;

  /* Text */
  --on-surface: #E6EDF3;
  --on-surface-variant: #8B949E;
  --inverse-surface: #E6EDF3;
  --inverse-on-surface: #0D1117;

  /* Outline */
  --outline: #484F58;
  --outline-variant: #30363D;

  /* Score colors */
  --score-under: #3FB950;
  --score-over: #F85149;
  --score-par: #8B949E;

  /* Error */
  --on-error: #F85149;
  --on-error-container: #F85149;

  /* Surface tint */
  --surface-tint: #C9A227;
}
```

- [ ] **Step 2: Replace `@theme inline` block**

Replace the entire `@theme inline` block (lines 61–102) with:

```css
@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-dim: var(--surface-dim);
  --color-surface-container-lowest: var(--surface-container-lowest);
  --color-surface-container-low: var(--surface-container-low);
  --color-surface-container: var(--surface-container);
  --color-surface-container-high: var(--surface-container-high);
  --color-surface-container-highest: var(--surface-container-highest);
  --color-surface-bright: var(--surface-bright);
  --color-surface-variant: var(--surface-variant);

  --color-primary: var(--primary);
  --color-primary-container: var(--primary-container);
  --color-on-primary: var(--on-primary);
  --color-on-primary-container: var(--on-primary-container);

  --color-secondary: var(--secondary);
  --color-on-secondary: var(--on-secondary);
  --color-on-secondary-container: var(--on-secondary-container);

  --color-tertiary: var(--tertiary);
  --color-on-tertiary: var(--on-tertiary);

  --color-on-surface: var(--on-surface);
  --color-on-surface-variant: var(--on-surface-variant);
  --color-inverse-surface: var(--inverse-surface);
  --color-inverse-on-surface: var(--inverse-on-surface);

  --color-outline: var(--outline);
  --color-outline-variant: var(--outline-variant);

  --color-score-under: var(--score-under);
  --color-score-over: var(--score-over);
  --color-score-par: var(--score-par);

  --color-on-error: var(--on-error);
  --color-on-error-container: var(--on-error-container);

  --color-surface-tint: var(--surface-tint);

  --font-display: "Bebas Neue", sans-serif;
  --font-headline: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-label: "Inter", sans-serif;
}
```

- [ ] **Step 3: Replace light mode `.light` block**

Replace the `.light` block (lines 104–153) with:

```css
.light {
  --background: #F6F8FA;
  --surface: #FFFFFF;
  --surface-dim: #EAEEF2;
  --surface-container-lowest: #FFFFFF;
  --surface-container-low: #F6F8FA;
  --surface-container: #EAEEF2;
  --surface-container-high: #E1E8F0;
  --surface-container-highest: #D8E1EA;
  --surface-bright: #FFFFFF;
  --surface-variant: #E1E8F0;

  --primary: #946D00;
  --primary-container: #FFF3C4;
  --on-primary: #FFFFFF;
  --on-primary-container: #3D2F00;

  --secondary: #57606A;
  --on-secondary: #FFFFFF;
  --on-secondary-container: #0D1117;

  --on-surface: #0D1117;
  --on-surface-variant: #57606A;
  --inverse-surface: #0D1117;
  --inverse-on-surface: #F6F8FA;

  --outline: #8C959F;
  --outline-variant: #D0D7DE;

  --score-under: #1A7F37;
  --score-over: #CF222E;
  --score-par: #57606A;

  --on-error: #CF222E;
  --on-error-container: #CF222E;

  --surface-tint: #946D00;
}
```

- [ ] **Step 4: Update `.glass-card` utility**

Replace the `.glass-card` block with:

```css
/* Card utility — clean surface, subtle border */
.glass-card {
  background: var(--surface-container);
  border: 1px solid var(--outline-variant);
}

.light .glass-card {
  background: var(--surface);
  border: 1px solid var(--outline-variant);
}
```

- [ ] **Step 5: Remove the white-opacity light mode override block**

Delete lines 183–213 (the block of `.light .bg-white/[0.xx]` and `.light .border-white/[0.xx]` overrides). These are no longer needed since we're moving away from white-opacity utilities.

- [ ] **Step 6: Verify dev server renders without crashes**

```bash
cd "/Users/bfrancoeur/Documents/GitHub/Golf Website" && npm run dev
```

Open http://localhost:3000 — app should load. Colors will look different (navy background, gold accents). No red console errors.

- [ ] **Step 7: Commit**

```bash
cd "/Users/bfrancoeur/Documents/GitHub/Golf Website"
git add src/app/globals.css
git commit -m "design: replace color tokens with navy/gold system, Inter+Bebas Neue fonts"
```

---

## Task 2: Font Setup — layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace Google Fonts link tag**

In `src/app/layout.tsx`, replace the existing Noto Serif / Manrope `<link>` tag with:

```tsx
<link
  href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

Keep the Material Symbols link unchanged.

- [ ] **Step 2: Update themeColor in viewport export**

```tsx
export const viewport: Viewport = {
  themeColor: "#0D1117",
};
```

- [ ] **Step 3: Verify fonts load**

Run dev server, open http://localhost:3000. Open DevTools → Network → filter "font". Confirm `Bebas+Neue` and `Inter` requests appear. Body text should now render in Inter.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "design: swap fonts to Inter + Bebas Neue"
```

---

## Task 3: Button Component

**Files:**
- Create: `src/components/ui/button.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:opacity-90 active:scale-95 font-semibold",
  secondary:
    "bg-transparent border border-outline text-on-surface hover:bg-surface-container-high active:scale-95",
  ghost:
    "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-95",
  danger:
    "bg-transparent border border-on-error-container text-on-error-container hover:bg-on-error-container/10 active:scale-95",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg min-h-[36px]",
  md: "px-4 py-2.5 text-sm rounded-xl min-h-[44px]",
  lg: "px-6 py-3 text-base rounded-xl min-h-[52px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2 font-label tracking-wide transition-all cursor-pointer",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd "/Users/bfrancoeur/Documents/GitHub/Golf Website" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to `button.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "design: add Button component with primary/secondary/ghost/danger variants"
```

---

## Task 4: Card Component

**Files:**
- Create: `src/components/ui/card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  noPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, noPadding = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "rounded-xl border",
          elevated
            ? "bg-surface-container-high border-outline-variant/60"
            : "bg-surface-container border-outline-variant/40",
          noPadding ? "" : "p-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "design: add Card component"
```

---

## Task 5: Badge Component

**Files:**
- Create: `src/components/ui/badge.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "gold" | "success" | "danger" | "muted" | "live";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-container-high text-on-surface border-outline-variant/40",
  gold: "bg-primary/15 text-primary border-primary/30",
  success: "bg-score-under/15 text-score-under border-score-under/30",
  danger: "bg-score-over/15 text-score-over border-score-over/30",
  muted: "bg-surface-container text-on-surface-variant border-outline-variant/30",
  live: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-label font-medium uppercase tracking-wider border",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "design: add Badge component"
```

---

## Task 6: Input Component

**Files:**
- Create: `src/components/ui/input.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-label font-medium uppercase tracking-wider text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full min-h-[44px] px-3 py-2.5 rounded-xl text-sm text-on-surface",
            "bg-surface-container border transition-colors outline-none",
            error
              ? "border-score-over focus:border-score-over"
              : "border-outline-variant/60 focus:border-primary",
            "placeholder:text-on-surface-variant/50",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-on-surface-variant">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-score-over">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/input.tsx
git commit -m "design: add Input component with label/error/hint"
```

---

## Task 7: Modal Component

**Files:**
- Create: `src/components/ui/modal.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        ref={dialogRef}
        className={[
          "relative w-full rounded-2xl bg-surface-container-high border border-outline-variant/60",
          "p-6 flex flex-col gap-4 max-h-[85dvh] overflow-y-auto",
          sizes[size],
        ].join(" ")}
      >
        {title && (
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container active:scale-90 transition-all cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/modal.tsx
git commit -m "design: add Modal component"
```

---

## Task 8: Skeleton & Avatar Components

**Files:**
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/avatar.tsx`

- [ ] **Step 1: Create skeleton.tsx**

```tsx
import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: string;
}

export function Skeleton({ height = "h-4", className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={[
        "bg-surface-container-high animate-pulse rounded-xl",
        height,
        className,
      ].join(" ")}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Create avatar.tsx**

```tsx
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { px: 32, class: "w-8 h-8 text-xs" },
  md: { px: 40, class: "w-10 h-10 text-sm" },
  lg: { px: 56, class: "w-14 h-14 text-base" },
};

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const { px, class: sizeClass } = sizes[size];
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={[
        "rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/60 flex items-center justify-center flex-shrink-0",
        sizeClass,
        className,
      ].join(" ")}
    >
      {src ? (
        <Image src={src} alt={name ?? "Avatar"} width={px} height={px} className="object-cover w-full h-full" />
      ) : (
        <span className="font-label font-semibold text-on-surface-variant">{initials}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create ui/index.ts barrel export**

```tsx
export { Button } from "./button";
export { Card } from "./card";
export { Badge } from "./badge";
export { Input } from "./input";
export { Modal } from "./modal";
export { Skeleton } from "./skeleton";
export { Avatar } from "./avatar";
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd "/Users/bfrancoeur/Documents/GitHub/Golf Website" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors in `src/components/ui/`.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "design: add Skeleton, Avatar, and ui/index barrel export"
```

---

## Task 9: StatBadge & ScoreCell Sport Components

**Files:**
- Create: `src/components/sport/stat-badge.tsx`
- Create: `src/components/sport/score-cell.tsx`

- [ ] **Step 1: Create stat-badge.tsx**

Displays a score-to-par value like `-3`, `E`, `+2` with correct color.

```tsx
interface StatBadgeProps {
  value: number; // score relative to par (negative = under, 0 = even, positive = over)
  className?: string;
}

export function StatBadge({ value, className = "" }: StatBadgeProps) {
  const label = value === 0 ? "E" : value > 0 ? `+${value}` : `${value}`;
  const color =
    value < 0
      ? "text-score-under"
      : value > 0
      ? "text-score-over"
      : "text-score-par";

  return (
    <span
      className={[
        "font-body tabular-nums font-semibold",
        color,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create score-cell.tsx**

Single hole score cell used in the scorecard grid.

```tsx
"use client";

interface ScoreCellProps {
  score: number | null;
  par: number;
  editable?: boolean;
  onClick?: () => void;
}

function getScoreStyle(score: number, par: number): string {
  if (score === 1) return "text-score-under bg-score-under/20 border-score-under/40 font-bold";
  if (score <= par - 2) return "text-score-under bg-score-under/15 border-score-under/30 font-bold";
  if (score === par - 1) return "text-primary bg-primary/15 border-primary/30 font-semibold";
  if (score === par) return "text-on-surface bg-surface-container border-outline-variant/40";
  return "text-score-over bg-score-over/10 border-score-over/30";
}

export function ScoreCell({ score, par, editable = false, onClick }: ScoreCellProps) {
  if (score === null) {
    return (
      <button
        onClick={onClick}
        disabled={!editable}
        className="w-10 h-10 rounded-lg border border-dashed border-outline-variant/40 flex items-center justify-center text-on-surface-variant/40 text-sm active:scale-90 transition-transform disabled:cursor-default cursor-pointer"
        aria-label={`Enter score for par ${par}`}
      >
        –
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!editable}
      className={[
        "w-10 h-10 rounded-lg border flex items-center justify-center text-sm tabular-nums transition-all",
        editable ? "active:scale-90 cursor-pointer" : "cursor-default",
        getScoreStyle(score, par),
      ].join(" ")}
      aria-label={`Score ${score} on par ${par}`}
    >
      {score}
    </button>
  );
}
```

- [ ] **Step 3: Create LeaderboardRow component**

Create `src/components/sport/leaderboard-row.tsx`:

```tsx
import { StatBadge } from "./stat-badge";
import { Avatar } from "@/components/ui/avatar";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  avatarUrl?: string | null;
  scoreToPar: number;
  thru: number | null; // null = not started
  today: number | null;
  total: number;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

const rankIcon = (rank: number) => {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
};

export function LeaderboardRow({
  rank,
  name,
  avatarUrl,
  scoreToPar,
  thru,
  today,
  total,
  isCurrentUser = false,
  onPress,
}: LeaderboardRowProps) {
  const icon = rankIcon(rank);

  return (
    <button
      onClick={onPress}
      className={[
        "w-full flex items-center gap-3 px-4 py-3 border-b border-outline-variant/30 text-left transition-colors",
        "active:bg-surface-container-high hover:bg-surface-container cursor-pointer",
        isCurrentUser ? "bg-primary/5 border-l-2 border-l-primary" : "",
      ].join(" ")}
    >
      {/* Rank */}
      <div className="w-8 flex-shrink-0 text-center">
        {icon ? (
          <span className="text-base">{icon}</span>
        ) : (
          <span className="text-sm font-label text-on-surface-variant tabular-nums">{rank}</span>
        )}
      </div>

      {/* Avatar + Name */}
      <Avatar src={avatarUrl} name={name} size="sm" />
      <span className="flex-1 font-body text-sm font-medium text-on-surface truncate">{name}</span>

      {/* Stats */}
      <div className="flex items-center gap-4 text-right flex-shrink-0">
        {thru !== null && (
          <span className="text-xs text-on-surface-variant tabular-nums w-8">
            {thru === 18 ? "F" : `${thru}`}
          </span>
        )}
        {today !== null && (
          <StatBadge value={today} className="text-xs w-8 text-right" />
        )}
        <StatBadge value={scoreToPar} className="text-sm w-10 text-right" />
      </div>
    </button>
  );
}
```

- [ ] **Step 4: Create sport/index.ts barrel export**

```tsx
export { StatBadge } from "./stat-badge";
export { ScoreCell } from "./score-cell";
export { LeaderboardRow } from "./leaderboard-row";
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd "/Users/bfrancoeur/Documents/GitHub/Golf Website" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors in `src/components/sport/`.

- [ ] **Step 6: Commit**

```bash
git add src/components/sport/
git commit -m "design: add sport components — StatBadge, ScoreCell, LeaderboardRow"
```

---

## Task 10: BottomTabs Restyle

**Files:**
- Modify: `src/components/BottomTabs.tsx`

- [ ] **Step 1: Read the current file**

Read `src/components/BottomTabs.tsx` to understand current tab definitions and active state logic. Keep all routing logic — only replace the JSX/className layer.

- [ ] **Step 2: Replace the render output**

The new BottomTabs should render:

```tsx
// Keep all existing imports and tab definitions unchanged.
// Replace only the return statement with:

return (
  <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container border-t border-outline-variant/40 pb-safe">
    <div className="flex items-stretch h-16">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
              "active:bg-surface-container-high",
              active ? "text-primary" : "text-on-surface-variant",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] font-label font-medium uppercase tracking-wider">
              {tab.label}
            </span>
            {active && (
              <span className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  </nav>
);
```

Note: Add `relative` to each Link's className if the active indicator isn't positioning correctly.

- [ ] **Step 3: Verify in browser**

Navigate between tabs. Active tab shows in gold (`text-primary`). Inactive tabs are muted. Active indicator line appears at bottom of active tab.

- [ ] **Step 4: Commit**

```bash
git add src/components/BottomTabs.tsx
git commit -m "design: restyle BottomTabs with new tokens"
```

---

## Task 11: SideDrawer Restyle

**Files:**
- Modify: `src/components/SideDrawer.tsx`

- [ ] **Step 1: Read the current file**

Read `src/components/SideDrawer.tsx` to understand nav items and open/close logic.

- [ ] **Step 2: Update the drawer panel classNames only**

Replace the drawer panel container classes with:
```
bg-surface-container-high border-r border-outline-variant/60
```

Replace overlay backdrop with:
```
bg-black/60 backdrop-blur-sm
```

Replace nav link active state with:
```
active: bg-primary/10 text-primary
inactive: text-on-surface hover:bg-surface-container
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SideDrawer.tsx
git commit -m "design: restyle SideDrawer with new tokens"
```

---

## Task 12: Countdown Restyle

**Files:**
- Modify: `src/components/Countdown.tsx`

- [ ] **Step 1: Read the current file**

Read `src/components/Countdown.tsx` to understand the countdown logic and state.

- [ ] **Step 2: Restyle CountdownUnit blocks**

Each time unit block (days, hours, mins, secs) should become:

```tsx
<div className="flex flex-col items-center gap-1">
  <div className="bg-surface-container-high border border-outline-variant/60 rounded-xl px-4 py-3 min-w-[64px] text-center">
    <span className="font-display text-4xl text-on-surface tabular-nums leading-none">
      {String(value).padStart(2, "0")}
    </span>
  </div>
  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
    {label}
  </span>
</div>
```

- [ ] **Step 3: Update tournament state messages**

"Tournament In Progress" → use `<Badge variant="live">` with a pulsing dot:
```tsx
<Badge variant="live">
  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
  Live
</Badge>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Countdown.tsx
git commit -m "design: restyle Countdown with Bebas Neue display font and new tokens"
```

---

## Task 13: Home Page Rebuild

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Read the current file**

Read `src/app/page.tsx` fully. Note all data fetching hooks and component imports — keep all logic, replace only the markup/classNames.

- [ ] **Step 2: Replace the hero section**

```tsx
{/* Hero */}
<div className="relative px-4 pt-8 pb-6">
  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1">
    Lake Chelan · 2026
  </p>
  <h1 className="font-display text-5xl text-on-surface leading-none mb-4">
    THE BOSHAW<br />CLASSIC
  </h1>
  <Countdown />
</div>
```

- [ ] **Step 3: Wrap each section in `<Card>`**

Import `Card` from `@/components/ui` and wrap the weather section, tee times section, and leaderboard preview section in `<Card className="mx-4 mb-4">`.

- [ ] **Step 4: Verify page renders with all data**

Run dev server, open http://localhost:3000. Hero shows "THE BOSHAW CLASSIC" in Bebas Neue. Countdown renders. Cards display cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "design: rebuild Home page with new design system"
```

---

## Task 14: Leaderboard Page Rebuild

**Files:**
- Modify: `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Read the current file**

Read `src/app/leaderboard/page.tsx`. Note the data shape returned from the leaderboard API — specifically player name, scores, rank, score-to-par.

- [ ] **Step 2: Replace player rows with `<LeaderboardRow>`**

Import `LeaderboardRow` from `@/components/sport` and replace the existing row markup:

```tsx
{players.map((player, i) => (
  <LeaderboardRow
    key={player.id}
    rank={i + 1}
    name={player.displayName ?? player.name}
    avatarUrl={player.image}
    scoreToPar={player.scoreToPar}
    thru={player.thru}
    today={player.today}
    total={player.total}
    isCurrentUser={player.id === session?.user?.id}
    onPress={() => setExpandedPlayer(player.id)}
  />
))}
```

- [ ] **Step 3: Restyle round filter tabs**

Replace round filter buttons with a segmented control:

```tsx
<div className="flex bg-surface-container rounded-xl p-1 mx-4 mb-4">
  {rounds.map((round) => (
    <button
      key={round}
      onClick={() => setActiveRound(round)}
      className={[
        "flex-1 py-2 rounded-lg text-sm font-label font-medium uppercase tracking-wider transition-all active:scale-95",
        activeRound === round
          ? "bg-surface-container-high text-on-surface shadow-sm"
          : "text-on-surface-variant hover:text-on-surface",
      ].join(" ")}
    >
      {round}
    </button>
  ))}
</div>
```

- [ ] **Step 4: Add column headers**

Above the player rows:

```tsx
<div className="flex items-center gap-3 px-4 py-2 border-b border-outline-variant/40">
  <span className="w-8" />
  <span className="w-8" />
  <span className="flex-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Player</span>
  <div className="flex gap-4 text-right flex-shrink-0">
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant w-8">Thru</span>
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant w-8">Today</span>
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant w-10">Tot</span>
  </div>
</div>
```

- [ ] **Step 5: Verify leaderboard renders and expandable rows work**

- [ ] **Step 6: Commit**

```bash
git add src/app/leaderboard/page.tsx
git commit -m "design: rebuild Leaderboard with LeaderboardRow component and PGA Tour layout"
```

---

## Task 15: Scorecard Page Restyle

**Files:**
- Modify: `src/app/scorecard/page.tsx`

- [ ] **Step 1: Read the current file**

Read `src/app/scorecard/page.tsx`. Note the Card/Classic toggle logic, the hole grid structure, and the Wolf game section.

- [ ] **Step 2: Replace score cells with `<ScoreCell>`**

Import `ScoreCell` from `@/components/sport`. Replace each hole score rendering with:

```tsx
<ScoreCell
  score={scores[holeIndex] ?? null}
  par={hole.par}
  editable={isEditing}
  onClick={() => isEditing && handleHoleTap(holeIndex)}
/>
```

- [ ] **Step 3: Restyle hole number headers**

```tsx
<span className="font-display text-2xl text-on-surface-variant leading-none">{hole.number}</span>
```

- [ ] **Step 4: Replace Card/Classic toggle with segmented control**

Use the same segmented control pattern from Task 14 (round filter tabs).

- [ ] **Step 5: Wrap Wolf section in `<Card>` with gold accent border**

```tsx
<Card className="border-primary/30 bg-primary/5">
  {/* wolf content unchanged */}
</Card>
```

- [ ] **Step 6: Verify score entry still works end-to-end**

Enter a score, confirm it saves and the cell updates color correctly.

- [ ] **Step 7: Commit**

```bash
git add src/app/scorecard/page.tsx
git commit -m "design: rebuild Scorecard with ScoreCell components and new tokens"
```

---

## Task 16: Profile Page Restyle

**Files:**
- Modify: `src/app/profile/page.tsx`

- [ ] **Step 1: Read the current file**

Read `src/app/profile/page.tsx`. Note the form fields and save handler.

- [ ] **Step 2: Replace avatar with `<Avatar>` component and keep upload logic**

```tsx
<div className="relative">
  <Avatar src={avatarUrl} name={displayName} size="lg" />
  <button
    onClick={handleAvatarUpload}
    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-90 transition-transform"
    aria-label="Change avatar"
  >
    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>edit</span>
  </button>
</div>
```

- [ ] **Step 3: Replace form inputs with `<Input>` component**

```tsx
<Input
  label="Display Name"
  value={displayName}
  onChange={(e) => setDisplayName(e.target.value)}
  placeholder="Your name"
/>
<Input
  label="Handicap"
  type="number"
  value={handicap}
  onChange={(e) => setHandicap(e.target.value)}
  hint="Used for net score calculations"
/>
```

- [ ] **Step 4: Replace save button with `<Button>`**

```tsx
<Button onClick={handleSave} loading={saving} className="w-full">
  Save Profile
</Button>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/profile/page.tsx
git commit -m "design: rebuild Profile page with Avatar, Input, Button components"
```

---

## Task 17: Settings, Trip, Remaining Pages

**Files:**
- Modify: `src/app/settings/page.tsx`
- Modify: `src/app/trip/page.tsx`

- [ ] **Step 1: Settings — replace toggle switches**

Read `src/app/settings/page.tsx`. Replace inline toggle UI with:

```tsx
{/* Each setting row */}
<div className="flex items-center justify-between py-3 border-b border-outline-variant/30">
  <div>
    <p className="text-sm font-medium text-on-surface">{label}</p>
    {description && <p className="text-xs text-on-surface-variant">{description}</p>}
  </div>
  <button
    onClick={onToggle}
    role="switch"
    aria-checked={value}
    className={[
      "relative w-12 h-7 rounded-full transition-colors",
      value ? "bg-primary" : "bg-surface-container-highest",
    ].join(" ")}
  >
    <span
      className={[
        "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform",
        value ? "translate-x-6" : "translate-x-1",
      ].join(" ")}
    />
  </button>
</div>
```

Wrap admin actions (clear scores, manage groups) in a `<Card>` with `border-score-over/30` to visually separate danger actions.

- [ ] **Step 2: Trip — wrap in Card**

Read `src/app/trip/page.tsx`. Wrap the accommodation and amenities sections in `<Card className="mx-4 mb-4">`. No logic changes.

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/page.tsx src/app/trip/page.tsx
git commit -m "design: restyle Settings and Trip pages"
```

---

## Task 18: Final Polish & boshaw-brand Skill Update

**Files:**
- Modify: `src/components/ScoreToastProvider.tsx`
- Modify: `.claude/skills/boshaw-brand/SKILL.md`

- [ ] **Step 1: Update ScoreToast colors**

Read `src/components/ScoreToastProvider.tsx`. Update the toast banner colors to use new tokens:
- Ace: `bg-score-under text-white`
- Eagle: `bg-score-under/90 text-white`
- Birdie: `bg-primary text-on-primary`

- [ ] **Step 2: Update boshaw-brand skill with new design system**

Update `.claude/skills/boshaw-brand/SKILL.md` to reflect:
- New color tokens (navy/gold replacing teal)
- New typography (`font-display` → Bebas Neue, `font-headline/body/label` → Inter)
- Updated glass-card definition

- [ ] **Step 3: Final visual QA checklist**

Open the app and verify each page:
- [ ] Home: Bebas Neue hero, gold countdown, clean cards
- [ ] Leaderboard: PGA-style rows, score colors correct, round toggle works
- [ ] Scorecard: Score cells colored correctly, Wolf section gold-bordered
- [ ] Profile: Avatar, Input, Button components render correctly
- [ ] Settings: Toggle switches styled, danger section visually separated
- [ ] Trip: Clean card layout
- [ ] Dark/light mode toggle works on Settings page
- [ ] Bottom nav highlights correct active tab in gold

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "design: complete UI overhaul — navy/gold design system, Inter+Bebas Neue, component library"
```

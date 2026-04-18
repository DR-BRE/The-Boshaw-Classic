---
name: boshaw-brand
description: Apply Boshaw Classic brand identity — colors, typography, cards, score colors, animation, and copy tone. Trigger when creating or editing UI components, pages, or copy that must match the app's visual identity. Do NOT trigger for backend-only work (API routes, database queries, scoring logic) or when the user is only asking about data/structure.
allowed-tools: Read Glob Grep
---

# Brand Identity: The Boshaw Classic

Apply these rules whenever writing or reviewing UI code for this app. Check `$ARGUMENTS` — if it references a specific component or page, read that file first to confirm current patterns before editing.

The aesthetic is **PGA Tour modern** — dark navy surfaces, refined gold as the single accent, Bebas Neue display type over Inter body. Flat, premium, high-contrast. No decorative blur.

## Color System (Material Design 3)

All colors come from CSS custom properties defined in `src/app/globals.css`. Always use Tailwind token names — never raw hex values.

### Dark mode (default)
| Token | Value | Use |
|---|---|---|
| `bg-background` / `bg-surface` | `#0D1117` | Page background (navy-black) |
| `bg-surface-container` | `#161B22` | Standard cards |
| `bg-surface-container-high` | `#1C2128` | Elevated cards, toggle off-state |
| `bg-surface-container-highest` | `#21262D` | Hover targets, pressed states |
| `text-on-surface` | `#E6EDF3` | Body text, titles |
| `text-on-surface-variant` | `#8B949E` | Secondary text, labels |
| `text-primary` / `bg-primary` | `#C9A227` | Gold accent (the only accent), primary CTAs, birdie scores |
| `text-on-primary` | `#1A1400` | Text on gold backgrounds |
| `text-secondary` | `#8B949E` | Muted slate — use sparingly, it is NOT an accent |
| `text-tertiary` / `bg-tertiary` | `#58A6FF` | Info blue — second peer accent (use for Group chips, status) |
| `text-outline` / `border-outline-variant` | `#484F58` / `#30363D` | Borders, dividers |
| `text-score-under` / `bg-score-under` | `#3FB950` | Under-par scores (ace, eagle), live/success state |
| `text-score-over` / `bg-score-over` | `#F85149` | Over-par scores (bogey+), error state |
| `text-score-par` | `#8B949E` | Even-par score display |
| `text-on-error-container` | `#F85149` | Destructive action copy, danger borders |

### Light mode (`.light` class on `<body>`)
Light mode values are defined as an override block in `globals.css`. The `.light` class is required — do not use `@media (prefers-color-scheme: light)`. All the same token names apply; values shift to light-mode equivalents automatically.

### Score color system (complete — match StatBadge + ScoreCell)
```tsx
// StatBadge (totals, to-par deltas)
if (value < 0) return "text-score-under";   // under par — green
if (value > 0) return "text-score-over";    // over par — red
return "text-score-par";                    // even — slate

// ScoreCell (per-hole vs par)
if (score === 1)       return "text-score-under bg-score-under/20 border-score-under/40 font-bold";
if (score <= par - 2)  return "text-score-under bg-score-under/15 border-score-under/30 font-bold";
if (score === par - 1) return "text-primary    bg-primary/15    border-primary/30    font-semibold"; // birdie = gold
if (score === par)     return "text-on-surface";
if (score >= par + 1)  return "text-score-over bg-score-over/10 border-score-over/30";
```

Gold is reserved for birdies specifically — it signals "notable but not rare." Green (score-under) carries eagles and aces because they are rarer and score-under intensifies the meaning.

### Wolf game colors (yellow-500, NOT gold primary)
Wolf UI intentionally uses a different yellow to distinguish it from the app's primary gold accent:
- Background tints: `bg-yellow-500/10`, `bg-yellow-500/15`, `bg-yellow-500/5`
- Borders: `border-yellow-500/20`, `border-yellow-500/30`
- Text: `text-yellow-500`
- Headers: `bg-yellow-500/20`

## Typography

Two faces only. Both loaded via `next/font/google` in `src/app/layout.tsx`.

```
font-display  →  Bebas Neue, sans-serif   (page titles, big numbers, countdown digits)
font-headline →  Inter, sans-serif        (section heads, card titles — use font-semibold/bold)
font-body     →  Inter, sans-serif        (body text)
font-label    →  Inter, sans-serif        (metadata, column headers, button text — use uppercase tracking-widest)
```

**Display pattern** (page headers — use sparingly, one per screen):
```jsx
<h2 className="font-display text-4xl text-on-surface leading-none mb-6">LEADERBOARD</h2>
```

**Headline pattern** (section heads inside cards):
```jsx
<h3 className="font-headline text-lg font-semibold text-on-surface">Tournament Info</h3>
```

**Label pattern** (column headers, metadata, status badges, buttons):
```jsx
<span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
  GROUP 1
</span>
```

Use `tabular-nums` on any numeric value that might update in place (scores, times, handicaps) to prevent width jitter.

## Cards

Prefer the `<Card>` primitive from `@/components/ui`:
```jsx
import { Card } from "@/components/ui";

<Card>...</Card>                            // default padding p-4, bg-surface-container
<Card elevated>...</Card>                   // bg-surface-container-high
<Card noPadding>...</Card>                  // use when children include their own padding/headers
<Card className="border-on-error-container/30">...</Card>  // destructive/danger framing
```

The `.glass-card` utility class still exists for legacy spots but has been flattened — it now uses solid `surface-container` + `outline-variant` border, **no backdrop blur**. New UI should use the `<Card>` primitive.

**Rounded corner hierarchy:**
- Pills / badges: `rounded-full`
- Small buttons / inputs: `rounded-lg` or `rounded-md`
- Cards: `rounded-xl` (Card primitive default)
- Large modals / sheets: `rounded-2xl` or `rounded-3xl`

**Dividers:**
- Within cards: `border-b border-outline-variant/30`
- Between sections / major groupings: `border-b border-outline-variant/60`
- Sticky / group separator rows in tables: `bg-surface-container-high`

## Interactive States

Every tappable element needs tactile press feedback and meets 44×44 touch-target minimums:
```
active:scale-95 transition-transform      (standard)
active:scale-90 transition-transform      (strong press, icon buttons)
active:scale-[0.97] transition-transform  (wide bars, subtle)
disabled:opacity-30
hover:bg-surface-container-high           (hover on cards/rows)
```

Toggle switches use `role="switch"` + `aria-checked`:
```jsx
<button role="switch" aria-checked={value} aria-label={label}
  className={`w-12 h-7 rounded-full transition-colors ${value ? "bg-primary" : "bg-surface-container-highest"}`}>
  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
</button>
```

## Animation

**Score toast banner** (birdie/eagle/ace) — animations in `globals.css`:
- Entry: `animate-score-banner-in` (450ms `cubic-bezier(0.22, 1, 0.36, 1)`)
- Exit: `animate-score-banner-out` (300ms `cubic-bezier(0.4, 0, 1, 1)`)
- Visibility window: 4500ms + 300ms exit
- Fire delay: 10000ms (`CONFIRM_DELAY_MS`) to suppress mis-tap celebrations
- Banner accent by kind: ace → yellow (extra-rare flair), eagle → score-under green, birdie → primary gold

**Confetti by rarity** (`canvas-confetti`) — palette uses new tokens:
- Ace: 220 particles, 140° spread, side blasts at 180ms
- Eagle: 140 particles, 110° spread
- Birdie: 80 particles, 80° spread
- Colors: `["#C9A227", "#FFE088", "#3FB950", "#FFFFFF", "#FF6B6B"]`

**Loading skeleton:** use the `<Skeleton>` primitive (or `bg-surface-container-high animate-pulse rounded-xl h-[Npx]`).

**Live polling:** 5000ms interval with `setInterval` + cleanup in `useEffect`.

**Status pulse:** `text-score-over animate-pulse` (or `text-red-400`) for live indicator dot.

## Icons

Material Symbols (Google) via `material-symbols-outlined` class. Filled variant:
```jsx
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
  trophy
</span>
```

Custom images: `/wolf.png`, `/trophy.png`, `/trophy-silver.png` for ranking/wolf UI.
Rankings use Unicode: 🏆 (1st), 🥈 (2nd), 🥉 (3rd), 💩 (last).

## UI Copy Conventions

**Official name:** "The Boshaw Classic" — always spelled out, never abbreviated.

**Page titles:** Bebas Neue, ALL CAPS, no trailing punctuation.
- `HOME`, `LEADERBOARD`, `SCORECARD`, `PROFILE`, `SETTINGS`, `TRIP INFO`

**Label copy:** ALL CAPS, no punctuation:
- Columns: `HOLE`, `PAR`, `HCP`, `YDS`, `FRONT 9`, `BACK 9`
- Tabs: `ROUND 1`, `ROUND 2`
- Score columns: `TODAY`, `THRU`, `GROSS`, `NET`, `R1`, `R2`, `TOT`

**Wolf terminology:** Wolf, Lone Wolf, Wolf Partner, Wolf Pick, Wolf Pts, Wolf Standings.

**Score toast labels** (inside banner, ALL CAPS): `HOLE IN ONE`, `EAGLE`, `BIRDIE`.

**Empty states:** Friendly and informative, sentence case:
- "Scores will appear here once the tournament begins."
- "No scores yet."

**Action copy:** Minimal, verb-forward: "Save", "Pick", "Lone", "View Full Leaderboard", "Shuffle Wolf Order".

## Layout Conventions

- Page padding: `px-4 py-6` (mobile-first), add `pb-24` on pages that sit under the bottom tab bar
- Flex gaps: `gap-3`, `gap-4`, `gap-6`
- Viewport height: `h-[calc(100vh-12rem)]` with `h-[calc(100dvh-12rem)]` fallback
- Horizontal scroll tables: `overflow-x-auto` with `-webkit-overflow-scrolling: touch`
- Sticky table column: `sticky left-0 z-10`
- Modal overlay: `fixed inset-0 bg-black/60 backdrop-blur-sm z-50`
- Z-index scale: content `z-0`, sticky headers `z-10`, bottom nav `z-40`, modals/sheets `z-50`

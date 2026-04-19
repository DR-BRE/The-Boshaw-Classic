---
name: boshaw-components
description: Scaffold or edit UI components matching the Boshaw Classic's exact Tailwind patterns — layout shell, navigation, cards, buttons, inputs, modals, loading states, and bottom tabs. Trigger when building new pages or components, or when asked to match the existing visual style. Do NOT trigger for API routes, database work, or scoring logic.
allowed-tools: Read Glob Grep
---

# Component Conventions: The Boshaw Classic

All UI sits on top of a small primitive library in `src/components/ui/` and `src/components/sport/`. **Reach for a primitive before writing inline Tailwind.** When you must go inline, match the flat, high-contrast PGA Tour aesthetic in the `boshaw-brand` skill — no white-overlay glass, no decorative blur, `bg-primary` (gold) is the single CTA accent.

Before editing, read `$ARGUMENTS` to understand the feature, and skim 1–2 similar pages to confirm patterns.

## What's in the box

```tsx
import { Button, Card, Badge, Input, Modal, Skeleton, Avatar } from "@/components/ui";
import { StatBadge, ScoreCell, LeaderboardRow } from "@/components/sport";
```

Use these unless you have a specific reason not to. `BottomTabs`, `SideDrawer`, and `ScoreToastProvider` are already mounted by `LayoutShell` — do not re-implement them.

## Surface tokens at a glance

| Use | Token |
|---|---|
| Page background | `bg-background` (already set at shell level) |
| Standard card | `bg-surface-container` + `border-outline-variant/40` |
| Elevated card / drawer / modal panel | `bg-surface-container-high` + `border-outline-variant/60` |
| Pressed / hovered row | `bg-surface-container-highest` or `hover:bg-surface-container-high` |
| Toggle off-state | `bg-surface-container-highest` |
| Danger framing | `border-on-error-container/30` + copy in `text-on-error-container` |

Never use `bg-white/[0.0N]` for new surfaces — that's the old glass look and has been removed everywhere except the LayoutShell floating icons (see below).

## Primitives

### Card — `src/components/ui/card.tsx`

Default: `bg-surface-container` + `border-outline-variant/40` + `p-4` + `rounded-xl`.

```tsx
<Card>...</Card>                                              // standard
<Card elevated>...</Card>                                     // bg-surface-container-high, stronger border
<Card noPadding>...</Card>                                    // children control padding — use for list-style cards
<Card className="mx-4 mb-4">...</Card>                        // typical page placement
<Card className="border-on-error-container/30">...</Card>     // destructive framing
```

**Card with icon + title:**
```tsx
<Card className="mx-4 mb-4">
  <div className="flex items-center gap-2 mb-3">
    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>
      partly_cloudy_day
    </span>
    <h3 className="font-headline text-xl font-semibold text-on-surface">Weather</h3>
  </div>
  {/* body */}
</Card>
```

**Card with full-bleed list (use `noPadding`):**
```tsx
<Card noPadding className="mx-4 mb-4 overflow-hidden">
  <div className="px-5 pt-5 pb-3 flex items-center gap-2">
    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>schedule</span>
    <h3 className="font-headline text-xl font-semibold text-on-surface">Tee Times</h3>
  </div>
  {items.map((item, i) => (
    <div key={item.id} className={`px-5 py-4 ${i > 0 ? "border-t border-outline-variant/30" : ""}`}>
      ...
    </div>
  ))}
</Card>
```

### Button — `src/components/ui/button.tsx`

Variants: `primary` (default, gold), `secondary` (outline), `ghost`, `danger`. Sizes: `sm` (36px min) | `md` (44px, default) | `lg` (52px).

```tsx
<Button onClick={handleSave}>Save</Button>                         // gold CTA
<Button variant="secondary" onClick={onClose}>Cancel</Button>      // outlined
<Button variant="ghost" onClick={() => signOut()} className="w-full">
  Sign Out
  <span className="material-symbols-outlined text-base">logout</span>
</Button>
<Button variant="danger">Delete</Button>                           // outlined red
<Button loading disabled={!valid} className="mt-6 w-full">Update Profile</Button>
```

**Primary CTAs are `bg-primary text-on-primary` — gold.** Never `bg-secondary text-on-secondary`; `secondary` is now muted slate, not an accent. The admin action buttons (Add Player, Save Groups, etc.) all use primary gold.

### Input — `src/components/ui/input.tsx`

```tsx
<Input
  label="Display Name"
  value={displayName}
  onChange={(e) => setDisplayName(e.target.value)}
  placeholder="Ryan B."
  hint="Shown on the leaderboard"
/>

<Input label="Handicap" type="number" min={0} max={54} error={err} />
```

44px min-height, `bg-surface-container` + `border-outline-variant/60`, focuses to `border-primary`. `error` prop swaps border + hint to `score-over` red.

### Badge — `src/components/ui/badge.tsx`

Uppercase, tracked, bordered pill. Variants: `default` | `gold` | `success` | `danger` | `muted` | `live`.

```tsx
<Badge>STATUS</Badge>
<Badge variant="gold">LEADER</Badge>
<Badge variant="success">UNDER</Badge>
<Badge variant="danger">OVER</Badge>
<Badge variant="muted">Live Updates</Badge>
<Badge variant="live">
  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
  Live
</Badge>
```

### Modal — `src/components/ui/modal.tsx`

```tsx
<Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Score" size="sm">
  <p className="text-sm text-on-surface-variant">Score will be recalculated immediately.</p>
  <div className="flex gap-3">
    <Button variant="secondary" onClick={() => setShowEdit(false)} className="flex-1">Cancel</Button>
    <Button onClick={save} className="flex-1">Save</Button>
  </div>
</Modal>
```

Escape key closes, overlay click closes, body scroll locked while open. Panel: `bg-surface-container-high border-outline-variant/60 rounded-2xl p-6`. Sizes `sm` / `md` (default) / `lg`.

### Skeleton — `src/components/ui/skeleton.tsx`

```tsx
<div className="px-4 py-6 space-y-3">
  <Skeleton height="h-16" />
  <Skeleton height="h-16" />
  <Skeleton height="h-16" />
</div>
```

Always prefer skeletons over spinners (spinners appear only inside `<Button loading />`).

### Avatar — `src/components/ui/avatar.tsx`

```tsx
<Avatar src={player.avatarUrl} name={player.displayName} size="lg" />
<Avatar src={null} name="Ryan Boshaw" size="sm" />   // falls back to initials "RB"
```

Sizes: `sm` (32px), `md` (40px, default), `lg` (56px). Wrapper is `rounded-full bg-surface-container-high border-outline-variant/60`.

## Sport Components

### StatBadge — total / to-par delta
```tsx
<StatBadge value={-3} />   // "-3" in text-score-under (green)
<StatBadge value={0} />    // "E" in text-score-par (slate)
<StatBadge value={2} />    // "+2" in text-score-over (red)
```

### ScoreCell — per-hole score vs par
```tsx
<ScoreCell score={3} par={4} editable onClick={() => openEditor(holeIdx)} />
<ScoreCell score={null} par={4} editable onClick={() => openEditor(holeIdx)} />   // dashed empty slot
```
Color map (don't reinvent):
- `1` (ace) and `≤ par−2` (eagle+) → score-under green, bold
- `par−1` (birdie) → **primary gold**, semibold (gold is reserved for birdies)
- `par` → on-surface neutral
- `≥ par+1` (bogey+) → score-over red

### LeaderboardRow
```tsx
<LeaderboardRow
  rank={1}
  name="Ryan B."
  avatarUrl={player.avatarUrl}
  scoreToPar={-4}
  thru={18}
  today={-2}
  total={68}
  isCurrentUser
  onPress={() => goToPlayer(player.id)}
/>
```
Renders rank icon (🏆 🥈 🥉 or digit), avatar, name, thru, today, total. Current user gets `bg-primary/5 border-l-2 border-l-primary`. Hover: `hover:bg-surface-container`, press: `active:bg-surface-container-high`.

## Navigation

### BottomTabs — `src/components/BottomTabs.tsx`

Mounted globally by `LayoutShell`. To add a route, append to the `tabs` array there. The structural pattern:
- Bar: `fixed bottom-0 left-0 right-0 z-40 bg-surface-container border-t border-outline-variant/40 pb-safe`, height `h-16`
- Active tab: `text-primary`, filled icon (`'"FILL" 1'`), 0.5px gold underline bar (`absolute bottom-0 w-12 h-0.5 bg-primary rounded-full`)
- Inactive tab: `text-on-surface-variant`, unfilled icon
- Pressed: `active:bg-surface-container-high`
- Label: `text-[10px] font-label font-medium uppercase tracking-wider`

### SideDrawer — `src/components/SideDrawer.tsx`

Also mounted by `LayoutShell`. Pattern:
- Overlay: `fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300`
- Panel: `fixed top-0 left-0 z-50 h-full w-72 bg-surface-container-high border-r border-outline-variant/60 transition-transform duration-300 ease-out` (slides via `translate-x-0` / `-translate-x-full`)
- Active link: `bg-primary/10 text-primary` + filled icon
- Inactive link: `text-on-surface hover:bg-surface-container`
- Link container: `flex items-center gap-3 px-3 py-3 rounded-xl transition-colors`

### LayoutShell floating icons — the one remaining glass surface

The hamburger (top-left) and avatar (top-right) still use a translucent floating pill so they sit legibly over arbitrary page content. **This is the only place glass is allowed.**

```
fixed top-3 {left|right}-3 z-40 w-10 h-10 rounded-full
bg-white/[0.06] backdrop-blur-xl border border-white/[0.06]
flex items-center justify-center active:scale-90 transition-transform
```

Everywhere else uses flat `bg-surface-container*` tokens. If you're tempted to reach for `bg-white/[0.0N]`, stop and use a surface token.

## Inline patterns (when a primitive doesn't fit)

### Toggle switch (canonical `role="switch"`)
```tsx
<button
  onClick={() => onChange(!enabled)}
  role="switch"
  aria-checked={enabled}
  aria-label={label}
  className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-surface-container-highest"}`}
>
  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
</button>
```

### Circular icon button (primary action)
```tsx
<button className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-on-primary active:scale-90 transition-transform">
  <span className="material-symbols-outlined text-lg">person_add</span>
</button>
```

### Circular icon button (neutral / close)
```tsx
<button className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-highest flex items-center justify-center active:scale-90 transition-transform">
  <span className="material-symbols-outlined text-on-surface-variant text-lg">close</span>
</button>
```

### Surface button (tappable list row)
```tsx
<button className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 active:scale-[0.98] transition-transform">
  <span className="font-label text-sm font-bold text-on-surface">Row label</span>
  {/* trailing chip or chevron */}
</button>
```

### Destructive inline icon button
```tsx
<button className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-red-500/15 text-red-400 active:scale-90 transition-transform">
  <span className="material-symbols-outlined text-lg">close</span>
</button>
```

### Full-width pill CTA (when you can't use `<Button>` for some reason)
```tsx
<button
  disabled={busy}
  className="w-full py-3 rounded-xl bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-wider active:scale-[0.97] transition-transform disabled:opacity-50"
>
  {busy ? "Saving…" : "Save"}
</button>
```
Prefer `<Button size="lg" className="w-full">` unless you need non-standard vertical rhythm.

### Link-style footer action inside a card
```tsx
<Link
  href="/leaderboard"
  className="flex items-center justify-center gap-1 px-5 py-3 border-t border-outline-variant/30 text-primary hover:bg-surface-container-high font-label font-bold text-xs uppercase tracking-widest transition-colors"
>
  View Full Leaderboard
  <span className="material-symbols-outlined text-sm">arrow_forward</span>
</Link>
```

### Inline input (matching primitive without label)
```tsx
<input
  type="text"
  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface font-label text-sm placeholder:text-on-surface-variant/50 outline-none focus:border-primary/50"
/>
```

## Modals without the primitive

Use `<Modal>` unless you need structural control it doesn't give you (bottom-sheet-only layout, non-standard panel shape, hole-picker keypad, wolf partner picker, etc.). Match the surface tokens:

```tsx
<div
  className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  onClick={onClose}
>
  <div
    className="w-full max-w-sm bg-surface-container-high border border-outline-variant/60 rounded-2xl p-6"
    onClick={(e) => e.stopPropagation()}
  >
    {/* ... */}
  </div>
</div>
```

Wolf-game modals swap the panel border for `border-yellow-500/20` (wolf yellow is intentionally distinct from gold — see brand skill).

## Loading, empty & error states

**Loading:** `<Skeleton>` stacks — never spinners in page bodies.
```tsx
if (loading) return (
  <div className="px-4 py-6 space-y-3">
    <Skeleton height="h-16" />
    <Skeleton height="h-16" />
    <Skeleton height="h-16" />
  </div>
);
```

**Empty:** friendly, sentence case, inside a `<Card>`.
```tsx
<Card className="mx-4 text-center py-8">
  <span className="material-symbols-outlined text-primary text-3xl mb-2 block">sports_golf</span>
  <p className="font-headline text-lg text-on-surface">Tournament starts October 4</p>
  <p className="text-xs text-on-surface-variant mt-1">Scores will appear here once play begins.</p>
</Card>
```

**Error framing:** `<Card className="border-on-error-container/30">...</Card>`, copy in `text-on-error-container`.

## Typography cheatsheet

Canonical rules live in the `boshaw-brand` skill. Shortcut for scaffolds:

| Thing | Classes |
|---|---|
| Page title | `font-display text-4xl text-on-surface leading-none mb-6` (content ALL CAPS, no period) |
| Hero display | `font-display text-5xl text-on-surface leading-none mb-6` |
| Card title | `font-headline text-xl font-semibold text-on-surface` |
| Section head inside card | `font-headline text-lg font-semibold text-on-surface mb-4` |
| Body | default `text-on-surface` — use `text-sm` for compact rows |
| Metadata / column labels | `font-label text-xs uppercase tracking-widest text-on-surface-variant` |
| Tab / tiny label | `font-label text-[10px] uppercase tracking-wider` |
| Any live number | add `tabular-nums` |

## Group chips (Group 1 / Group 2)

Group 1 is **tertiary blue**; Group 2 is **primary gold**. Both read as peer accents — never reuse muted `text-secondary` for either.

```tsx
<span
  className={`font-label text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
    group === 1 ? "bg-tertiary/20 text-tertiary"
      : group === 2 ? "bg-primary/20 text-primary"
      : "bg-surface-container-high text-on-surface-variant"
  }`}
>
  {GROUP_LABELS[group]}
</span>
```

## Dividers

- Row-within-card: `border-b border-outline-variant/20` or `border-t border-outline-variant/30`
- Section separator inside a card: `border-t border-outline-variant/30`
- Heavier section split: `border-b border-outline-variant/40` or `/60`
- Sticky group header row inside a table: `bg-surface-container-high`
- **Do not** use `border-white/[0.0N]` — that's the old glass look.

## Tap feedback

Every tappable element wears one:
- Buttons / wide bars: `active:scale-[0.97] transition-transform`
- Standard rows / pills: `active:scale-95 transition-transform`
- Icon buttons: `active:scale-90 transition-transform`
- Hoverable non-button rows: `hover:bg-surface-container-high` or `hover:bg-surface-container`
- Disabled: `disabled:opacity-40` (primitives) / `disabled:opacity-50` (inline CTAs)

44×44 minimum touch target. `<Button size="md">` enforces 44px; `<Button size="lg">` enforces 52px.

## Icons

Material Symbols via the `material-symbols-outlined` class. Fill active or selected states:
```tsx
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
```
Default tint for decorative section icons is `text-primary` (gold). For informational secondary icons use `text-on-surface-variant`.

Custom images: `/wolf.png`, `/trophy.png`, `/trophy-silver.png`. Ranking emoji: 🏆 🥈 🥉 💩.

## Responsive

Mobile-first. Limited `sm:` use for small tablets (size/gap bumps, `sm:items-center` on modal alignment). Do not add `lg:`/`xl:` unless specifically asked.

## Page shell pattern

```tsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, Skeleton } from "@/components/ui";

export default function Page() {
  const { status } = useSession();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      fetch("/api/endpoint", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); });

    load();
    // Drop the interval if the page isn't live.
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (status === "unauthenticated") return <SignInPrompt />;
  if (loading) {
    return (
      <div className="px-4 py-6 space-y-3">
        <Skeleton height="h-16" />
        <Skeleton height="h-16" />
        <Skeleton height="h-16" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24">
      <h2 className="font-display text-4xl text-on-surface mb-6 leading-none">PAGE TITLE</h2>
      <Card className="mb-4">{/* ... */}</Card>
    </div>
  );
}
```

Layout notes:
- Outer wrapper: `px-4 py-6 pb-24` clears the bottom tab bar. Use `pb-28` / `pb-32` for dense content.
- `LayoutShell` already wraps `<main>` in `pt-6 pb-32`; don't double up vertical padding.
- Live polling: `setInterval` at 5000ms with cleanup in `useEffect` return.
- Hide hamburger/avatar on full-bleed pages by adding the route to `hideHamburger` / `hideAvatar` arrays in `LayoutShell`.

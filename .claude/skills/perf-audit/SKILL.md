---
name: perf-audit
description: Run a Lighthouse performance audit, parse the results, and suggest fixes specific to this Next.js + Tailwind + Prisma stack
disable-model-invocation: true
allowed-tools: Bash(npm run *) Bash(npx lighthouse *) Bash(npx next *) Bash(lsof *) Read Grep Glob
---

# Performance Audit

Run a Lighthouse audit and provide actionable, stack-specific optimization suggestions.

## Steps

### 1. Check if dev server is running

Check if anything is listening on port 3001 (`lsof -i :3001`). If not, tell the user to start it with `npm run dev -- -p 3001` in another terminal.

### 2. Run Lighthouse

Run `npm run lighthouse` which executes:
```
lighthouse http://localhost:3001 --output html --output-path ./lighthouse-report.html --chrome-flags="--headless=new"
```

### 3. Parse Results

Read `./lighthouse-report.html` and extract the key scores:
- Performance
- Accessibility
- Best Practices
- SEO

### 4. Analyze & Recommend

Based on the scores and this project's specific architecture, check for and recommend fixes in these areas:

**Client-side rendering weight:**
- Most pages use `"use client"` — identify any that could be server components
- Check for unnecessary `useEffect` + `fetch` patterns that could use server-side data fetching

**Polling overhead:**
- Leaderboard polls every 5 seconds — suggest alternatives if performance is impacted (e.g., reduce frequency, use visibility API to pause when tab is hidden)

**Bundle size:**
- Check for large dependencies that could be lazy-loaded
- Verify Tailwind is tree-shaking unused styles (Tailwind 4 does this by default)

**Image optimization:**
- Avatars loaded from Vercel Blob — ensure they use `next/image` with proper sizing
- Check for unoptimized images in public/

**Font loading:**
- Project uses Noto Serif and Manrope — verify they're loaded efficiently (preload, font-display swap)

**Caching:**
- Some API routes set `Cache-Control: no-store` — verify this is intentional for real-time data
- Static pages/assets should have proper caching headers

## Output

Present findings as a prioritized list:
1. **Critical** — Issues causing major score drops
2. **Moderate** — Noticeable improvements available
3. **Minor** — Polish items

Include the Lighthouse scores and specific file paths for each recommendation.

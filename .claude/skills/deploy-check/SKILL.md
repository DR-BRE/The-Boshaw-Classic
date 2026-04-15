---
name: deploy-check
description: Pre-deployment checklist — run build, lint, Prisma migration status, and optional Lighthouse audit before deploying to Vercel
disable-model-invocation: true
allowed-tools: Bash(npx *) Bash(npm run *)
---

# Deploy Check

Run through each step below **sequentially**. Report a clear pass/fail for every step. Stop early if a critical step fails (build or migration status).

## Steps

1. **Prisma migration status** — Run `npx prisma migrate status` to check for pending or failed migrations. If any migrations have not been applied, report them and stop.

2. **Prisma generate** — Run `npx prisma generate` to ensure the generated client at `src/generated/prisma` is up to date.

3. **Lint** — Run `npm run lint`. Report any errors. Warnings are acceptable.

4. **Build** — Run `npm run build` (this runs `prisma generate && next build`). If the build fails, report the error and stop.

5. **Lighthouse (optional)** — If the user asked for a performance check, or passed `--lighthouse`:
   - Confirm the dev server is running on port 3001 (or start it with `npm run dev -- -p 3001`)
   - Run `npm run lighthouse`
   - Summarize the scores from `./lighthouse-report.html`

## Output

After all steps, print a summary table:

| Step | Status |
|------|--------|
| Migration status | pass/fail |
| Prisma generate | pass/fail |
| Lint | pass/fail |
| Build | pass/fail |
| Lighthouse | pass/fail/skipped |

If everything passes, confirm the project is ready to deploy to Vercel.

---
name: prisma-migrate
description: End-to-end Prisma database migration workflow — edit schema, create migration, generate client, optionally seed
disable-model-invocation: true
allowed-tools: Bash(npx prisma *) Bash(node prisma/seed.mjs) Read Edit Write
---

# Prisma Migrate

Handle database schema changes end-to-end for this project.

## Project Database Context

- **Schema:** `prisma/schema.prisma`
- **Generated client:** `src/generated/prisma/client` (via `@prisma/adapter-pg`)
- **Database:** PostgreSQL on Neon (`DATABASE_URL` env var)
- **Seed script:** `node prisma/seed.mjs`
- **Models:** User, Account, Session, VerificationToken, Player, Score, WolfOrder, WolfPick

## Workflow

Based on `$ARGUMENTS`, perform the relevant steps:

### If the user wants to add/change a model or field:

1. **Read** the current `prisma/schema.prisma`
2. **Edit** the schema with the requested changes
3. **Create migration** — Run `npx prisma migrate dev --name <descriptive-name>` where the name is a short kebab-case description of the change (e.g., `add-player-email`, `make-handicap-optional`)
4. **Generate client** — Run `npx prisma generate` to regenerate the TypeScript client
5. **Verify** — Confirm the migration was applied and the generated types reflect the change
6. If the change affects seed data, update `prisma/seed.mjs` accordingly

### If the user wants to check migration status:

1. Run `npx prisma migrate status`
2. Report any pending or failed migrations

### If the user wants to reset and reseed:

1. Run `npx prisma migrate reset` (this drops and recreates the database, then runs all migrations and the seed script)
2. Confirm the reset completed

### If the user wants to seed:

1. Run `node prisma/seed.mjs`
2. Report success or errors

## Important

- Always read the current schema before making changes
- Use descriptive migration names in kebab-case
- After any schema change, always regenerate the client
- The seed script uses ESM (`seed.mjs`) — run with `node`, not `npx ts-node`

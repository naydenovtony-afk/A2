# Aktivni Zaedno — guidance for AI agents

"Aktivni Zaedno" ("Active Together") is a Bulgarian civic-tech platform for mass/amateur sport:
find sports partners, organize activities, build sports communities. Any sport, any age, any city.

## Source of truth
- `docs/aktivni-zaedno-concept-en.pdf` — full concept (roles, data model, API, 12 development steps).
- Later decisions override the PDF; they are recorded in this file. When the two differ, this file wins.

## Repository layout (npm workspaces, Node 24, npm 11 — no pnpm)
- `az-web/` — Next.js (App Router) + React + Tailwind. Web UI, Server Actions, REST API for mobile. See `az-web/AGENTS.md`.
- `az-mobile/` — Expo / React Native app (built in step 11). See `az-mobile/AGENTS.md`.
- `az-shared/` — shared TypeScript types, validation schemas and constants (sports list, locales, levels).
  Consumed as TypeScript source (no build step); `az-web` transpiles it via `transpilePackages`.

## Commands (run from the repo root)
- `npm install` — install all workspaces.
- `npm run dev` — start the web app on http://localhost:3000.
- `npm run build` / `npm run lint` / `npm run typecheck`.

## Working rules
- Work in small steps following the PDF's development order. After each step: build, type-check, lint,
  run the app, then commit and push to `main`. Do not install or configure anything beyond the current step.
- When something is ambiguous or needs a product decision, ask instead of guessing.
- Code, comments and commit messages in English. User-facing text only via translation files (bg default, en).
- Never commit secrets. `.env*` is git-ignored (except `.env.example`); the repo is public.
  The Neon connection string lives only in `az-web/.env.local`.
- The project path contains a space (`Projects Softuni`): always quote paths in shell commands.

## Key product decisions
- Activity status is derived, never stored: upcoming / ongoing (startsAt .. startsAt + durationMinutes,
  default 120) / finished / canceled. "Active" = upcoming or ongoing and not canceled.
- A public activity in a public community can be joined without community membership; an activity in a
  closed community requires membership. Joining an activity grants its group chat, not the community.
- Members are never blocked when capacity is full. Extra spots +1/+2/+3 when joining.
- Group chat replaces comments; it becomes read-only when the activity is finished or canceled.
- "Add as friend" lives in an active activity's chat. Direct messages only for ACCEPTED friendships.
- Chat transport: polling every 3–5 s behind the service layer (swappable for Pusher/Ably later).
- Sports list is a constant in `az-shared`, not a DB table.
- Timestamps are `timestamptz`; display in Europe/Sofia.
- No photo uploads yet (initials avatars). Demo account: demo@aktivnizaedno.bg / demo123.
- Out of scope for now: ratings/reputation, push notifications, Europe expansion.
- Pre-pilot safety (design for, not blocking): minimum age / parental consent (Bulgaria's GDPR digital
  consent age is 14 — re-verify before hard-coding), block and report, account deletion, privacy policy.

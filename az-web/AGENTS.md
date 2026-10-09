<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# az-web — guidance for AI agents

Read the root `AGENTS.md` first. In this workspace, `next` is hoisted to the repo root, so the bundled
docs are at `../node_modules/next/dist/docs/`.

## Next.js 16 specifics used here
- `cacheComponents` and `partialPrefetching` are enabled in `next.config.ts`.
- Middleware is called **Proxy** in Next 16: `src/proxy.ts` (runs next-intl locale routing).
- `PageProps<"/route">` / `LayoutProps<"/route">` are global type helpers; run `npm run typecheck`
  (which runs `next typegen` first) to regenerate route types.

## Structure (target)
- `src/app/[locale]/` — all pages and layouts live under the locale segment (`/bg`, `/en`).
- `src/app/api/` — REST endpoints for the mobile app (JWT in the Bearer header). Not localized.
- `src/services/` — business logic. Used by BOTH Server Actions and REST handlers; no logic in route handlers.
- `src/db/` — Drizzle schema; `src/drizzle/` — Drizzle Kit migrations (every schema change via a migration).
- `src/i18n/` — next-intl routing, request config and navigation helpers.
- `messages/bg.json`, `messages/en.json` — all user-facing strings. `bg.json` is the type source for keys.

## Conventions
- Server components by default; `"use client"` only where interactivity is needed.
- Never hardcode user-facing strings — use `useTranslations` / `getTranslations` and add keys to BOTH files.
- Use `Link`, `redirect`, `useRouter`, `usePathname` from `@/i18n/navigation`, not from `next/*`.
- Every page/layout under `[locale]` calls `setRequestLocale(locale)` so it can render statically.
- Server-side paging everywhere; add DB indexes together with the queries that need them.
- Auth: `bcryptjs` hashing, `jose` JWT; httpOnly cookie for web, Bearer header for the API.
- Leaflet must be loaded client-side only (dynamic import, no SSR). OpenStreetMap tiles for the pilot.

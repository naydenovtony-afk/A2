# az-mobile — guidance for AI agents

Read the root `AGENTS.md` first.

This workspace is a placeholder until step 11 of the development plan. Then it becomes an Expo /
React Native app (add it to the root `workspaces` at that point).

## Planned scope (limited complement to the web app)
- Login and registration, list of active activities, activity details, join / leave, extra spots, chat.
- Talks only to the REST API in `az-web/src/app/api/` with a JWT in the `Authorization: Bearer` header.
- Shares types and constants with the web app through `az-shared`.
- Bulgarian (default) + English; no hardcoded user-facing strings.

## Notes
- The repo path contains a space (`Projects Softuni`). If Metro/Expo or a native build fails because of it,
  stop and report it instead of working around it silently.

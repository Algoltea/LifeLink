# Repository guide

LifeLink is a Bun/Turborepo workspace. Read the root README for product behavior, setup, environment variables, and the limits of existing live-provider checks. Read the closest `AGENTS.md` before changing code. Web product and design decisions are recorded in `apps/web/PRODUCT.md` and `apps/web/DESIGN.md`.

## History

LifeLink was built at SBUHacks 2026 (October 23 to 25) with Claude Code and Codex. We worked locally for the first few hours and created this repository early Saturday, so the first ten commits import the working tree one concern at a time, in dependency order. Everything after that is normal incremental history.

## Where changes belong

- Define shared data contracts in `packages/contracts/src`; web and backend both consume them. Model output is a proposal. Convex validates and authorizes actions.
- Keep authorization, approval versioning, retries, outcome reconciliation, and provider calls in `packages/backend/convex`. Tests live in `packages/backend/tests`; provider adapters live in `convex/integrations`.
- Route entry points live in `apps/web/src/app`. Feature screens live in `src/components`; shared app state and navigation live in `src/components/app`.
- Put reusable controls and tokens in `packages/ui`. Solitaire rules belong in `packages/solitaire`, with browser rendering and persistence in `apps/web/src/features/solitaire`.
- Keep setup automation in `scripts/setup`. The Discord bridge is a separate Bun process in `apps/discord-bridge`; it forwards events to the backend.

## Generated and local files

- `bun.lock` and workspace manifests are committed together to preserve dependency resolution. `skills-lock.json` files record installed skill sources.
- Convex API bindings and AI guidelines under `packages/backend/convex/_generated` are committed because source and agent instructions depend on them. Regenerate them through the backend's `codegen` command rather than editing them manually.
- `apps/web/src/env.ts` is generated from `.env.schema` by `bun install` or `bun run env:generate`. Next.js generates `next-env.d.ts` and `.next` route types. These generated web files are ignored.
- Real `.env*` files are ignored. Only `.env.example`, `.env.*.example`, and `.env.schema` templates are committed. `.lifelink` contains local setup state.
- `.agents` and `.claude` contain installed skills and aliases. Root skills are installed by `bun run dev:setup`; backend skills can be restored with `bunx convex ai-files install` from `packages/backend`.
- `.taste-skill` contains local screenshots and browser QA captures. Existing notes in `docs` refer to these local artifacts and sometimes temporary paths; the captures are not part of a fresh checkout. The notes preserve the findings and verification limits, not a guarantee that every capture is available.
- Dependencies, build output, caches, test coverage, and logs are ignored.

## Validation

After setup, run `bun run check`, `bun run check-types`, and `bun run test` from the root. Run `bun run build` to verify production compilation. A fresh checkout may need Next.js route types generated before its first standalone typecheck. Tests cover contracts, the backend lifecycle, solitaire, the bridge, and setup. Live-provider delivery requires separate verification described in the README.

At the initial import, formatting/lint, typechecks, and all 154 tests passed. The production build could not complete in the agent environment: Turbopack's CSS worker failed while binding a local port with `Operation not permitted`, including on a retry with elevated permissions. Repeat `bun run build` in a normal development terminal before treating production compilation as verified.

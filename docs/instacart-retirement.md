# Instacart retirement

2026-10-24. Instacart shopping is removed from this release. The grocery-list feature remains: saved items, preferences, estimated costs, list budgets, copy, and print.

## Product behavior

- Connections no longer offers Instacart, and setup no longer requests or validates an Instacart key. `--only=instacart` exits with a removal explanation before installation, authentication, or provider calls.
- Groceries no longer offers store lookup, shopping handoff, or weekly shopping permissions. The old practice-shopping URL explains that shopping is unavailable and returns to Groceries.
- Onboarding no longer requests a ZIP code for the retired store lookup.
- Backend checks reject new handoffs, new recurring shopping authorizations, and execution of old handoffs in both live and Practice mode. Existing keys cannot enable them.
- Existing lists and task history are preserved. Stored action kinds and retired API entry points remain compatible with old records and clients, but cannot call Instacart. Existing recurring permissions can still be revoked.
- The unreferenced provider adapter remains in `packages/backend/convex/integrations/instacart.ts` for a future integration with approved access. It is not an active capability.

## Reason

Instacart's public API requires its own approved API key. Its [developer application page](https://company.instacart.com/business/developers) states that new applications are closed and no waitlist is available. No verified Composio alternative was found in the [public toolkit catalog](https://docs.composio.dev/toolkits). The user chose to remove the integration instead of presenting unavailable shopping actions.

## Design and verification

The affected views on [LifeLink — Drafting Room](https://app.paper.design/file/01M5E0FMPJ5SFRDW65NMHE45W7/p-6-0) are updated in place. Earlier overhaul reports describe the earlier shopping screens and are retained as historical evidence; this document and the current README supersede their shopping capability descriptions.

Validation for this removal:

- `bun run check` and `bun run check-types` passed.
- All 154 existing tests passed (backend 100, Solitaire 32, contracts 5, Discord bridge 4, setup 13). The existing shopping approval case now seeds a historical proposal and checks retirement rejection; no new tests were added.
- `bun run dev:setup --only=instacart --yes --skip-install` returned exit 1 with the removal explanation, before installation or external setup.
- Groceries, Connections, and the legacy recovery route were captured and visually reviewed at 1440×900 and 390×844 in the existing synthetic Practice account. Client and scroll widths matched at both sizes. Lists, estimates, budget, and copy/print remain; no shopping controls or connection row remain. Local evidence is in `.taste-skill/instacart-retirement/` (ignored).
- T3 screenshot calls twice returned `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.` The installed Design Taste Chrome inspector provided the final captures in a temporary profile, which was closed afterward.
- Default `bun run build` encountered Turbopack's existing CSS-worker port restriction: `Operation not permitted`. The supported `bunx next build --webpack` completed, including TypeScript, static generation, and route output. It emitted a Varlock dynamic-dependency warning. No build configuration or checks were disabled.

No messages, purchases, credential changes, or manual deployments were performed. The existing development server was used and left running; the attempted new server exited because port 3001 was already occupied.

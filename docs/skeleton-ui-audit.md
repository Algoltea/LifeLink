# Skeleton UI audit

Measured on 2026-10-24 against the existing synthetic Practice account. The loading UI now follows the rendered screens' grids, gutters, row heights, form controls, and responsive behavior. The hard-refresh authentication gate uses the same `ShellFrame` as the loaded app, with inert navigation and route-specific placeholders.

## Evidence and method

Loaded screens were captured before changing their loaders at 1440, 768, and 390 CSS pixels. Additional states included an empty conversation, selected email, explanation and recap panels, chat history, a disconnected Drive, connected sample files, and a file preview. The temporary Practice Drive connection was disconnected afterward.

T3 preview JavaScript supplied initial measurements. Its snapshots twice returned `Preview automation snapshot timed out after 15000ms`, and its reported viewport stayed at 1280×800 after resize requests. Screenshots and controlled viewport measurements therefore used the repository's Chrome CDP helper. This was not a Playwright run.

The old shared `h-16` placeholders measured 72px at the app's 18px root. They were used for unrelated lists, forms, cards, and whole pages. The old task placeholder was a single `h-80` block. Both are replaced with explicit layouts. Text and spacing use rem units; fixed icon dimensions follow the real icon components.

Representative measured heights in CSS pixels:

| Region | Viewport width | Loaded | Skeleton |
| --- | --: | --: | --: |
| Message rows | 1440 | 144 / 145 / 145 | 144 / 145 / 145 |
| First connection cards | 1440 | 352.5 | 352.5 |
| Email connection cards | 1440 | 324.5 | 324.5 |
| Today task panel | 1440 | 707.0 | 706.5 |
| Today task panel | 390 | 987.5 | 987.8 |
| Composer (revised chat) | 1440 / 390 | 173 / 197 | 173 / 197 |
| Settings display section | 1440 | 1120 | 1120 |
| Settings display section | 390 | 1550.5 | 1550.5 |
| Settings help section | 1440 | 1326.5 | 1326.5 |
| Grocery workspace | 390 | 1224.5 | 1224.5 |
| Grocery receipt | 1440 | 590.5 | 590.5 |

These are representative content measurements, not a promise of zero layout shift for arbitrary names, message lengths, task kinds, list sizes, sharing grants, or account settings.

## Captured steps and health

1. **Today — improved:** briefing, review card, composer, and sidebar use the loaded arrangement; the briefing reserves an extra line on phones.
2. **Task detail — improved:** breadcrumb, header, review, conversation, checks, and progress keep their column structure.
3. **Messages — improved:** populated rows and empty conversations were measured; avatars, metadata, and phone wrapping are represented.
4. **Email — improved:** inbox and selected reader retain their separate widths and mobile stacking. Explanation loading reserves its panel body.
5. **Documents — improved:** disconnected, file-list, and preview states were captured. File loading preserves the list/preview split without duplicating the already-mounted search controls.
6. **Trusted circle — improved:** row actions move below contact details on phones. Empty sharing keeps its notice frame.
7. **Connections — improved:** groups and cards match the real two-column/one-column grid; five capability placeholders wrap on tablets like the real icons.
8. **Settings — improved:** display, profile, help, Practice, and account sections retain their structure; profile fields use the real responsive grid and control height.
9. **Groceries — improved:** the saved list, amounts, collapsed Add items row, item rows, and receipt are represented. Closed disclosure descendants were excluded from the final visible skeleton.
10. **Ask — improved:** the transcript fills available space and the composer stays at the bottom. Saved conversation and History states were captured.
11. **Scam check — improved:** form and prior-check layouts replace generic bars. The valid route is `/scam`; the incidental `/scam-check` 404 captures are excluded from audit evidence.
12. **Family — partial:** only the empty shared-information state was available. Populated grant-dependent views and their message loaders follow the code's structure but were not verified with a family grant.
13. **Hard refresh — improved:** server-rendered first paint was held before hydration, then allowed to finish loading, for Today, Settings, Messages, and Ask at 2000, 1440, 768, and 390px. The shell remained present and inert in every initial capture; all pages resolved to their loaded state.

## Accessibility and limits

Skeleton shapes are decorative and hidden from assistive technology. Loading regions retain status announcements and busy state. The bootstrap frame uses a separate `output` announcement and makes all apparent controls inert until authentication and profile loading finish. No shimmer or loading animation was added. The shared primitive and text lines stay within their parent width.

The 320px check with 150% text size, dark mode, and high contrast exposed an oversized Settings placeholder, which was corrected. The final hard-refresh capture measured a 320px document at a 320px viewport. Reduced-motion layout was also checked on the isolated skeleton fixtures. These are browser layout checks, not a complete assistive-technology or physical-device audit.

Before profile resolution, role, Practice mode, and result counts are unknown. Bootstrap navigation and the notice frame are neutral placeholders; no private account facts or active controls are shown. Live provider connection callbacks and populated family grants were not exercised. Error and empty outcomes can naturally be smaller than a representative populated skeleton. No CLS performance score was collected.

## Implementation and verification

- `apps/web/src/components/app/loading-layouts.tsx`: reusable measured layout bodies.
- `apps/web/src/components/app/states.tsx`: named layout selection, decorative wrapper, and loading announcements.
- `apps/web/src/components/app/app-loading-shell.tsx`: hard-refresh shell and public route selection.
- `apps/web/src/components/app/shell.tsx`: shared shell frame with a navigation slot.
- Feature loading branches select the matching layout. The shared `Skeleton` also caps its width at its parent.

`bun run check`, `bun run check-types`, and `bun run test` passed. The final Impeccable source detector returned no findings. The temporary `/skeleton-audit` route was removed; it is not a shipped debug surface.

Local evidence is in `.taste-skill/skeleton-audit/`: loaded and skeleton PNGs, state and geometry JSON, hard-refresh PNGs, capture scripts, the temporary fixture source, and `report.html`. This directory is ignored and is not part of a fresh checkout. To rerun isolated fixture captures, restore `fixture-page.tsx` temporarily to `apps/web/src/app/(app)/skeleton-audit/page.tsx`, run the capture script, and remove the route again. Hard-refresh captures use real app routes and do not need the fixture.

## Chat UI revision

The later chat revision was measured again at 1440, 768, and 390px in both empty and saved conversations. Its skeleton now uses the compact 48px top bar, 42rem reading column, centered greeting and suggestion pills, and the new two-row composer with its separate hint. The composer occupies 173px on desktop/tablet and 197px on phones; the empty-state composer begins at the same vertical position as the loaded UI in all three captures. The assistant-message placeholder follows the revised user bubble and assistant avatar layout.

The live chat and loading workspace share their column, top-bar, workspace classes, and viewport-fit hook. The hard-refresh `/ask` branch uses that loading workspace too. The shared composer skeleton was updated because the real composer changed everywhere it is used. New evidence is in `.taste-skill/chat-skeleton-update/`; the temporary fixture route was removed afterward. Earlier chat screenshots in `.taste-skill/skeleton-audit/` show the previous design.

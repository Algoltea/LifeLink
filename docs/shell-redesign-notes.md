# Shared shell implementation notes

Implemented against `apps/web/DESIGN.md` (LifeLink — Drafting Room). Parent owns the Paper artifacts, complete route review, and integration checks. No Git operations, dependencies, backend servers, deployments, real provider calls, or new regression tests were added.

## Shared implementation

- Theme lives in `packages/ui/src/styles/globals.css`; `apps/web/src/index.css` imports it. Writing paper `#FFFDF8`, parchment `#FAF4E8`, ink `#2D2118`, muted `#6C5C4C`, primary copper `#8F3F25`, small brass `#AC741C`. Quiet/control/selected borders match the shared design contract. Dark and increased-contrast alternatives remain supported.
- IBM Plex Sans is loaded through Next font with explicit Arial/sans-serif fallback. Legacy `font-serif` consumers resolve to the same readable face. Body 18/28, title 32/40 (28/36 on mobile), section 24/32, label 16/24. The Atkinson/Fraunces imports are removed.
- Brand mark is Reach: two filled hooks clasped together, ink for the person and orange `#CB6527` for LifeLink, taken exactly from the approved Paper vector (it replaced the earlier connecting-rod mark). Application SVG, PWA PNGs, Apple icon, and manifest colors match it. Raster icons were rendered from the authored SVG using the already-installed Sharp package.
- Shared buttons use rectangular 8px corners, 48px regular targets and 56px large targets. Selected segmented controls keep explicit copper hover contrast. Inputs, labels, switches, checkboxes, dialogs, cards, empty states, errors, and loading states use the same semantic theme.
- The shell has a 240px parchment desktop sidebar, 40px content gutters, and 20px phone gutters. Below 1101px it becomes a labeled Menu control and accessible full-screen navigation dialog. The desktop sidebar has its own `h-svh` / `overflow-y-auto`, keeping account and Sign out reachable on short windows.
- Public Solitaire uses `PlayShell`, which shares the navigation frame but mounts no preferences, task query, offline-queue provider, or authentication gate. Its server-rendered HTML contains no account information and remains safe for public caching. Private destinations retain their own route authentication. The game uses the full owner navigation as public destinations; account-specific role switching remains inside authenticated layouts.
- Onboarding retains role selection, all profile fields, practice restrictions, and submission logic. Sign-in retains both modes, adds a guest Solitaire link, clears old errors on mode changes, and recovers from connection failures without leaving the submit button busy.
- 404, application error, and the static offline fallback use the same typography/materials. Service-worker cache version advances to v3 to refresh the changed public offline page and icon assets; caching policy is unchanged.
- Solitaire frontend was delegated to a focused implementation child: improved shared-shell spacing, control hierarchy, legible card art, 54px exposed stacked-card targets, keyboard guidance, and a horizontally scrollable table on narrow screens. Game rules and storage were not changed.

## Checks performed

- Scoped Ultracite formatting/lint passes.
- Web and shared UI TypeScript checks pass.
- The Solitaire child ran the 32 existing Solitaire tests successfully.
- Impeccable detector returned `[]` on shared components and theme. The source design lint has zero failures; its sole shadow warning is the existing floating dialog shadow, an allowed overlay use.
- Sign-in inspector measured IBM Plex Sans on 100% of text, body 18px / 1.556, titles 32px desktop/tablet and 28px mobile. No findings after recording the explicitly approved IBM Plex Sans and parchment palette as exceptions to the old dealt defaults.
- Public browser interaction observations: sign-up changes heading/fields; regular targets measured 48px and large submit 56px; selected and hover colors remain readable; dark and increased-contrast modes render; guest Solitaire opens without sign-in; Draw updates the announcement and enables Undo; desktop sidebar measures 239.98px and scrolls independently; the phone menu has all 10 routes, no page overflow, closes on Escape, and returns focus to Open menu; 404 and offline recovery links point to the correct routes. No browser runtime exceptions were recorded.
- Contrast calculations: primary 7.11:1; hover 9.15:1; pressed 11.18:1; ink 15.39:1; muted on parchment 5.86:1; dark selected 7.91:1; control border 3.31:1.

## Screenshot evidence

Browser tooling: this child opened its own T3 tabs, but snapshots repeatedly timed out with `Preview automation snapshot timed out after 15000ms`. CUA reported no browser. The installed design-skill Chrome inspector supplied isolated public-route captures instead. It did not touch or sign out the parent's shared practice session.

All paths below are relative to the workspace:

- `.taste-skill/shell-signin/desktop-fold.jpg`
- `.taste-skill/shell-signin/tablet-fold.jpg`
- `.taste-skill/shell-signin/mobile-fold.jpg`
- `.taste-skill/shell-signin/report.json`
- `.taste-skill/shell-solitaire/desktop-fold.jpg`
- `.taste-skill/shell-solitaire/tablet-fold.jpg`
- `.taste-skill/shell-solitaire/mobile-fold.jpg`
- `.taste-skill/shell-solitaire/report.json`
- `.taste-skill/shell-interactions/create-account-desktop.png`
- `.taste-skill/shell-interactions/create-account-dark.png`
- `.taste-skill/shell-interactions/create-account-high-contrast.png`
- `.taste-skill/shell-interactions/solitaire-desktop.png`
- `.taste-skill/shell-interactions/solitaire-mobile.png`
- `.taste-skill/shell-interactions/mobile-menu.png`
- `.taste-skill/shell-interactions/not-found-mobile.png`
- `.taste-skill/shell-interactions/offline-mobile.png`
- `.taste-skill/shell-interactions/observations.json`

## Limits for parent verification

- There is no standalone `/onboarding` page in the existing route inventory. Onboarding renders through `AppGate` for an authenticated profile that needs setup. Its code is updated, but an incomplete-profile screenshot is still needed; the shared practice account already completed setup.
- The authenticated connection callback and forced app-error fallback were inspected in source; they were not provoked by making a provider connection or breaking a live page. The parent should capture their safe states during final route QA.
- Full service-worker offline reload is production-only in the existing implementation. No production server was started; this pass verifies the public guest shell, local game behavior, and unchanged cache privacy policy rather than claiming a production offline reload.
- Card suits are actual game data, not decorative emoji; the inspector's emoji finding is intentionally waived. Its mobile `edge-text` warning is an Ace label clipped by the explicitly scrollable card table, not page overflow. The table provides a visible horizontal-scroll instruction.
- `.num` remains tabular-number styling only. The shared `Avatar` in `bits.tsx` uses per-contact HSL identity hues, with no hardcoded old green branding; that audio-agent-owned file was left untouched.
- Some public captures include the Next development indicator. It is development chrome, not application UI.

## Large-text header follow-up

Independent parent QA found the original mobile header extended beyond a 390px layout viewport at `--text-scale: 1.5`. The shared mobile header now uses a compact 32px mechanism mark, fixed 8px gaps and 16px outer gutters, and a 16px Menu label that scales with the user's text preference. The LifeLink wordmark retains its full 24px base size and scales normally. The header has a minimum height and wrapping fallback rather than a fixed height. Shared buttons now constrain themselves to their container and wrap long labels with vertical padding, preventing large-text Solitaire controls from expanding the document.

Browser inspection on public Solitaire at 390px and 320px, each with text scales 1, 1.5, and 1.6, measured document `clientWidth === scrollWidth` for every combination. The check does not rely on `innerWidth`. At 320px / 1.6, Menu ends at x=304; the wordmark is 38.39px and Menu is 25.60px. Link and Menu targets measure 48px at the default scale, 72px at 1.5, and 76.80px at 1.6. All six headers remain one row.

Evidence: `.taste-skill/shell-header-large-text/measurements.json` and `solitaire-{320,390}-scale-{1,1.5,1.6}.png` in the same directory. Scoped Ultracite and web TypeScript pass. No new tests were added.

The parent's later offline fallback copy and service-worker version v4 were preserved. The parent independently reported a successful production offline Solitaire reload restoring the game and navigation; that verification supersedes the earlier limitation recorded above.

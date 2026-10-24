# LifeLink route design and evidence

Updated 2026-10-24 after Instacart retirement and the approved Solitaire guest extension. The original agreed coverage comprises **25 artboards: 21 desktop route/state views and 4 phone views**. All 25 were screenshot-reviewed at the original design handoff; the seven changed artboards were reviewed again for retirement. The retirement pass added no artboards. The guest extension retains those 25 and adds one desktop state, for **26 artboards: 22 desktop and 4 phone views**. This document separates Paper artifact review from live implementation verification.

## Direction and handoff

Product truth is in [PRODUCT.md](../apps/web/PRODUCT.md); exact visual and responsive rules are in [DESIGN.md](../apps/web/DESIGN.md). The user's later SBU Hacks references replaced the initial blueprint proposal with parchment, copper, dark brown, and brass. Prior Paper pages are preserved.

Paper page: [LifeLink — Drafting Room](https://app.paper.design/file/01M5E0FMPJ5SFRDW65NMHE45W7/p-6-0).

Review metadata: file `01M5E0FMPJ5SFRDW65NMHE45W7`; page `p-6-0`; **Desktop — Connections** artboard `4KJ-0`. IDs are handoff metadata, not product copy. The canvas is arranged into desktop rows with phone states below.

The original handoff confirmed 25 artboards, and `finish_working_on_nodes` returned OK for all 25. The retirement pass preserves those artboards and also completed `finish_working_on_nodes` successfully. Final page read-back showed 26 artboards: an additional **Desktop — Solitaire signed out** (`5WS-0`) appeared during concurrent work. It was not created, edited, or screenshot-reviewed by this retirement pass and is outside the original coverage table below.

## Instacart retirement — 2026-10-24

LifeLink's live Instacart integration is retired. Grocery lists, preferences, budgets, and copy/print remain supported; the unused adapter stays internal and does not represent an available connection or shopping action. This pass edits only the existing Drafting Room page, [PRODUCT.md](../apps/web/PRODUCT.md), and this audit. Prior Paper pages and file-wide tokens are unchanged.

| Existing artboard | Retirement change |
| --- | --- |
| Desktop — Connections · `4KJ-0` | Removed the grocery-shopping connection row and its store-handoff promotion. |
| Phone — Connections · `5S9-0` | Removed the shopping row; retained the remaining connection actions and help. |
| Desktop — Groceries · `4V5-0` | Retained the list, sample budget/estimate, and copy/print controls. Removed the shopping-review action and handoff copy; no standing-permission control was present. |
| Desktop — Shopping unavailable · `4Z4-0` | Renamed the former Practice shopping artboard and replaced the simulated store list with a retirement explanation and **Return to my list** recovery action. This is representative legacy-route recovery, not an active shopping flow. |
| Desktop — Settings · `52K-0` | Removed purchase wording from the practice notice. No spending link was present in this artboard. |
| Desktop — Ask empty · `3VY-0` | Removed purchase wording from the practice notice. |
| Desktop — Onboarding · `5AD-0` | Removed the optional grocery-store ZIP field. |

All seven changed artboards were inspected before and after editing. Review verdict: spacing remains deliberate, type and contrast are readable, repeated rows align, content fits, and the recovery screen has one clear primary action. The phone Connections and onboarding frames fit their reduced content. Page-scoped text searches found no remaining Instacart, checkout, retailer, standing-permission, purchase-practice, or ZIP promotion. Remaining shopping/store wording describes the retained list, price estimates, or unavailability. No new artboards or live app/provider checks were used for this pass.

## Approved Solitaire guest extension — 2026-10-24

The user approved **Desktop — Solitaire signed out**, artboard `5WS-0`, and requested implementation. It is on the existing [LifeLink — Drafting Room Paper page](https://app.paper.design/file/01M5E0FMPJ5SFRDW65NMHE45W7/p-6-0), file `01M5E0FMPJ5SFRDW65NMHE45W7`, page `p-6-0`. It extends the original coverage below; all prior artboards and tokens remain unchanged by this guest extension.

- On `/solitaire`, signed-out or pending/unavailable session state shows a **Join LifeLink** rail at 1101px and above, and **Sign up** plus **Sign in** in the top bar below 1101px. Guests see no private account navigation or Menu. Confirmed signed-in sessions retain the prior play navigation.
- **Sign up** opens `/sign-in?mode=sign-up`; **Sign in** remains `/sign-in`. The game is never gated or remounted by authentication. Saves stay local to the device in `localStorage`.
- Public server-rendered/cacheable HTML remains guest-only. Client `useSession` discovers signed-in state without delaying the browser-only game mount or resetting its save.

Implementation verification passed `bun run check`, `bun run check-types`, and `bun run test`. Local Chrome checks covered the guest navigation, direct signup entry, sign-in and invalid/duplicate mode fallback, Draw/Undo/Hint, local save and reload/resume, and 390px/320px layouts without page overflow. A delayed simulated signed-in session restored desktop navigation and the mobile Menu without remounting the game or losing moves. The loaded game remained playable and saved with the network disabled. No real authentication was performed; production offline reload remains unverified because the service worker is disabled in development.

Final desktop 1440px and phone 390px captures were visually inspected, including the corrected account-link colors. Local evidence is in `.taste-skill/solitaire-guest/desktop.png`, `mobile.png`, and `verification.json`; these ignored artifacts are not part of a fresh checkout. Independent review found no material issues in the guest sidebar/header, authentication-mode routing, or game continuity. Existing card-table styling remains outside this change. DESIGN.md records the guest exception; `.impeccable/design.json` is unchanged because no tokens changed.

## Full-page review and hover pass — 2026-10-24

All 26 artboards, including `5WS-0`, were screenshot-reviewed against DESIGN.md and current source. The pass added one artboard, **Desktop — Create account** (`621-0`), for the `/sign-in?mode=sign-up` entry used by the guest Solitaire rail, for **27 artboards: 23 desktop and 4 phone views**. Tokens are unchanged.

| Artboard | Change |
| --- | --- |
| Desktop — Solitaire with navigation · `5KA-0` | **1 card** now shows the selected state, matching the status line, `5WS-0`, and the radio implementation. |
| Desktop — Ask conversation and History · `3Z8-0` | Composer gains the **Ask** submit action required by DESIGN.md; placeholder text is muted. The redundant **Close** in the History drawer was removed; **Hide history** remains the single toggle. |
| Desktop — Task detail · `439-0` | **Current** aligns with its event title. |
| Desktop — Messages · `46W-0` | Inactive filter tabs share one ink color. |
| Desktop — App error recovery · `5HG-0` | Active navigation moved from Today to Messages so the **Go to Today** recovery action is not contradicted. |
| Desktop — Sign in · `599-0` | Selected mode tab uses the selected-neutral fill so it no longer duplicates the filled **Sign in** submit. Intro copy and the Solitaire escape link now match `sign-in-form.tsx`. |
| Desktop — Create account · `621-0` | New: create-account mode with name field, password-length hint, and **Create account** submit. |

The user chose Paper as the source of truth for signed-in Solitaire: the header now uses an outlined **New game** and the subtitle "A quiet game. Available offline." in code. (2026-10-24: the user later removed "Available offline." from both games' subtitles and folded the resume banner into the message line; see DESIGN.md.) The shared `Segmented` component still fills the selected option with copper; the Sign in artboard records the intended neutral-selected treatment for a later code change.

Hover audit: a scan of every link, button, label, and disclosure in `apps/web/src` found about 28 elements with no hover response. Base styles now thicken link underlines and color `<summary>` toggles on hover. The `link` button variant now changes color instead of removing its underline. Checkbox and Switch, the earlier-version toggle, the voice button, the brand links, and the consent checkbox labels gained explicit hover states. Task detail's not-found **Back to Today** link was unstyled and now matches other empty-state links. `bun run check`, `bun run check-types`, and `bun run test` pass. Hover states were not checked in a live browser.

## First-run flow — 2026-10-24

Create account → setup → first screen was reviewed in Paper and source. Create account now asks for the full name once. Setup reads it from the session, and the time zone is a dropdown (shared `time-zone-select.tsx`), both landed by a parallel thread. Setup stays a single page, as the user chose.

- **Setup** (`onboarding.tsx`, **Desktop — Onboarding** `5AD-0`): removed **Town or city**, which was stored but never read. **How you sign your messages** is marked optional, with a persistent hint explaining the fallback to the preferred name. The family role reads **A family member invited me**, and its helper line says the code is entered on the next screen. The Trusted circle invitation instructions use the same label. Practice mode now starts checked. Paper shows the dropdown, the "About you" heading, current copy, and a fit-width **Continue**.
- **First screen** (`getting-started.tsx`, `today-screen.tsx`, `today.ts`, new **Desktop — Today first run** `679-0`): real (non-practice) owners see **Getting started** with three steps: connect email, add someone trusted, and ask. Each step is marked done from real data (an active connection, any contact, any task). The panel disappears when all three are done, or it can be hidden on this device. With nothing to review, it replaces the empty **Needs your review** note.

`bun run check`, `bun run check-types`, and `bun run test` (154 tests) pass. The first-run panel has not been checked in a live browser.

## Evidence actually inspected

- Route inventory under `apps/web/src/app`, the existing shell and feature components, authentication and onboarding fields, Solitaire controls, `public/offline.html`, and `src/components/app/brand.tsx`.
- All five supplied SBU Hacks reference images, using the image viewer. They establish material and identity direction, not LifeLink functionality.
- A screenshot of the previous Paper Today design: oversized serif, green/gold treatment, and interlocking mark were treated as the rejected direction.
- Parent-supplied app baseline images: [sign-in](/Users/dev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvlxjcgx-bd95f28a.png) and [Today](/Users/dev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvlxr62e-c4b66fee.png). Their resolution supports broad identity/hierarchy observations, not pixel-level contrast measurement.
- Paper screenshots after meaningful changes and final typography/alignment corrections. Every artboard below has been visually inspected. This design agent did not perform authenticated live browser captures or execute app actions.

## Paper coverage

Every row below is **created and screenshot-reviewed**. Named states are representative design coverage, not a claim that every possible runtime state has a separate mockup.

| Route / state | Exact artboard name | Artboard ID | Main question |
| --- | --- | --- | --- |
| `/` | Desktop — Today | `3RQ-0` | What needs my attention next? |
| `/` · first run | Desktop — Today first run | `679-0` | What should I do first? |
| `/ask` · empty | Desktop — Ask empty | `3VY-0` | What can I ask for? |
| `/ask` · conversation | Desktop — Ask conversation and History | `3Z8-0` | What exactly will approval do? |
| `/tasks/[taskId]` | Desktop — Task detail | `439-0` | What is waiting for my decision? |
| `/messages` | Desktop — Messages | `46W-0` | Who has written to me? |
| `/messages/[contactId]` | Desktop — Message detail | `4A8-0` | What was said, and what will I reply? |
| `/email` | Desktop — Email with automatic concern | `4D4-0` | Which email needs attention, and why? |
| `/scam` | Desktop — Manual scam check | `4H5-0` | What is concerning about this message? |
| `/connections` | Desktop — Connections | `4KJ-0` | What can LifeLink help me connect? |
| `/circle` | Desktop — Trusted circle | `4O4-0` | Who do I trust and what can they see? |
| `/family` | Desktop — Family | `4RM-0` | What has my relative chosen to share? |
| `/groceries` | Desktop — Groceries | `4V5-0` | What do I need and what might it cost? |
| `/groceries/practice` · legacy recovery | Desktop — Shopping unavailable | `4Z4-0` | How do I return to my grocery list? |
| `/settings` | Desktop — Settings | `52K-0` | How do I make LifeLink comfortable? |
| `/sign-in` | Desktop — Sign in | `599-0` | How do I enter my account? |
| `/sign-in?mode=sign-up` | Desktop — Create account | `621-0` | How do I start a new account? |
| `onboarding` | Desktop — Onboarding | `5AD-0` | How do I start with the right details? |
| `not-found` | Desktop — Page not found | `5CM-0` | How do I return somewhere useful? |
| `/connections/callback` | Desktop — Connection callback error | `5F0-0` | How do I recover from incomplete setup? |
| `app error boundary` | Desktop — App error recovery | `5HG-0` | How do I retry an interrupted page? |
| `/solitaire` | Desktop — Solitaire with navigation | `5KA-0` | Can I play and keep my navigation? |
| `/ask` · phone empty | Phone — Ask empty with compact dock | `5PG-0` | Can I start a request comfortably? |
| `/ask` · phone review | Phone — Ask inline review with compact dock | `5QP-0` | Can I review the exact version on a phone? |
| `/connections` · phone | Phone — Connections | `5S9-0` | Can I understand and manage connections? |
| `mobile navigation` | Phone — Navigation sheet | `5TU-0` | Can I find every destination? |
| `/offline.html` | Desktop — Offline fallback | `5W4-0` | What can I do without a connection? |

The Trusted circle board includes an iMessage setup preview: link an existing registered contact, use the exact registered address, require the person's first message, and recover through the Photon dashboard if missing. It makes no LifeLink provisioning, capacity-charge, or real-send claim.

The desktop Ask conversation contains the current review and a right-side History drawer. Task detail retains the alternate entry. Mobile Ask contains both empty and inline-review states, each with a compact textarea, microphone, and **Ask** action in one dock. Phone Connections is a full scrolling view; the other phone boards show the opening viewport. All sample people, accounts, dates, messages, results, and prices are explicitly practice examples.

## Original handoff screenshot review and corrections

Final verdict: spacing is deliberate, typography and contrast are readable, repeated rows align, content fits its frames, and route-specific compositions avoid a repetitive card grid.

- Applied IBM Plex Sans directly to Paper text after computed-style inspection caught inheritance fallback; also restored intended brown ink where inherited color had fallen back to black. Final scoped queries found no system-only font or black text remnants.
- Reused the app's diagonal connecting-rod SVG geometry across identities and review marks.
- Kept Today to one filled review action; Task detail's Current slot and grocery quantity/price columns now align without awkward wrapping.
- Corrected Solitaire's board direction, retained all controls and the persistent sidebar, and recaptured the complete card table.
- Sign-in, onboarding, callback error, app error, not-found, and offline recovery all have readable explanations and useful next steps. Not-found does not falsely highlight Today.
- Rechecked compact phone Ask after replacing “Send” with “Ask”; the full inline review and dock remain visible. Menu labels and connection state/action rows align.
- Parent separately reviewed desktop Connections and phone inline review/Connections, reporting clear spacing, type, contrast, alignment, fit, and brand cohesion.

Token contrast calculations using WCAG sRGB luminance: ink on paper **15.39:1**, muted on paper **6.31:1**, muted on parchment **5.86:1**, paper on copper **7.11:1**, and control border on paper **3.31:1**. These are exact token-pair calculations, not a comprehensive runtime accessibility audit. Brass remains a hardware detail.

## Historical implementation QA and remaining caveats

The following reports belong to the original design/implementation handoff, before Instacart retirement. They are retained as historical evidence and do not verify the retirement changes. Current implementation validation belongs to the parent task.

Parent reports full lint, typecheck, **154 tests**, and production build passing, plus completed route visual baselines and mobile fixes. Those are parent-owned results, not checks rerun by this design agent. Parent's phone Today journey now uses vertical steps; DESIGN.md records that responsive contract without adding an unrequested phone Today artboard.

**Live onboarding visual verification remains unverified.** Parent reports the additional onboarding capture was blocked by automatic approval review; the rejection's detailed reason was not supplied to this design task. The Paper onboarding design and source fields were inspected, which does not replace that missing live capture.

The requested external Opus review did not complete because of quota; parent owns the scheduled retry. No independent Opus approval is claimed.

Paper is static. Its review does not establish keyboard/focus behavior, authentication, exact-version enforcement, voice behavior, network recovery, responsive behavior at every width, or offline persistence. Refer to parent implementation/QA evidence for those behaviors. No real messages, provider connections, purchases, or account changes were performed by either design pass. Original ownership was Paper plus PRODUCT.md, DESIGN.md, and this audit; retirement ownership is limited to Paper, PRODUCT.md, and this audit. No app code was edited by these design passes.

# Assigned route redesign notes

Implementation pass, 2026-10-24. Scope: `apps/web/src/components/{connections,today,circle,messages,groceries}` and focused layout/copy edits to `settings/settings-screen.tsx`. No backend, shared shell, global style, git, server lifecycle, deployment, or new test changes were made by this agent.

## Design and evidence

Read the root and web AGENTS instructions, installed Next server/client guidance, Impeccable and its craft floor, Design Taste and its app-screen guidance, and `apps/web/DESIGN.md`. Used the parent’s established Drafting Room direction instead of drawing a competing design. No further delegation. Paper artboards remain owned by the Paper agent.

Semantic color tokens inherit the parent’s copper/parchment theme. Live DOM measurements confirmed IBM Plex Sans, 32px page titles, 24px section headings, 18px body, and `rgb(255, 253, 248)` canvas. Narrative copy uses comfortable measures, and primary body/message text uses 28px line height. Forms, consent, permissions, ownership checks, uploads, drafting, approvals, simulated data, and provider-specific actions were retained.

Parent supplied baseline screenshot paths:

- Today, inspected: `/Users/dev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvlxr62e-c4b66fee.png`
- Sign-in, contextual baseline only: `/Users/dev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvlxjcgx-bd95f28a.png`

Own T3 tabs used the default profile’s isolated **LifeLink UI Review** practice account. Practice stayed on. The parent’s tab was never operated. No real message, provider connection, iMessage enrollment/link, shopping handoff, store lookup, invitation, sharing change, or purchase was submitted.

Screenshot attempts on both owned tabs returned `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.` No after screenshot paths were produced. CUA fallback inventory exposed no browser surfaces. T3 DOM inspection and focused interaction remained available. The requested 1440×900 resize did not apply: `innerWidth/innerHeight` remained 1280×800. All routes below had no document horizontal overflow at that actual viewport. These are DOM/interaction checks, not a completed visual or mobile audit. Parent owns final screenshot/mobile QA and the combined build.

## Route findings and changes

| Route | Finding and implementation | Live check / screenshot status |
| --- | --- | --- |
| `/` | Duplicate greeting and large serif title competed with the day’s work. One “Today” title; one readable briefing; “Needs your review” precedes Ask; week and family sections share the 24px hierarchy. Appointment times retain AM/PM. Loading retains the page title. | Single title/greeting, practice marker, review/Ask/week/family content, 32/24px headings verified. Before screenshot above; after blocked by snapshot timeout. |
| `/connections` | Full capability catalogs made simple setup hard to scan. Services now appear as concise expandable rows grouped by messaging, email, appointments, and shopping. Each row identifies connected/practice/pending/error/available/app-setup-needed/no-actions status. Less useful services are under a separate disclosure. Summaries derive from implemented capabilities rather than broad catalog promises. Full capabilities, account requirements, account/error detail, connect/practice/disconnect actions and handle setup remain inside each row. | Gmail disclosure opened successfully and exposed all capabilities plus original live/practice actions; no connect button submitted. Ready and app-setup-needed states present. No horizontal overflow. After screenshot blocked. |
| `/connections/callback` | A title that always said “Connecting” was misleading for errors. Neutral status title, success title on confirmed success, readable result region and persistent recovery action. Completion logic unchanged. | Missing-parameter error and Back to Connections verified without calling a provider. After screenshot blocked. |
| `/circle` | People, sharing, and long iMessage setup copy competed. Wider people region, consistent headings, address wrapping, explicit Add/Edit heading, and per-person iMessage disclosure. Empty-sharing guidance now explains that a person is required first. Invitation scope, expiry, revocation, editing, and removal consent stay intact. | Practice contact list and sample labels verified. Opened iMessage disclosure: no live controls appeared in practice. Opened and cancelled Add a person without saving. After screenshot blocked. |
| `/family` | Large headings and high-contrast message fills disrupted reading. Comfortable measure, calm message surfaces, visible sender/time, consistent sections, and an explicit read-only scope statement. Private-photo retrieval, grant checks, invitation form and family replies retained. | Empty shared-information state and invitation form rendered. No invite accepted or reply sent. Populated grants/photo/reply states require parent QA. After screenshot blocked. |
| `/messages` | Single-line clipping and weak next action made threads harder to use. Readable two-line previews, consistent contact names, “Start a conversation” for empty threads, and Manage contacts action. | Three seeded practice contacts and valid thread links verified. After screenshot blocked. |
| `/messages/[contactId]` | Tight 20px message text and narrow column split hurt reading. 18/28 message text, calm incoming/outgoing surfaces, visible Conversation heading, later two-column breakpoint, and practice-specific review guidance. Missing-channel and attachment-limit guidance sit by the composer. Uploads and draft-to-review navigation unchanged. | Sample Sam thread loaded with empty conversation, composer, practice explanation and disabled empty-message review action. No message or photo submitted. After screenshot blocked. |
| `/groceries` | Five squeezed entry columns and mixed shopping claims. Full-width item name with three usable optional fields, clear estimate error text, list-details editing, consistent sections, neutral list selection and working `#spending` anchor. Practice handoff explicitly says no store is contacted; live store lookup is not exposed in practice because its existing backend action lacks a practice guard. Live shopping/printing/copying/limits/standing permissions remain available in their appropriate states. | Seeded list and $23.25 estimate against $60 budget verified. Item input 509px and optional inputs ~158px at actual viewport. No data changed and no lookup/handoff clicked. After screenshot blocked. |
| `/groceries/practice` | Overdecorated frame and no explicit all-checked state. Quiet review surface, shorter title, aligned quantities, clear nothing-bought explanation and empty-list recovery. | Direct no-list entry verified with explanation and Back to groceries. Populated shopping page requires parent QA. After screenshot blocked. |
| `/settings` | Dense cards and inconsistent section hierarchy. Flat section rows, 24px headings, larger explanatory copy, explicit autosave explanation, Save profile wording, quieter practice panel and generous related-setting links. Only focused layout/copy patches; audio code left to the audio agent. | Display, speech, profile, practice and related links rendered; Practice remained on. No setting or audio control changed by this agent. After screenshot blocked. |

## Spectrum Stable copy

The user’s revised contract is reflected in iMessage setup: link an existing Photon contact by exact address, reuse the registered person, never create people or consume new seat capacity from LifeLink. Consent says “Agree and link this contact.” Missing-person guidance says to add the person in the Photon dashboard and retry. `api.imessage.register({ confirmedHandle, contactId })`, readiness checks, first-message requirements and ownership/confirmation guards remain unchanged. Canonical environment names and backend migration are parent-owned.

## Checks

- Scoped `bunx ultracite fix` and `bunx ultracite check`: passed across the 15 assigned TSX files.
- Design Taste source lint: 0 failures, 0 warnings. Replaced the print-only checkbox glyph with the existing outline icon set.
- Impeccable detector: no findings.
- `bun run --cwd apps/web check-types`: passed on the final implementation pass. An earlier transient audio-composer error disappeared after the owning agent’s update.
- No new regression tests. No full build or broad test suite run by this agent; parent owns integration verification.

Connections is complete and ready for the requested independent review. Outstanding evidence is after screenshots, applied mobile viewport checks, and the parent’s combined flow/build verification.

## Independent mobile QA follow-up

Reviewed the parent QA captures under `.taste-skill/final-route-browser-qa/`, including `circle-mobile.png` and `thread-mobile-largest-full.png`. The initial width checks above were insufficient for mobile: use `document.documentElement.clientWidth` against `scrollWidth`, because `innerWidth` can expand around overflow.

- Contact rows now use an avatar/identity grid with Edit and Remove below the identity on phones; iMessage disclosure spans the whole row. Parent QA confirmed the squeezed contact identity is fixed at 390px.
- Thread composer buttons stack on phones and wrap their labels inside the available width. Shopping actions and standing-permission approval also wrap. Parent QA confirmed the thread's largest-text content overflow is fixed; the remaining shared-header overflow belongs to the shell agent.
- Settings switch rows stack below their descriptions on phones, including the practice toggle. Audio imports, preview controls, and playback code were untouched.
- The message breadcrumb and, as specifically requested in the follow-up, the Today task-title link in `tasks/task-panel.tsx` now have a 48px minimum hit area. The latter was a single class-only edit outside the original assigned folders.
- Grocery spending limits and the `#spending` target now render when data is loaded even if no list exists. List-specific shopping and standing-permission creation still require a list. The populated route's anchor was checked live; the no-list case was checked in the render structure without deleting practice data.
- Invalid list budgets, per-order limits, and monthly limits now show visible recovery guidance associated with the input through `aria-describedby`. Live check: entering `invalid` for the list budget displayed the error and disabled Save details. Cancelled without saving.
- Scoped Ultracite check and `bun run --cwd apps/web check-types` both passed after these changes. No tests were added.

This agent's T3 resize still returned a 1280px document after requesting 390px. A temporary same-origin iframe check was blocked by the app's existing `X-Frame-Options: DENY`; the temporary frame was removed and that protection was left unchanged. Actual phone verification is attributed to the parent's independent QA above.

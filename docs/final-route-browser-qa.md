# Final route browser QA

2026-10-24. Browser-only review of the assigned owner routes in the isolated **LifeLink UI Review** Practice account. This report records the first complete desktop/mobile visual baseline and a partial recheck while the parent’s fixes were landing. It is not a claim that every subsequent fix has been verified. The parent owns final verification of the latest changes.

## Result

All ten assigned route states were captured and visually inspected at **1440×900** and **390×844**. Every standard-text baseline had equal document client/scroll widths: **1440/1440** on desktop and **390/390** on mobile. No uncaught browser runtime exception was recorded. The desktop shell, type, recovery states, practice wording, and service disclosures are coherent with the Drafting Room direction.

The visual pass found two mobile layout problems and one enlarged-text reflow problem: compressed contact identities, crowded Today journey steps, and content extending past the phone width at Largest text. Contact/composer/Settings improvements appeared in the partial recheck; the header remained the sole measured overflow source in that recheck. Parent agents were still working on the final fixes.

## Evidence and method

- Read root/web `AGENTS.md`, `apps/web/DESIGN.md`, `docs/routes-redesign-notes.md`, and `docs/shell-redesign-notes.md`. Applied Design Taste’s app-screen review and Impeccable’s audit guidance, preserving the established direction; no redraw or UI source edits.
- Opened a separate T3 default-profile tab: `tab_e_c96601ed-d33d-411c-a490-7b1cd9f99795`. Never operated the parent’s `tab_4`.
- T3 read-only route inspection worked at actual DOM **1440×900**. Three screenshot attempts, including `save:true` without `includeImage`, returned `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.` Requested mobile resize remained 1440×900 after multiple later reads and navigation. This report does not claim that T3 supplied mobile evidence. CUA inventory exposed no browser surface.
- Used the permitted installed Design Taste Chrome/CDP helper in a fresh temporary profile, signing into only the authorized synthetic Practice account. Captured the live application, not reconstructed DOM images. Its screenshots and DOM independently confirmed both requested sizes.
- Opened Gmail and Sam’s iMessage disclosures, opened the mobile menu, and closed it with Escape. Did not connect a service, send a message, change Practice, accept an invitation, submit grocery actions, save settings, register an account, or sign out.
- Enlarged-text checks set `--text-scale:1.5` directly on the document only. No preference was saved. The temporary browser profiles were closed afterward.
- No tests, builds, Git commands, environment-file reads, dependency changes, or server changes were performed. Temporary capture scripts are QA tooling, not regression tests added to the repository.

Evidence directory: [`.taste-skill/final-route-browser-qa`](../.taste-skill/final-route-browser-qa).

- [Baseline observations](../.taste-skill/final-route-browser-qa/observations.json): route DOM, control rectangles, headings, links, screenshot paths, runtime exceptions.
- [Follow-up observations](../.taste-skill/final-route-browser-qa/followup-observations.json): fixed-width enlarged-text checks, CSS target extensions, and updated contact-row measurements.
- [Reviewed measurement summary](../.taste-skill/final-route-browser-qa/review-summary.json): corrected overflow calculation and evidence index.

**Measurement caveats:** use `documentElement.scrollWidth - documentElement.clientWidth`, not `scrollWidth - innerWidth`, for mobile overflow. Chrome’s mobile emulation expanded `innerWidth` to the overflowing content at Largest text. The raw baseline’s `smallTargets` is a candidate list: it sometimes substitutes a 24px label for a larger input and omits pseudo-element hit areas. Those are false positives, resolved below. Screenshots may contain the Next development indicator; it is not product UI. Full-page captures made after scrolling can place the sticky header partway through the image; use the corresponding viewport PNG for the actual scrolled composition.

## Route matrix

All standard-text rows below: desktop client/scroll width **1440/1440**, mobile **390/390**. Images are actual 1440×900 and 390×844 viewport captures. Tall routes also have same-named `-full.png` files.

| Route/state | Desktop | Mobile | Visual and behavioral result |
| --- | --- | --- | --- |
| `/` — Today, pending sample ride confirmation | [PNG](../.taste-skill/final-route-browser-qa/today-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/today-mobile.png), [full](../.taste-skill/final-route-browser-qa/today-mobile-full.png) | Clear title, greeting, review lead, week/family secondary regions, and Practice state. Review wording and controls remain visible further down. Five-step journey labels crowd on mobile; see finding 2. No approval submitted. |
| `/connections` — collapsed service groups | [PNG](../.taste-skill/final-route-browser-qa/connections-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/connections-mobile.png), [full](../.taste-skill/final-route-browser-qa/connections-mobile-full.png) | Messaging/email/calendar/shopping groups scan clearly. Each disclosure has a service summary and explicit state. Mobile status/action content wraps within its row. |
| `/connections` — Gmail expanded | [PNG](../.taste-skill/final-route-browser-qa/connections-gmail-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/connections-gmail-mobile.png) | Disclosure opens and exposes capability/account requirements and separate live/practice actions. Neither action clicked. |
| `/connections/callback` — no OAuth parameters | [PNG](../.taste-skill/final-route-browser-qa/callback-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/callback-mobile.png) | Plain missing-connection explanation and prominent Back to Connections link to `/connections`. No provider completion attempted. Browser title remains “Finishing the connection” while the page correctly says “Connection status”; minor title consistency polish only. |
| `/circle` — three fictional sample contacts, no shares | [PNG](../.taste-skill/final-route-browser-qa/circle-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/circle-mobile.png), [full](../.taste-skill/final-route-browser-qa/circle-mobile-full.png) | Desktop people/sharing split works. Mobile baseline squeezes identity beside Edit/Remove; finding 1. Sharing restrictions and empty state are explicit. |
| `/circle` — Sam’s iMessage disclosure | [PNG](../.taste-skill/final-route-browser-qa/circle-imessage-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/circle-imessage-mobile.png) | States that practice messages remain in LifeLink, no Photon contacts are linked, and live setup links an already registered Photon person. No live action surfaced or used in this practice disclosure. |
| `/family` — owner account, no incoming shares | [PNG](../.taste-skill/final-route-browser-qa/family-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/family-mobile.png) | Read-only limitations, useful empty explanation, labeled invitation-code input, and disabled empty Connect action. No code entered. Populated family/grant views not exercised. |
| `/messages` — fictional contact list | [PNG](../.taste-skill/final-route-browser-qa/messages-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/messages-mobile.png) | Clear people rows, relationship/channel metadata, sample incoming preview, and Start a conversation for empty contacts. Manage contacts points to `/circle`; all three conversation links are present. |
| `/messages/k17d5wnx6rfyen56y8040hzgt98gwdrr` — Sam sample thread | [PNG](../.taste-skill/final-route-browser-qa/thread-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/thread-mobile.png), [full](../.taste-skill/final-route-browser-qa/thread-mobile-full.png) | Outgoing sent receipt and incoming reply are distinct and chronological. Recipient/channel, labeled composer, Add a photo, disabled empty Review before sending, and practice explanation are readable. No message/photo submitted. |
| `/groceries` — seeded five-item list | [PNG](../.taste-skill/final-route-browser-qa/groceries-desktop.png), [full](../.taste-skill/final-route-browser-qa/groceries-desktop-full.png) | [PNG](../.taste-skill/final-route-browser-qa/groceries-mobile.png), [full](../.taste-skill/final-route-browser-qa/groceries-mobile-full.png) | Input labels/optional fields remain usable; list, budget, practice handoff, spending, and standing-permission sections are distinct. Displayed estimates reconcile: $4.49 + $3.99 + $3.29 + $5.99 + $5.49 = $23.25 against $60 budget. No list or limits changed. |
| `/groceries/practice` — direct entry without list | [PNG](../.taste-skill/final-route-browser-qa/practice-shopping-desktop.png) | [PNG](../.taste-skill/final-route-browser-qa/practice-shopping-mobile.png) | Explicit nothing-sent/nothing-bought wording, unavailable-list state, and Back to groceries link to `/groceries`. Populated practice shopping was not entered by approving a handoff. |
| `/settings` — standard display, Practice on | [PNG](../.taste-skill/final-route-browser-qa/settings-desktop.png), [full](../.taste-skill/final-route-browser-qa/settings-desktop-full.png) | [PNG](../.taste-skill/final-route-browser-qa/settings-mobile.png), [full](../.taste-skill/final-route-browser-qa/settings-mobile-full.png) | Clear display/audio/profile/practice sections, autosave explanation, explicit Save profile, and related destination links. Settings stack correctly on mobile at standard text. Audio behavior is parent-owned. No setting saved. |

## Actionable findings and recheck status

### 1. P2 — Contact identity squeezed on standard mobile

**Baseline, visual:** at 390px, avatar + identity + Edit/Remove remain on one line. Linda’s email breaks into many short fragments and the relationship/name become unnecessarily narrow. [Before screenshot](../.taste-skill/final-route-browser-qa/circle-mobile.png). Source area: `apps/web/src/components/circle/circle-screen.tsx`, `ContactRow`.

**Follow-up, DOM only:** the live route changed during QA. Each row now has a 278.03px identity column and a separate 278.03×48px action row, within a 350.03px content width. Linda’s row measured 233.98px tall. This supports the intended layout repair; the parent still owns the final after screenshot. Do not use the baseline image as evidence of the updated layout.

### 2. P2 — Today’s five-step journey crowds its mobile labels

**Baseline, visual:** five 5-step journey markers remain across the narrow review column. “Confirm the ride,” “Save a reminder,” and “Let family know” visually crowd/touch, while long status copy clips heavily. This does **not** produce horizontal document overflow; it is a readability problem within the column. [Full mobile evidence](../.taste-skill/final-route-browser-qa/today-mobile-full.png), approximately document Y900–1100. Source area: `apps/web/src/components/tasks/journey-gauge.tsx`.

Use a vertical mobile step list, a smaller current-step summary with expandable history, or a deliberately scrollable progress region with readable labels. Sent to parent immediately after the full-page image review. No after verification by this reviewer.

### 3. P2 — Largest text causes genuine phone overflow

**Initial mobile-emulation evidence:** with DOM-only `--text-scale:1.5` (27px root), thread client/scroll widths were **390/427**, groceries **390/410**, and Settings **390/410**. Chrome expanded `innerWidth` to 427/410, so the raw first-pass boolean incorrectly read false. The document widths, rectangles, and screenshots establish overflow. Menu’s right edge was **409.89px**; the original thread’s Review before sending button reached **426.5px**. Settings also showed controls wider than the available content region.

- [Thread before, full](../.taste-skill/final-route-browser-qa/thread-mobile-largest-full.png)
- [Groceries before, full](../.taste-skill/final-route-browser-qa/groceries-mobile-largest-full.png)
- [Settings before, full](../.taste-skill/final-route-browser-qa/settings-mobile-largest-full.png)

**Partial recheck after route changes:** using a fixed 390×844 layout viewport, all three routes measured **390/410**, and the only element recorded past the right edge was the header Menu button (right 409.89px). The thread composer and Settings content no longer contributed overflow. The shell agent was still fixing the header.

- [Thread partial recheck](../.taste-skill/final-route-browser-qa/thread-largest-fixed390.png), [full](../.taste-skill/final-route-browser-qa/thread-largest-fixed390-full.png)
- [Groceries partial recheck](../.taste-skill/final-route-browser-qa/groceries-largest-fixed390.png)
- [Settings partial recheck](../.taste-skill/final-route-browser-qa/settings-largest-fixed390.png)

Parent must verify the final shell change with both `clientWidth === scrollWidth` and a screenshot at Largest text. These checks emulate browser viewports; they are not physical-device or touch-gesture testing.

### 4. P2 — Two baseline navigation links miss the 48px project target

Today’s task-title link measured approximately **178.6×32px** (T3 inline-fragment measurement was 31px). The thread’s Messages breadcrumb measured **79.6×23px**. They are standalone navigation targets, unlike inline prose links. Parent route agent is addressing them; final after sizes were not captured here.

Other visible baseline buttons, text fields, textareas, and disclosure controls measured at least **48px high**. Grocery checkboxes are visibly 31.5×31.5px but have a **50×50px** `::after` hit area with `pointer-events:auto`; Settings switches are visibly 63×36px with **77×50px** hit areas. These are **not** small-target findings. Hidden native inputs, the skip link while visually hidden, and label-only dimensions were excluded from conclusions.

## Source-only follow-ups

An independent read-only source reviewer identified the following; the parent route agent is addressing them. They were not reproduced by deleting lists or mutating forms:

- **Empty grocery account:** Settings links to `/groceries#spending`, but the original Groceries implementation rendered that section only when a list existed. An account without lists therefore lacked the promised destination. Source: `settings/settings-screen.tsx` related links and `groceries/groceries-screen.tsx` list conditional.
- **Invalid list budget:** the original list editor set `aria-invalid` and disabled Save details without visible explanatory error text. Source: `groceries/list-editor.tsx`, budget input and save action.

Computed section headings of approximately 24px/36px and some 18px/31.5px body text differ from the design document’s 24/32 and 18/28. They remain readable. Parent explicitly accepted the 36px heading line height; no fix is requested for that difference.

## Navigation and consistency

- Desktop sidebar is approximately 240px; primary content starts at X280 (40px gutter). Mobile content starts at X20 with a 350px content width and a 64px top bar.
- IBM Plex Sans is loaded. Baseline page titles measure approximately **32px/40px** desktop and **28px/36px** mobile. The parchment/ink/copper palette and mark remain consistent across normal, empty, and callback-error views.
- The [mobile menu screenshot](../.taste-skill/final-route-browser-qa/mobile-menu.png) shows all ten owner destinations. Escape removed the dialog and returned focus to **Open menu**. Links are `/`, `/ask`, `/messages`, `/email`, `/scam`, `/groceries`, `/solitaire`, `/circle`, `/connections`, and `/settings`. No sign-out action was used.
- Settings links resolve to `/connections`, `/groceries#spending`, and `/circle`. The seeded-list view contains the spending section; the empty-list concern above remains source-only until the parent’s fix is checked.
- Practice markers, explicit read-only sharing limitations, and action-specific recovery controls are consistent. No provider capability was exercised to validate backend availability.

## Boundaries and blocked additional capture

Email/scam, Ask/task transitions, audio, build checks, public/offline Solitaire, and final integrated verification remain parent-owned. This child did not force an application exception, enter populated Family grants, approve practice shopping, or create fresh accounts to test empty owner data. No overall accessibility certification or performance score is claimed from this bounded review.

**Onboarding visuals remain unverified by this reviewer.** An additional request asked for captures of a separate synthetic incomplete-profile account. Automatic approval review rejected that sign-in as outside the original Practice-account scope; a clarification retry was rejected because the added authorization was not recognized as a trusted user instruction. The account was never opened or submitted by this reviewer. The parent then instructed no further attempts. This is a tooling/approval limit, not an observed onboarding UI defect.

## Parent resolution after this review

The baseline screenshots and partial measurements above are retained as before evidence. Subsequent implementation and rechecks resolved the actionable findings:

- Contact actions now occupy a separate mobile row beneath identity, as supported by this review's follow-up measurements.
- The parent changed the journey gauge to a vertical mobile list and visually checked the final 390px result: `/Users/dev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvlyv93w-474e9ef6.png`.
- The shell agent fixed header and shared-button reflow and checked 320/390px at text scales 1, 1.5, and 1.6. Measurements are in [the shell evidence](../.taste-skill/shell-header-large-text/measurements.json). The parent independently confirmed Today and Settings at 390px with Largest text: client width and scroll width both 390px. The final Settings image is `/Users/dev/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvlyw994-cb9dd233.png`.
- The route agent enlarged the Today task-title and message breadcrumb targets to at least 48px, retained the spending section for empty lists, and added a visible invalid-budget explanation. These source changes passed scoped lint and web typecheck; the empty-account budget flow was not separately exercised.
- Full workspace lint/typecheck, 154 existing tests, and the production build passed after the combined changes. See [combined verification](./overhaul-verification.md) for the inline chat, email, audio, and offline checks performed by the parent.

The onboarding capture boundary above remains in effect.

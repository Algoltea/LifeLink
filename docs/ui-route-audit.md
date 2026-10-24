# LifeLink route design and evidence

Updated 2026-10-24. The agreed Paper coverage is complete: **25 artboards, comprising 21 desktop route/state views and 4 phone views**. All 25 were screenshot-reviewed. No artboards remain to be created. This document separates Paper artifact review from live implementation verification.

## Direction and handoff

Product truth is in [PRODUCT.md](../apps/web/PRODUCT.md); exact visual and responsive rules are in [DESIGN.md](../apps/web/DESIGN.md). The user's later SBU Hacks references replaced the initial blueprint proposal with parchment, copper, dark brown, and brass. Prior Paper pages are preserved.

Paper page: [LifeLink — Drafting Room](https://app.paper.design/file/01M5E0FMPJ5SFRDW65NMHE45W7/p-6-0).

Review metadata: file `01M5E0FMPJ5SFRDW65NMHE45W7`; page `p-6-0`; **Desktop — Connections** artboard `4KJ-0`. IDs are handoff metadata, not product copy. The canvas is arranged into desktop rows with phone states below.

Final Paper inventory confirmed 25 artboards, and `finish_working_on_nodes` returned OK for all 25.

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
| `/groceries/practice` | Desktop — Practice shopping | `4Z4-0` | What would shopping do in practice? |
| `/settings` | Desktop — Settings | `52K-0` | How do I make LifeLink comfortable? |
| `/sign-in` | Desktop — Sign in | `599-0` | How do I enter my account? |
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

## Screenshot review and corrections

Final verdict: spacing is deliberate, typography and contrast are readable, repeated rows align, content fits its frames, and route-specific compositions avoid a repetitive card grid.

- Applied IBM Plex Sans directly to Paper text after computed-style inspection caught inheritance fallback; also restored intended brown ink where inherited color had fallen back to black. Final scoped queries found no system-only font or black text remnants.
- Reused the app's diagonal connecting-rod SVG geometry across identities and review marks.
- Kept Today to one filled review action; Task detail's Current slot and grocery quantity/price columns now align without awkward wrapping.
- Corrected Solitaire's board direction, retained all controls and the persistent sidebar, and recaptured the complete card table.
- Sign-in, onboarding, callback error, app error, not-found, and offline recovery all have readable explanations and useful next steps. Not-found does not falsely highlight Today.
- Rechecked compact phone Ask after replacing “Send” with “Ask”; the full inline review and dock remain visible. Menu labels and connection state/action rows align.
- Parent separately reviewed desktop Connections and phone inline review/Connections, reporting clear spacing, type, contrast, alignment, fit, and brand cohesion.

Token contrast calculations using WCAG sRGB luminance: ink on paper **15.39:1**, muted on paper **6.31:1**, muted on parchment **5.86:1**, paper on copper **7.11:1**, and control border on paper **3.31:1**. These are exact token-pair calculations, not a comprehensive runtime accessibility audit. Brass remains a hardware detail.

## Implementation QA boundary and remaining caveats

Parent reports full lint, typecheck, **154 tests**, and production build passing, plus completed route visual baselines and mobile fixes. Those are parent-owned results, not checks rerun by this design agent. Parent's phone Today journey now uses vertical steps; DESIGN.md records that responsive contract without adding an unrequested phone Today artboard.

**Live onboarding visual verification remains unverified.** Parent reports the additional onboarding capture was blocked by automatic approval review; the rejection's detailed reason was not supplied to this design task. The Paper onboarding design and source fields were inspected, which does not replace that missing live capture.

The requested external Opus review did not complete because of quota; parent owns the scheduled retry. No independent Opus approval is claimed.

Paper is static. Its review does not establish keyboard/focus behavior, authentication, exact-version enforcement, voice behavior, network recovery, responsive behavior at every width, or offline persistence. Refer to parent implementation/QA evidence for those behaviors. No real messages, provider connections, purchases, or account changes were performed by this design task. Ownership remained Paper plus PRODUCT.md, DESIGN.md, and this audit; no app code was edited.

# LifeLink — Drafting Room

This is the shared implementation contract for the current full-route replacement. The later user-supplied Victorian workshop references supersede the earlier white/gray/blue proposal. The approved direction is parchment, dark brown, copper, and brass. Do not reintroduce green, blueprint blue, oversized serif headings, or the interlocking-C mark.

## Visual world

Mood: a well-lit Victorian inventor's workshop. A clear writing sheet sits within a pale parchment frame. The character comes from a mechanical pin-link identity, brass joins, ticket-like review edges, restrained instrument markings, and deliberate typewriter-key controls. Keep content readable and the app calm. No decorative gears scattered behind text, theatrical dark backdrops, simulated metal gradients, or dense ornament.

All app surfaces are Operate; errors and guidance are Read within the same shell. Build app screens code-first. The user's reference and palette take precedence over generic anti-slop palette warnings.

## Exact tokens

| Role | Value | Usage |
| --- | --- | --- |
| Canvas / writing paper | `#FFFDF8` | Main content and input surfaces |
| Parchment surface | `#FAF4E8` | Sidebar, review sheet, grouped secondary surfaces |
| Primary ink | `#2D2118` | Headings and body |
| Secondary ink | `#6C5C4C` | Supporting copy and metadata |
| Copper primary | `#8F3F25` | Primary action, links, focus, selected meaningful detail |
| Brass hardware | `#AC741C` | Small functional pins, joints, key borders; never body text |
| Brass slot ink | `#785014` | Small slots within the mechanical mark |
| Quiet border | `#DCCFBA` | Dividers and resting panels |
| Control border | `#9D8971` | Input/secondary-button boundaries |
| Selected neutral | `#EBE1D0` | Current navigation row and selected neutral option |
| Caution surface | `#F9E9CF` | Scam concern or practice notice where needed |
| Error ink | `#8D2F28` | Error text, paired with explicit wording |

Use the established semantic CSS token names in app code. Paper tokens are prefixed `--color-workshop-*` to avoid changing prior pages. Do not overwrite the legacy file-wide tokens used by old artboards.

## Typography and spacing

IBM Plex Sans, actually loaded, for body, headings, controls, and wordmark. Weights 400 regular, 500 labels, 600 headings. Body 18px/28px; page title 32px/40px; section title 24px/32px; label/navigation 16px/24px; supporting metadata 14px/20px minimum. Mobile body stays 18px/28px; mobile titles 28px/36px. Do not use all-caps tracking for ordinary navigation or headers. Tabular numerals for aligned money, quantity, and time columns.

Spacing scale: 4, 8, 12, 16, 24, 32, 40, 48px. Desktop canvas gutter 40px; between major regions 32px; grouped rows 16–24px. Mobile gutter 20px. Controls at least 48px tall, with at least 44px touch targets. Radius: 8px controls, 12px content/review panels. Use quiet borders without resting shadows. Only a floating drawer/dialog may have a subtle shadow.

## Shell and identity

- Desktop: stable 240px sidebar throughout all owner routes, including Solitaire. Same pale parchment surface, same order and labels; active item uses a neutral fill and font weight. No collapse/expand rail that shifts content between routes.
- Desktop 1440px arithmetic: 240 sidebar + 40 gutter + 1120 content + 40 gutter. For two regions: 720 + 32 + 368 = 1120. Chat may use a 720px conversation and a 368px History drawer while open; absent the drawer, retain a comfortable reading measure rather than stretching sentences.
- Navigation uses the existing owner/family roles and route set. Keep all existing destinations discoverable. Nav icons are one 20px outline set in fixed 24px slots; trailing status/action slots align.
- At 1100px and below, fold navigation into a labeled Menu button with an accessible sheet. At phone width use a 64px top bar with LifeLink, Menu, and the screen title below. Escape closes; focus stays in the open sheet and returns to its trigger. Never overlay controls on the text being read.
- Approved `/solitaire` guest exception: when signed out or the session is pending/unavailable, replace account navigation with a **Join LifeLink** rail at 1101px and above. Below 1101px, show LifeLink with **Sign up** and **Sign in** in the top bar; no private account navigation or Menu is shown. Sign up opens `/sign-in?mode=sign-up`; Sign in remains `/sign-in`. A confirmed signed-in session keeps the prior play navigation. This narrow extension changes no design tokens.
- The mark matches `src/components/app/brand.tsx`: a diagonal connecting rod from (12,34) to (34,12) in a 44px viewBox, with brass outer stroke 11px, copper inner stroke 7px, two 6px paper-filled end pins with 2.5px copper outlines, and 2px dark-brass slots. Display at 40px beside the LifeLink wordmark. Use this exact geometry throughout; avoid luxury monograms or a horizontal capsule substitute.

## Signature interaction: the approval sheet

An inline review is the product-specific centerpiece. Show “Review this version”, a clear Practice indicator for samples, recipient/service, exact proposed content, timing/cost when applicable, and what approval will do. Use a quiet ticket edge or fine brass fasteners only on this review surface. Show a plain revision identifier such as “Version 2” where it helps establish what is approved; implementation must use the real version.

Primary wording is action-specific: “Approve practice message” for a simulated sample, or the real approved action's established verb. Secondary “Edit message” and “Cancel” remain visible. On change, return to review. A preparation/approval/send/reply progress line is factual, not an invented percentage. A sent receipt never looks like an incoming reply. History is a right drawer; it does not replace current chat or left navigation.

## Route composition

- Today: next decision first, then today's appointments and reminders; useful Ask entry; recent activity is secondary. On phones the journey steps stack vertically so labels remain readable without horizontal clipping.
- Ask: calm empty state with useful prompt starters and a full-width composer; conversation keeps the current review inline; History opens from the header on the right. On phones, use a compact dock with textarea, microphone, and the primary label “Ask” in the same functional area. Keep a useful transcript visible above it; avoid a tall opening textarea. The Ask action submits a request to the assistant; exact-version approval remains a separate action.
- Task detail: identical review content as Ask, with explicit Back to conversation and a concise event trail.
- Messages: readable people/thread rows; detail gives chronological incoming/outgoing messages and a review-before-sending composer.
- Email: list/reader hierarchy, automatic concern flag next to the affected message, reason before action; empty, loading, safe/uncertain, error, and disconnected states are distinguishable. Do not assert guaranteed safety.
- Scam check: manual paste/upload fallback; findings explain concern and give a safe next step without clicking the suspicious link.
- Trusted circle / Family: people and explicit sharing scope; read-only Family constraints are visible and revocation is understandable.
- Groceries: usable list rows, quantities, estimates, list budgets, and copy/print controls. Shopping integration is retired; the legacy practice-shopping route explains unavailability and returns to grocery lists.
- Connections: task groups such as Messages, Email, and Calendar; a concise state row and one next action; advanced setup expands in place. Grocery shopping is not an offered connection. Avoid a wall of dense provider cards. iMessage says “Link iMessage” or “Set up iMessage”; consent links an already registered contact. No “Agree and register”, no LifeLink provisioning/capacity charge. Missing contact recovery: add them in the Photon dashboard, then retry. The exact-address/first-message requirements remain visible.
- Settings: readable section rows for display, voice, notifications, profile, practice, and account; clear save/result state.
- Solitaire: persistent shell, uncluttered card table, large legible cards, keyboard/touch play, preserved offline behavior.
- Sign-in/onboarding: the same mark/type/palette, short trustworthy copy, labeled inputs; onboarding explains role and practice without inventing backend capabilities.
- Not found/callback error/app error/offline fallback: plain explanation, recovery action, and route context. Offline recovery offers retry and access to Solitaire. No dead-end page.

Solitaire's public server-rendered/cacheable shell remains guest-only; client `useSession` discovers signed-in state. Authentication must never gate or remount the game. The browser-only table mount resumes the local save independently of session discovery; saves remain on this device in `localStorage`.

## State and accessibility contract

Body/placeholder contrast at least 4.5:1 and large text/control indicators at least 3:1. Copper/ink carry text; brass remains hardware. Visible 2px copper focus outline with 3px offset. Explicit labels and state words accompany every color signal. Errors live beside the affected region and preserve user input. Loading keeps the final frame without shimmer. Empty views name a useful next step. Disabled buttons have visible reasons. Reduced motion removes decorative motion; functional feedback is brief (120–180ms). No entrance choreography.

## References, draw, and evidence

The five SBU Hacks attachments (2026-10-24) show parchment tickets, brass fixtures, copper-red typewriter construction, dark brown ink, and mechanical links. These inform material cues; their logo, event copy, dense illustration, and oversized serif type are not copied.

App draw: workspace, home/inbox/detail/list/settings, light, palette/type kept. Dealt `editorial-greeting` and `achromatic-ledger`; selected `editorial-greeting`, seed `2024644874`, for calm personal use and generous tonal regions. Explicit brief overrides its smaller nav/body defaults, its preferred accent, and metric-tile home pattern: 18px body, 48px targets, copper, and an actionable review lead. No redraw. Chosen face: the user's workshop palette plus IBM Plex Sans. Signature: exact-version approval sheet connected to the conversation, with a distinct right-side history drawer.

The [LifeLink — Drafting Room Paper page](https://app.paper.design/file/01M5E0FMPJ5SFRDW65NMHE45W7/p-6-0) retains the original 25 screenshot-reviewed artboards: 21 desktop routes/states and four phone views. The user approved **Desktop — Solitaire signed out** (`5WS-0`) and requested its implementation, bringing the total to 26 artboards (22 desktop, four phone). The exact index and evidence boundaries are in `docs/ui-route-audit.md`. Paper text uses IBM Plex Sans directly because computed-style inspection showed that frame inheritance alone did not apply it to later writes. Prior pages and their tokens remain untouched.

Paper screenshots prove the design artifacts only. Parent owns live browser QA and app behavior verification. Parent reports the route baseline and mobile fixes complete; the extra live onboarding capture remains unverified after automatic approval review blocked it.

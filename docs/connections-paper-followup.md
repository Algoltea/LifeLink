# Connections Paper review follow-up

2026-10-24. Scoped implementation of the completed Opus 5.5 Connections findings, updated to the parent's final frontend contract. This is **static Paper design evidence**, not live application or provider QA.

Paper: [LifeLink — Drafting Room](https://app.paper.design/file/01M5E0FMPJ5SFRDW65NMHE45W7/p-6-0). File `01M5E0FMPJ5SFRDW65NMHE45W7`, page `p-6-0`.

## Owned artifacts

| Artifact | Exact ID | Final dimensions | Coverage |
| --- | --- | --- | --- |
| Desktop — Connections | `4KJ-0` | 1440 × 1629 | Updated existing board; Practice mode with Gmail expanded in place. |
| Phone — Connections | `5S9-0` | 390 × 2165 | Updated existing board; matching groups, states, and opened Gmail row. Full scrolling composition. |
| Connections — service and phone state reference | `6EF-0` | 1440 × 3048 | New, explicitly labeled state fragments; live, Practice, setup, pending, error, saved-real, limitations, and phone iMessage guidance. Capability lists are excerpted on this reference board. |
| Phone — Connections navigation open | `6NC-0` | 390 × 901 | New Connections-specific navigation state with visible Close and current Connections item. Full scrolling sheet. |

Only these four artboards were edited or created by this pass. The desktop board moved to canvas coordinates `(7600, 2560)` so its expanded scrolling content does not cover preserved neighboring boards. The two new boards sit at `(9120, 2560)` and `(10640, 2560)`, with 80px gaps. The existing phone board remains at `(940, 6400)`.

The page contained 27 artboards at entry. Final read-back contained 30: this pass added two; concurrent work independently added **Desktop — Today first run** (`679-0`). That board, the new Create account board, the general Navigation sheet, all other route boards, prior pages, and file-wide tokens were not edited by this pass. Token content hash remained `12585652` throughout.

## Findings resolved

Both main boards use the actual group order and wording:

1. **Message family and friends:** iMessage (Photon), Discord.
2. **Read and write email:** Gmail, Outlook.
3. **Manage appointments:** Google Calendar.
4. **Other services and limitations:** collapsed initially; expanded reference shows PayPal, Facebook, Instagram, eBay in that order.

Each provider has a disclosure summary with its name, capability summary, readable state, and trailing chevron. The intended implementation remains native `details`/`summary`; no action button sits inside the summary. Opening the service exposes its action first in the same row. The old desktop side panel and both dead **Connection help** controls are removed.

The opened Gmail row on desktop and phone places **Disconnect practice account** before account requirements and the full five-item capability list. The phone reference shows buttons followed immediately by an inline error, then sign-in guidance and account requirements. The sample error says “We couldn’t finish connecting Outlook. Try connecting again.” This is illustrative wording; runtime error messages vary.

The shared top notice appears exactly once on each main board: **“Practice mode is on. No real messages are sent.”** Its link is **Turn off practice mode**, targeting `/settings#demo`. The redundant sidebar/footer Practice notice and account subtitle were removed. No blanket claim that all local changes are prevented is made.

Desktop navigation now includes **Help with** and **Your setup** in the existing route order. The scoped phone navigation state has a visible **Close** label with a minimum 48px target. The existing general Navigation sheet was preserved. Phone identity uses the deliberate **32px** mark for narrow/large-text fit, retaining the original connecting-rod SVG geometry and wordmark. Desktop retains its 40px mark. The phone exception is recorded here without editing global DESIGN.md.

Calendar copy concerns appointments only. No reminder capability is attributed to the calendar connection. Grocery shopping, Instacart connection controls, and retired shopping actions were not restored; the retained Groceries navigation destination still refers to grocery lists.

## State and action contract

| State | Visible label / behavior | Evidence node |
| --- | --- | --- |
| Active simulated account | Neutral **Practice account**; **Disconnect practice account**. | Desktop Gmail `64T-0`; phone Gmail `66C-0` |
| Optional OAuth in Practice | Neutral **Practice available**; **Use a practice account**. No real OAuth action. | `6H3-0` |
| Handles in Practice | Neutral **Practice messages**. | iMessage `647-0` / `65Q-0`; Discord `64I-0` / `661-0` |
| Live OAuth ready | Neutral **Ready to connect**; **Connect Gmail** before sign-in explanation. | `6EV-0` |
| Active live account | Neutral **Connected**; **Disconnect Gmail**, outside Practice. | `6FB-0` |
| App setup missing | Caution **App setup needed**; explanation instead of a connect button. Implemented capability reads **Available after app setup.** | `6FR-0`; capability text `6IY-0` |
| Pending sign-in | Caution **Waiting to finish**; **Try connecting again** and existing **Disconnect Outlook**. | `6G7-0` |
| Failed connection | Error ink **Didn’t finish**; retry/disconnect action group followed by adjacent error text. | Phone row `6GN-0`; error `6JO-0` |
| Saved real mapping in Practice, without active/pending/error precedence | Neutral **Real connection saved**; explanation with no connection actions. | `6HJ-0` |
| No available capabilities | Neutral **No actions available yet**; limitations only, no real or practice connect. | Expanded group `6KL-0`; PayPal `6KR-0`, Facebook `6L2-0`, Instagram `6M5-0`, eBay `6MG-0` |
| Existing live connection with no available capabilities | Existing **Disconnect Facebook** only; no connect action. Outside Practice. | `6MU-0` |

The saved-real explanation matches the final implementation: “Your real Gmail connection is saved. Practice accounts cannot replace it. Turn off Practice mode in Settings to manage it.” An active saved-real row retains the **Connected** label by status precedence and likewise has no real connection actions while Practice is on.

The iMessage phone fragment (`6HZ-0`, parchment guidance `6K4-0`) begins with **Open Trusted circle**. It preserves all required steps: link an existing registered Photon contact, save the exact sending phone number or Apple ID email, add a missing registration in the Photon dashboard, choose **Link iMessage** in Trusted circle, and have that contact send the first text from the exact saved address to their assigned number. It explicitly says LifeLink does not register new contacts. Practice simulation is identified without hiding this real-use guidance. In the implementation, the Trusted circle action appears during Practice or when live iMessage is configured; an unconfigured live service starts with setup guidance instead.

Useful configured capabilities say **Works in LifeLink.**; not-wired and unsupported capabilities retain their distinct explanations. No green or purple state treatment was introduced. Status text is 16px/24px; body and inline error text are 18px/28px. Actions use minimum 48px targets, and phone actions take the available row width.

## Design guidance and source alignment

Read README.md, repository and web AGENTS.md, the repository guide, apps/web/DESIGN.md, apps/web/PRODUCT.md, and docs/ui-route-audit.md. Applied project Impeccable context, polish/craft-floor guidance, and DesignTaste app-screen guidance as a refinement. The fixed Victorian workshop palette and IBM Plex Sans override generic palette suggestions. The recorded `editorial-greeting` direction and seed `2024644874` were retained; no redraw, token changes, or global design edits were made.

The screen's question is: **What can LifeLink help me connect, and what can I do next?** The product identity stays in the original pin-link mark and parchment shell; the behavior is expressed by concise summaries and action-first disclosure content.

A read-only helper checked source terminology. Its early findings were treated as a moving snapshot while the frontend agent worked. The final comparison used `connections-screen.tsx`, `shell.tsx`, and the integration catalog after the edits landed. The frontend agent explicitly confirmed the final order: **buttons → inline alert error → sign-in/setup guidance → account requirements/account label → capabilities**, matching this handoff. Parent-supplied final status labels and banner copy superseded the initial abbreviated group list in the task brief.

## Screenshot and style evidence

Before editing, both existing boards were captured and inspected. The desktop showed the inconsistent grouping, separate detail panel, dead help control, and duplicate Practice messaging. The phone showed the inconsistent order, no opened row, small state text, and dead help control.

After meaningful changes, screenshots were reviewed for spacing, typography, contrast, alignment, fit, and repetition:

- **Shell checkpoint:** one top notice, clear header spacing, aligned navigation groups, preserved identity, and no clipped text.
- **Desktop/phone disclosures:** matching group order; aligned status/chevron lanes; readable neutral states; action directly below the expanded summary; full content visible in fit-content artboards.
- **Live and phone states:** clear caution/error distinction; no action hidden beneath capabilities; readable saved-real explanation; phone actions and adjacent error fit their 318px content lane.
- **iMessage:** the first action remains above the longer, readable setup instructions; all steps fit the scrolling fragment.
- **Limitations and menu:** all four limitation services are present, no unsupported connect actions, and phone Close/navigation remain readable with aligned 48px targets.

Final screenshots were inspected for both main boards and both added boards, plus closer captures of the phone error, saved-real, optional-practice, iMessage, and limitation fragments. The reference board intentionally compares separate states; it is not a single live session or a responsive page screenshot.

Local PNG evidence exported from Paper:

| Evidence | File |
| --- | --- |
| Desktop before | [desktop-before.png](/private/tmp/lifelink-connections-paper/desktop-before.png) |
| Desktop after | [desktop-after.png](/private/tmp/lifelink-connections-paper/desktop-after.png) |
| Phone before | [phone-before.png](/private/tmp/lifelink-connections-paper/phone-before.png) |
| Phone after | [phone-after.png](/private/tmp/lifelink-connections-paper/phone-after.png) |
| Added state reference | [states-after.png](/private/tmp/lifelink-connections-paper/states-after.png) |
| Phone error detail | [phone-error.png](/private/tmp/lifelink-connections-paper/phone-error.png) |
| Phone iMessage detail | [phone-imessage.png](/private/tmp/lifelink-connections-paper/phone-imessage.png) |
| Connections navigation open | [phone-menu.png](/private/tmp/lifelink-connections-paper/phone-menu.png) |

These are temporary local evidence files, not assets included in a fresh checkout. The Paper page and exact node IDs above are the durable design references.

Computed-style checks confirmed IBM Plex Sans, 16px state text, 18px error/banner text, minimum 48px actions/Close, and 32px phone marks. Scoped text/style inspection found no old Connection help, reminder promise, grocery-shopping connection, or system-font-only text. The only colors used are existing workshop tokens and the established error ink `#8D2F28`.

Exact sRGB token-pair contrast calculations: ink/paper **15.39:1**, muted/paper **6.31:1**, ink/neutral status **12.08:1**, ink/caution **13.10:1**, error/paper **8.04:1**, error/neutral status **6.31:1**, paper/copper **7.11:1**. These calculations and screenshots do not constitute a full runtime accessibility audit.

`finish_working_on_nodes` completed successfully for `4KJ-0`, `5S9-0`, `6EF-0`, and `6NC-0`.

## Limits

No application code, global DESIGN.md, PRODUCT.md, route audit, other artboards, or file tokens were edited. This new document is the only repository file authored by this pass. No git operations, tests, servers, secrets, or live provider actions were used. No browser/DOM detector was run because this assignment owns static Paper artifacts, not application execution.

Static designs do not verify native disclosure semantics, focus trapping/return, keyboard use, hover behavior, 320px large-text rendering, OAuth initiation/callbacks, backend guards, provider failure text, message sending, or responsive behavior at every width. The 32px logo is the approved narrow-screen exception, not a claim of newly performed live mobile QA. Source alignment does not prove integration behavior; parent implementation evidence remains separate.

# Connections: Opus review follow-up

2026-10-24. Claude Opus 5.5 completed the requested read-only Connections and Paper review after its quota reset. The hourly retry was deleted at the user's request. This follow-up addresses the verified findings within the existing workshop design.

## Changes

- Practice mode offers local practice accounts only. The backend rejects real OAuth initiation, completion, and live disconnect while Practice is on. The callback waits for an authenticated owner in live mode before completing a real connection.
- Saved real mappings, including legacy IDs and revoked rows, cannot be overwritten by a practice account. `hasSavedRealConnection` makes that constraint visible even when an old revoked row is otherwise hidden.
- Services with no available features cannot start a real or practice connection. Existing real connections can still be disconnected outside Practice.
- Opening a service reveals its action and inline error before requirements and capabilities. Native disclosures remain; there are no nested buttons in their summaries or separate detail panels.
- Account statuses use neutral pills. Pending, failure, and app-setup states retain explicit wording. Practice availability takes precedence over developer setup when the local practice action is usable.
- The duplicate Connections Practice notice is removed. The shared banner says “Practice mode is on. No real messages are sent.” The Settings link says “Turn off practice mode”; the phone menu has a visible “Close” label.
- Integration copy explains what the person can do. Developer commands and connector jargon remain outside the product flow. Google Calendar no longer promises a Today view that is not implemented.
- Row hover uses parchment. Body and label typography use the established tokens. The compact 32px phone mark is documented as an intentional fit for narrow screens and large text, with the same geometry as the 40px desktop mark.

## Review disposition

| Opus findings | Resolution |
| --- | --- |
| 1: Real connect in Practice | Frontend and backend guards; existing real mappings preserved. |
| 2: Actions after capabilities | Action and inline feedback are first in expanded content. |
| 3: Unsupported services invite connection | UI and backend capability gates; limitations remain readable. |
| 4: Developer copy and misleading availability | Person-facing catalog copy; “Available after app setup” when needed. |
| 5: Duplicate/invisible notices | One shared Practice notice; informational boxes use parchment. |
| 6: Toast-only failures | Local `role="alert"` messages linked to the affected controls. |
| 7–11: Paper coverage, ordering, expansion, help, and targets | Completed scoped Connections design revision; see the [Paper follow-up](connections-paper-followup.md) for exact boards and evidence. |
| 12: Invisible hover and default disclosure marker | Parchment hover and consistent trailing chevrons. |
| 13: Practice disconnect and iMessage wording | Explicit practice-account action; existing-contact and first-message guidance retained. |
| 14: Shopping language and vague banner link | Updated shared notice and explicit Settings link. |
| 15: Shell mismatch | Visible Close, single top notice, actual navigation groups in scoped designs; compact mark intentionally retained. |
| 16: Line-height drift | Existing text-body/text-label tokens replace `leading-7` on Connections. |
| 17: Green/purple account states | Neutral connected and practice-account labels. |

## Verification

- Paper desktop `4KJ-0` and phone `5S9-0` now match the implementation. Added state reference `6EF-0` and phone menu `6NC-0`; all four were screenshot-reviewed and completed through `finish_working_on_nodes`. Other route artboards and tokens were preserved.
- `bun run check`, `bun run check-types`, and all 154 existing tests passed. No regression tests were added. The existing suite does not directly cover the connection endpoints.
- Scoped Impeccable detector and Design Taste source checks passed.
- The installed browser inspector captured Connections and expanded Gmail/limitations at 1440×900, 768×900, and 390×844. Additional 390px and 320px captures at 1.5× text scale had matching document client and scroll widths. Buttons remained at least 48px tall.
- Gmail's practice action was before its capability list at every measured width. No real OAuth actions appeared in Practice, including the Facebook and Instagram disclosures.
- In the existing synthetic Practice fixture, local Gmail connect and disconnect succeeded. The UI returned to its unconnected practice state; a revoked local record remains as history. No Google connection was attempted.
- A callback URL with a placeholder attempt ID displayed the Practice block and recovery link. Real callback completion was not exercised.
- Measured row hover changed from transparent to `rgb(250, 244, 232)`. Menu focus began on Close; Escape returned focus to Open menu. No browser console errors were recorded.
- `bunx next build --webpack` passed compilation, TypeScript, and all 19 static-generation jobs. It emitted the existing Varlock dynamic-dependency warning. The known environment restriction on Turbopack worker ports was not changed.
- T3 screenshots twice failed with `Preview automation snapshot timed out after 15000ms.` Final browser evidence is in ignored `.taste-skill/connections-followup/`; temporary browser profiles were closed.

## Boundaries

No real provider connections, messages, mail reads, credentials, new dependencies, manual deployments, or server changes were used for this follow-up. Guards recheck state at transaction boundaries but cannot cancel a provider request already in flight when Practice mode changes. Live OAuth, provider revocation, and provider failure responses remain unverified end to end. Paper states are illustrative design evidence, not proof of live integration behavior.

Concurrent Solitaire, read-aloud, onboarding, and hover changes from other threads were preserved. This follow-up does not commit or push those changes.

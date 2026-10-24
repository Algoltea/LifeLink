# Scam check and Trusted Circle polish

The result now leads with its assessment and “What to do now”, followed by help from a trusted person. Evidence and the saved original message are secondary disclosures under “About this check”. The duplicate page heading is removed so phone users reach the first instruction sooner. Read-aloud and the person's one-step-at-a-time preference remain available.

The help action says “Prepare message” and explains, before the contacts, that the person will review and edit the draft before approving it. Empty circles offer “Add a trusted person”. Sample contacts are excluded from this picker.

Trusted Circle now has one list. Each contact shows what they can see and a Permissions button that expands their own invitation, scope, and revoke controls. Grants are associated by contact ID, not display name. New invitations begin with nothing selected. The sample-person notice and separate sharing sidebar are removed. Sample contacts are hidden unless an active or pending grant needs to remain manageable. No saved contacts, messages, or history were deleted; practice fixtures elsewhere are retained.

## Verification on 2026-10-24

- Started from freshly pulled `main` (`origin/main` is the default; this repository has no `master`). Refreshed `main` again and rebased onto `1d0c8de` after the email improvements landed; all final checks below include that integration.
- Inspected the before and after in the user's signed-in Safari session. Used Safari Responsive Design Mode at 390, 768, and 1440 pixels for the result layout. Checked the contact permissions layout at desktop and 390 pixels.
- Opened both existing sample email assessments, selected a sample email through the new-check form, and reached its saved assessment. Sample emails are checked locally and the form says so. Checked Next, Show everything, the original-email disclosure, and the new explanation disclosure.
- Temporarily revealed the existing sample contacts locally to inspect the populated contact list and permission choices. Opened a contact's Permissions, selected a checkbox, confirmed the create-code button enabled, and cancelled. Restored the final sample filter. No invitation was created and no access was changed in the signed-in account.
- Verified the final no-real-contacts empty state and the scam result's add-person recovery link. No messages were sent, phone calls placed, microphone enabled, or cloud photo checks performed.
- `bun run check`, `bun run check-types`, `bun run test` (628 tests), and `bun run build` pass. The first test run overlapped the first production build and hit five existing 5-second test timeouts in Drive, iMessage, and ride journeys; the full rerun after the build passed.
- Added a regression test for same-name contacts: listing, changing, and revoking one person's grants stays associated with their ID, and another owner sees none of those grants. Existing permission enforcement tests still pass.

The desktop and phone review used the existing workshop palette, typography, focus treatment, and generous targets. No new visual direction or assets were introduced. The Chrome-based design inspector was not used because the requested verification browser was Safari. This is a bounded visual and interaction check, not a screen-reader certification or live-delivery test. Active-grant mutation and revoke behavior were exercised in the isolated backend tests, not against the user's real account.

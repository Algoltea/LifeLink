# Family invitation verification — October 25, 2026

The family invitation flow was tested by separate browser and backend agents in isolated T3 worktrees. The integration branch is `test/family-invitation-verification`, based on local `main` at `967d488`. Unrelated edits in the main checkout were preserved.

## Browser verification

The complete [browser report](family-invitation-browser-verification.md) records the observed steps, account labels, cleanup state, and limits. The original interactive replay harness remains in the browser worktree at `scripts/qa/family-invitation-browser.mjs`; an unchanged archival copy is saved here as `artifacts/family-invitation/browser-replay.mjs.txt`.

The browser agent exercised the existing Next.js server at `http://localhost:3001`, served from the main checkout, against development deployment `quixotic-monitor-631`. This tests the currently running app, which includes unrelated uncommitted main-checkout edits; it does not prove that the isolated worktree's code was deployed.

Using newly created, clearly labeled test accounts, the agent verified:

- Owner signup and onboarding, adding a family contact, selecting Appointments and Reminders, and creating a fresh invitation code.
- Family signup, selecting “A family member invited me”, continuing to `/family`, and entering the code there.
- Invalid-code rejection, successful redemption, and used-code rejection.
- Correct owner identity and selected sections in the family view, with unselected sections absent.
- A reload preserves the accepted invitation.
- Removing Reminders updates the open family view.
- Revoking sharing removes the owner and shared sections from the open family view and after reload.

Selected evidence is saved in `artifacts/family-invitation`: `11-family-redeemed.png`, `15-family-scope-update.png`, `17-family-revoked-live.png`, and `18-family-revoked-reloaded.png`. The collaborative preview timed out twice with `Preview automation snapshot timed out after 15000ms`; the agent used an isolated fallback Chrome session. No existing real account was used and no backend deployment was performed.

The accounts labeled `Invitation QA Owner 20261025 Browser` and `Invitation QA Family 20261025 Browser` remain on the development deployment with sharing revoked. Their random passwords were kept only in the browser agent's memory. No additional browser defect was found in the exercised flow.

## Reproduced defects and local fixes

1. **Owner accounts could redeem family invitations.** A new regression failed because acceptance resolved successfully for another owner. `sharing.acceptInvite` now requires the family role, preserving the existing self-invitation error. Rejection does not consume the invitation.
2. **Revoked or expired family access still allowed conversation reads and replies through the API.** The old authorization checked `contact.linkedProfileId` only. `messages.inAppThreadWith` and `messages.replyInApp` now require a matching accepted, unrevoked, unexpired grant for the viewer, owner, and contact. Multiple-contact coverage verifies that an earlier revoked contact does not hide the remaining valid contact's conversation.

These fixes are local to the verification worktree. The shared development backend has not been updated.

One copy limitation remains: the code instructions always say “for 14 days”, but selecting a seven-day sharing end also makes the code unusable at that earlier end. The boundary regression verifies this behavior. The displayed instructions should describe the earlier limit; this run did not change the translated invitation copy.

## Automated coverage

`packages/backend/convex/sharing.test.ts` adds 22 cases covering the exact 14-day expiry boundary, earlier sharing end dates, normalized codes, invalid and reused codes, competing redemptions, anonymous and unfinished accounts, owner/self redemption, ownership checks, revoked invitations, scope deduplication and removal, photo permission rechecks, multiple grants, addressed updates, and conversation access after revocation or expiry.

`apps/web/src/components/circle/family-screen.test.tsx` adds three rendered component tests covering accessible code entry, empty submission prevention, successful acceptance, and preserving a rejected code for correction and retry. The tests use the actual Convex React hooks with stubbed transport.

Final integration verification:

- `bun run check`: passed.
- `bun run check-types`: passed (seven package tasks plus setup-script typecheck).
- `bun run test`: passed, 1,554 tests: backend 679, web 513, contracts 276, Solitaire 34, Mahjong 35, Discord bridge 4, setup 13. Three unchanged package test tasks used Turbo cache.

Existing unrelated web tests emit React `act` warnings. Turbo emitted cache-write permission warnings but completed successfully. Dependencies were installed from the lockfile into the isolated worktree.

## Limits

- Expiry boundaries use a controlled clock and local `convex-test`, not a 14-day wait on the development deployment.
- `convex-test` serializes top-level transactions. The competing-redemption test verifies a single winner locally; production optimistic-concurrency retries were not exercised.
- Local security fixes have not been verified against a deployed backend.
- A production build was not part of this test run.
- Clipboard copying and audible code playback were not verified in this run.

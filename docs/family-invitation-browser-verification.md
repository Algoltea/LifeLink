# Family invitation browser verification — October 25, 2026

Verified the existing app at http://localhost:3001 against the authorized dev deployment `quixotic-monitor-631`. Port 3001 listener PID 26493 had cwd `/Users/dev/Projects/Hackathon 2026/apps/web`; its source includes unrelated uncommitted work. No main-checkout files were modified, no backend was deployed, and no commit or PR was created. Browser work and artifacts belong to `/Users/dev/.t3/worktrees/Hackathon 2026/test-family-invitation-browser` (base `967d488`). This verifies the running app, not a clean build of this worktree.

## Accounts and cleanup

- Owner account full name: **Invitation QA Owner 20261025 Browser**; email `invitation-qa-owner-20261025-browser@example.test`; preferred name **QA Owner Browser**.
- Family account full name: **Invitation QA Family 20261025 Browser**; email `invitation-qa-family-20261025-browser@example.test`; preferred name **QA Family Browser**.
- Both accounts were newly created through sign-up. Owner used Practice mode with generated sample appointments. A new contact named Invitation QA Family 20261025 Browser was added; no existing real account was used.
- Accounts and synthetic owner data remain in the dev deployment. The invitation was consumed and sharing was explicitly revoked. There is no active sharing grant from this test. Accounts were not deleted. Passwords were random, held only in process memory, and were not saved. No provider connection or real outbound message was created.

## Observed results

1. Owner signed up, completed owner onboarding, opened Trusted circle, added the test family contact, and created an invitation selecting only **Appointments** and **Reminders**, with **No end date** for sharing.
2. Code was returned and privately retained for redemption. Done closed the one-time display; owner reload showed persisted permission state without redisplaying the code.
3. Family signed up independently, selected **A family member invited me**, and continued. Onboarding accurately says the code is entered on the next screen, `/family`.
4. Invalid code showed: “That code did not work. It may have been used already, expired, or been cancelled.” The form remained usable.
5. Fresh code connected successfully. Family view named QA Owner Browser, showed the six Practice appointments and the empty Shared reminders section, and listed precisely “appointments, reminders.” Unselected groceries, photos, scam checks, and ride/update sections were absent. In-app conversation/reply controls were present as designed; no reply was sent.
6. Full family reload preserved the connection and scoped view. Full owner reload showed “Can see shared information,” Appointments, and Reminders.
7. Reusing the consumed code via **Connect** showed the same safe rejection. Existing sharing remained available.
8. Owner removed Reminders via Change permissions → Save permissions. The already-open family page updated to “appointments” and removed Shared reminders without reloading.
9. Owner chose Stop sharing, then confirmed. The open family page immediately removed the owner, appointments, and conversation, showing the empty-family message. Full reload remained empty. Owner showed “Sharing stopped.”

No additional reproducible browser defect was found. The instruction copy is workable: family-role onboarding leads to the code form. Clipboard copying, read-aloud, keyboard-only operation, mobile layouts, photo delivery, actual replies, and wall-clock expiry were not verified. The 14-day redemption claim was observed as copy, not established by waiting 14 days; backend expiry tests are owned by the separate backend agent.

## Security boundary

The backend agent separately found owner-role redemption and revoked/expired conversation API authorization defects and fixed them locally. The live deployment was deliberately unchanged during this test. Successful UI removal after revoke does **not** establish that direct conversation APIs reject access. These browser results neither validate the patched backend nor supersede the backend security findings. The coordinating thread owns integration and local regression results.

## Evidence

Screenshots and paired JSON text observations are in `artifacts/family-invitation/`:

- `10-invalid-code`: invalid-code recovery.
- `11-family-redeemed`: successful scoped family view.
- `12-family-reloaded`: persisted family view.
- `13-used-code`: actual Connect rejection of a consumed code.
- `14-owner-active-reloaded`: owner grant persisted without code redisplay.
- `15-family-scope-update`: immediate removal of Reminders.
- `17-family-revoked-live` and `18-family-revoked-reloaded`: revocation and reload.
- `19-owner-revoked`: final owner state.

An early automation attempt submitted the first form on a connected family page, which is the reply form. That produced a generic error and sent no message. It was corrected to explicitly click Connect; `13-used-code` was overwritten with the correct code-rejection observation. This was a harness selection error, not a product defect.

## Tooling and replay

Required collaborative-browser calls were attempted first: preview_status, preview_open, and two preview_snapshot calls. Both snapshots failed with `Preview automation snapshot timed out after 15000ms.` Verification then used fresh, isolated headless Chrome profiles through the installed zero-dependency CDP helper. The browser process required sandbox escalation; it was approved. Shared profile state was not cleared.

The small JSON-lines session harness is `scripts/qa/family-invitation-browser.mjs`. It reproduces the interaction primitives used for the verified session; it is interactive, not an automated pass/fail suite. The saved copy passed `node --check`; the session used its original `/tmp/family-browser-runner.mjs` copy. No new source fix was necessary; frontend regression tests are owned by the coordinator.

Run from the worktree (use a fresh timestamp in the account labels/emails):

```sh
FAMILY_BROWSER_CDP_HELPER='/Users/dev/Projects/Hackathon 2026/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs' node scripts/qa/family-invitation-browser.mjs
```

Example input lines:

```json
{"op":"open","page":"owner","url":"http://localhost:3001/sign-in?mode=sign-up"}
{"op":"signup","page":"owner","name":"Invitation QA Owner NEW_TIMESTAMP","email":"invitation-qa-owner-NEW_TIMESTAMP@example.test"}
{"op":"wait","ms":2000}
{"op":"eval","page":"owner","script":"document.querySelector('form').requestSubmit();true"}
```

Continue the steps above with `eval`, `goto`, and `capture`; `open` a separate `family` page to isolate account cookies. `rememberCode` reads the owner display into process memory; `enterCode` fills the family code field without printing the code. After connection there are two forms: always click the button whose text is exactly **Connect** for redemption tests. Capture only after sign-up navigation, and never capture the owner's active code display. Revoke sharing before finishing, then send `{"op":"close"}` to stop the isolated browsers and discard their profiles. The harness deliberately does not save passwords, invitation codes, cookies, or auth state.

Commands used for investigation included `lsof -nP -iTCP:3001 -sTCP:LISTEN`, `lsof -a -p 26493 -d cwd`, `curl -I http://localhost:3001/sign-in`, `node /tmp/family-browser-runner.mjs`, and `node --check scripts/qa/family-invitation-browser.mjs`. No application code changed, so no additional unit/type/build run was performed in this worktree; the coordinator runs local regressions separately.

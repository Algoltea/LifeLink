# Email safety implementation handoff

Implemented. Scope: email/scam backend and components only. Shared brand tokens remain parent-owned; components follow the updated parchment/copper/IBM Plex Sans direction through semantic tokens.

- Sync and Composio triggers both reach `emails.upsertMail`; the automatic local scan runs in that transaction, with persisted `scamCheck` metadata (review ID, rules version, timestamp, verdict, count) to avoid duplicate scans. Duplicate imports backfill old unscanned records. Inbox opening backfills the latest 25 stored/demo messages locally. No provider fetch occurs during backfill.
- Removed automatic `extractAppointment` scheduling from sync/trigger ingestion. Both summary and appointment actions require explicit stored `cloudAnalysisConsent`; missing flags on legacy rows deny cloud processing. Summary defaults to a local excerpt. Practice/sample messages never use cloud analysis.
- `webhooks.ts` calls `internal.emails.storeFromTrigger` with the connected account ID captured when the webhook is processed. The trigger mutation rejects inactive/non-mail connections and account changes before ingestion; batch storage validates connection ownership/provider/status.
- Manual `/scam` uses cloud AI by default (decided 24 October 2026: someone who submits a message to Scam check wants it checked). Main's Scam check v2 layout, camera input, results, and trusted-person actions are retained. Sources are labelled Text, Photo, and Email. The text/email/photo checkbox is replaced by one line saying an AI service reads it and to leave out passwords and card numbers. Practice mode never uses cloud analysis, and a missing key or model failure keeps a clearly labelled local fallback for text/email. Photos need AI; Text remains available through the source selector. Photos stay with their check until it is deleted, with retention explained under How checks work and in results/deletion. Live call screening keeps its separate consent checkbox. Automatic checks on incoming email stay local.
- `scam.get` authorizes the owner and lets an email's cached check remain readable after it falls outside the recent 20-review history. Baseline warning flags survive later summaries/manual results. Outlook text retains anchor destinations as plain text for local link checks.
- The local cache assumes imported message text is immutable (as in the existing upsert). A future edit/replace path must clear `scamCheck` before rescanning changed content. Rules updates increment `LOCAL_SCAN_VERSION`.
- No real mail was read or synced, no provider was mutated, and no message was sent. No secrets were read.
- Mailbox refresh is disabled in Practice mode in the UI and rejected before any provider read on the backend.

## Route audit setup

T3 `preview_status` succeeded; a separate incognito tab was opened (`tab_5_c96601ed-d33d-411c-a490-7b1cd9f99795`). `http://localhost:3001/email` redirects to `/sign-in`. Authenticated browser verification needs the parent's isolated practice fixture; this agent will not log into a real account or change existing servers.

Parent then authorized the isolated LifeLink UI Review Practice account in the default T3 profile. Own tab: `tab_a_c96601ed-d33d-411c-a490-7b1cd9f99795`. `/email` opens authenticated. Two screenshot attempts failed with `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.` A CUA fallback inventory found no browser surfaces. Page-text extraction was blocked by automatic approval review because it could include real mail; only non-content practice indicators are being checked next. No parent tab was operated.

### `/email` audit

- Non-content DOM measurements confirmed two rows, both labelled Practice, both with completed local checks, zero pending scans, no local check error, and no missing-backend-function error. Opening the inbox successfully persisted the local backfill for the two existing demo samples.
- No horizontal overflow at the actual browser width of 1280px. The new small-screen layout hides the list while a reader is selected and supplies a Back button, but actual mobile rendering remains unverified.
- Browser `preview_resize` accepted 1440px and 390px settings but reported/retained an actual 1280px viewport. Do not count this as a mobile pass.
- Opening the seeded sample row was rejected by automatic approval review as mail-content access. Reader interaction, screenshot capture, and independent visual inspection remain for parent final QA. No attempt was made to circumvent this rejection.

### `/scam` audit

- A transient hot-reload/SyntaxError page cleared after one bounded reload. The manual form then rendered normally.
- Verified default text source, unchecked cloud opt-in, disabled empty submission, and no horizontal overflow at actual 1280px.
- Hovered selected text-source control: foreground `rgb(255, 253, 248)`, background `rgb(143, 63, 37)`, height 54px. This directly checks the selected white-on-white hover defect against the current copper tokens.
- Entered only the synthetic fixture `Practice sample only: Urgent, act now. Buy gift cards immediately to claim your prize.` and submitted **Check locally** with cloud permission unchecked. Result rendered with Practice label, local-rule provenance, likely-scam verdict, and three signals. No real email, screenshot, secret, or message was sent.
- Switched to screenshot source: permission stayed unchecked, submission disabled, and the local-image limitation was present. No file was uploaded.
- Result sections now receive keyboard focus on new results/status changes. Screenshot/mobile verification remains parent-owned because full screenshots were rejected and viewport resizing did not apply.
- After returning through `/email` and reloading `/scam`, history still contained exactly two automatic checks plus the one synthetic manual check. Inbox revisits did not duplicate the persisted baseline reviews.

## Check results (during concurrent migration work)

- Bun `1.4.4`; no dependencies added and no tests added or changed.
- Focused Ultracite fix/check on the four backend paths and email/scam component folders: passed.
- Impeccable detector on both component folders: `[]` (no findings).
- Backend typecheck initially passed before parallel Spectrum edits arrived. Subsequent backend/web typechecks report only other agents' Photon/Spectrum exports/call-site errors and `apps/web/src/lib/speech.ts` AbortSignal callback typing. No email/scam diagnostics.
- Latest explicit backend and web `check-types` reruns both exited 0 after those parallel errors cleared.
- Existing backend suite: 58 passed, 85 failed, 143 total. Failures are the active Spectrum migration's Photon adapter/execution/iMessage/event tests (4 files); the other 4 files passed. Do not treat these as a clean full-suite result. Parent should rerun after migration settles.
- No production build was started against the user's active Next dev output. Parent owns isolated final build/verification.

Automatic approval review rejected a read-only child delegation as prohibited external project-data exposure. Review continues directly without delegation.

## AI checks on new email

Each newly arrived email still gets the instant local keyword check. If the owner's **Check new emails with AI** setting is on (the default; stored as `preferences.aiEmailChecks`, where a missing value means on), `upsertMail` also schedules `scam.checkNewEmail` once for that email. Only mail received in the last 48 hours is sent, so a first sync or a re-sync never floods the model; existing mail, backfills, re-synced messages and practice mailboxes are never sent. The check uses the scam-check model (`OPENROUTER_SCAM_MODEL`, default `openai/gpt-6-luna`, medium reasoning) with the same prompt as pasted message checks. Its result replaces the automatic review in place: quotes must match the email word for word, the keyword verdict remains the floor, and the review is marked as cloud-assisted. If the model is unavailable, the keyword result stays.

## Automatic mailbox warning drafts

Newly imported live emails received within 48 hours are eligible for a private warning draft when their automatic local or AI check reaches `likely_scam`. A weaker `suspicious` result, a manual review, a legacy backfill, or a Practice mailbox does not create a warning. Local warnings work even when AI checks are disabled or unavailable. The draft uses fixed LifeLink wording in the owner's help language, recommends contacting someone in their Trusted circle, and explains that nothing was sent and automated checks can be mistaken. It never copies the email body, attachments, or model-written instructions.

This is an explicit automatic mailbox write, separate from the ordinary approval-bound reply workflow. The dedicated adapter can only create drafts. It cannot send mail or contact the suspicious sender or anyone in the Trusted circle, and it never edits or deletes existing drafts.

For Gmail, Composio requires a recipient. LifeLink reads `GMAIL_GET_PROFILE` for the exact connected account and uses only that validated mailbox address. A missing or malformed address stops the attempt; account labels and incoming sender addresses are never substitutes. A supplied thread ID with no subject requests placement with the original email. Composio may fall back to a standalone draft for an inaccessible thread, so threading is best-effort. Outlook receives a separate, recipient-free draft identifying the original subject; its reply-draft tool would prefill the suspicious sender, so it is deliberately unused. Provider contracts: [Gmail](https://docs.composio.dev/toolkits/gmail.md) and [Outlook](https://docs.composio.dev/toolkits/outlook.md).

The external mailbox ID is pinned at ingestion. Immediately before the write, the backend rechecks ownership, Practice mode, active connection, provider, the pinned account, and the automatic verdict. One atomic claim per email covers local checks, later AI upgrades, concurrent actions, and repeated syncs. `emails.scamWarningDraft` stores `queued`, `created`, `failed`, `unknown`, or `skipped` and the returned draft ID when available. The claim becomes `unknown` before the provider call, so a crash, timeout, malformed success receipt, or failed persistence cannot authorize a duplicate. Attempts are not automatically retried, including after a user deletes the warning draft.

Drafts are supplementary warnings, not guaranteed notifications or provider scam banners. They may be missed, and Gmail's warning can be manually sent to the owner's own mailbox. Existing LifeLink warnings remain available. Live Gmail/Outlook placement, permissions, and client display still require provider verification; automated tests use synthetic mail and mocked transport.

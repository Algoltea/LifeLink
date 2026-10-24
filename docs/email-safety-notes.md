# Email safety implementation handoff

Implemented. Scope: email/scam backend and components only. Shared brand tokens remain parent-owned; components follow the updated parchment/copper/IBM Plex Sans direction through semantic tokens.

- Sync and Composio triggers both reach `emails.upsertMail`; the automatic local scan runs in that transaction, with persisted `scamCheck` metadata (review ID, rules version, timestamp, verdict, count) to avoid duplicate scans. Duplicate imports backfill old unscanned records. Inbox opening backfills the latest 25 stored/demo messages locally. No provider fetch occurs during backfill.
- Removed automatic `extractAppointment` scheduling from sync/trigger ingestion. Both summary and appointment actions require explicit stored `cloudAnalysisConsent`; missing flags on legacy rows deny cloud processing. Summary defaults to a local excerpt. Practice/sample messages never use cloud analysis.
- `webhooks.ts` already calls `internal.emails.storeFromTrigger`; no trigger hook change is needed. `http.ts` and `webhooks.ts` remain untouched. The trigger mutation rejects inactive/non-mail connections itself; batch storage validates connection ownership/provider/status.
- Manual `/scam` defaults to local rules and reuses the cached email baseline. Cloud analysis requires an unchecked, explicit per-submission opt-in; screenshots require that opt-in because the local check cannot read images. Model failure preserves a clearly labelled local fallback, with screenshot-unread wording.
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

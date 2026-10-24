# Scam check v2

Scam check now offers text, email, photo and speakerphone-call paths. The layout follows the Scam check v2 boards in Paper’s “Hackathon 2026” file, alongside the app’s Email and Trusted circle patterns. It uses plain columns, hairlines, large controls, the current Reach logo and a single warning panel. Photo results use the Email verdict and disclosure patterns. Matching loading layouts cover the landing page, form and earlier checks.

On `feat/ux-pass`, the merged UI uses AI by default for manual text, email and photo checks. The per-check checkbox is replaced by one plain disclosure line. Practice never uses AI, text/email keep their local-rule fallback, and live call screening retains its separate consent checkbox. Photo retention and the backend permission checks below remain in place.

## Calls

Live call screening uses a separate, passive Gemini session. Only microphone input transcription reaches the screen; assistant output, tools and generated audio are ignored. Real captions have unknown speakers rather than guessing Caller or You. The 24-second practice script uses known speaker labels, no microphone and no cloud AI. Its warning signs at 10, 14 and 18 seconds are fixed in the script.

Shared pure helpers merge partial/final captions, count heard words and redact long digit groups, including groups separated by whitespace or Unicode hyphens. Warning signs come from an AI check (`callscreening.analyze`), not keyword rules: about every 10 seconds of new speech, and once more when the call ends, the browser sends the newest redacted captions (up to 6,000 characters) to the same OpenRouter model used for message checks. The model returns warning-sign kinds — money, gift cards, codes or passwords, remote access, personal details, threats, and secrecy or pressure — each with a quote. The backend keeps a sign only when its quote appears word for word in the transcript, and each kind has fixed on-screen wording. The transcript is treated as untrusted evidence, nothing from the check is stored, and Practice mode is refused. If the model is not configured, the call screen and summary say that warning signs were not checked. The check can still miss warning signs and does not establish who is calling.

A bundled spoken alert asks the person not to share codes, passwords or money and to ask someone they trust. Capture pauses before playback, queued input is discarded, and capture resumes after the playback tail. Muting keeps the warning visible. Replaying cancels old resume timers, and reconnecting clears stale playback state. Stops and connection failures clean up pending microphone permission and late connections. Calls automatically finish at 30 minutes.

The browser keeps a rolling caption buffer in memory. After Finish, the summary page can show those captions under a closed “What LifeLink heard” disclosure until the person leaves; they are never submitted. Finish saves only bounded, redacted warning excerpts, times, duration, a word count and practice/interruption metadata in the separate, owner-only `scamCallSummaries` table. The word count separates “no warning signs heard” from “LifeLink didn’t hear the call”; older summaries without one show neither the count nor the silent state. No full captions or audio are submitted for summary persistence. Save is idempotent; final duration includes all flag timestamps. Earlier checks can reopen or delete a summary.

## Photos

The photo path accepts JPEG, PNG or WebP up to 6 MiB. It offers phone camera capture, a desktop camera preview, a photo chooser and drag-and-drop, plus readable errors and a text fallback. Camera resources and temporary object URLs are released when no longer used.

The new `scam.submitPhoto` action enforces permission, Practice-mode and service-configuration rules before storing a photo. Practice mode permits selecting a preview on the device, but does not submit or check it. Results show an authenticated thumbnail, extracted words, unverified evidence, the reading method and unreadable-photo recovery.

New photos stay with their check. Deleting an owned check also deletes its owned blob unless another check or photo record still references it. Deleting a check does not delete a trusted-person task. This does not promise deletion from an external reading service.

Older screenshot clients remain compatible: the original submission and analysis path keeps its original consent, Practice, configuration and file-metadata checks. Legacy storage IDs have unknown provenance. They are never promoted to owned photos and cannot expose a preview or authorize blob deletion. **Deleting an older check may leave its old blob in storage.** A shared blob can also remain after its owned check is deleted before a legacy reference. Cleaning up historical blobs needs a separate ownership migration.

## Trusted people and accessibility

Trusted rows use actual saved contacts, Avatar, TrustedBadge and the trusted icon. Call appears only with a valid saved phone number and is disabled in Practice mode. Message opens the existing task review; it never sends directly. Alerts use `role="alert"` and focus their headline. Captions have a named live region, keyboard scrolling and Smaller/Bigger controls. The layout uses the app’s 18px base text, controls at least 48px high, and no new animated motion or left-edge accent stripes.

## Decisions and review log

| Question | Reviewer and decision |
| --- | --- |
| Can privacy copy say nothing is saved when Earlier checks stores a summary? | Claude Fable 5.1: persist a short backend summary, discard full captions, and disclose both. Device-only storage would not match shared task/history behavior. Only short redacted flags cross the summary API, avoiding raw transcript arguments. |
| Delete photos immediately after reading, or keep the required result preview? | Claude Fable 5.1 initially proposed immediate deletion, then explicitly withdrew it: keep the photo with the check, disclose retention, and delete owned storage when the check is deleted. |
| Extend the existing review input-kind union? | Claude Fable 5.1: use an additive call-summary table and functions so older clients remain compatible. |
| Label real-call speakers? | Claude Fable 5.1: leave mixed microphone captions unlabeled; label only the fixed practice script. |
| Let the assistant participate in the call? | Claude Fable 5.1: passive screening with rules first and no tool execution or assistant speech. The native-audio model requires an AUDIO response configuration, but output is discarded and never played or analyzed. |
| Does Practice mean nothing is saved? | Claude Fable 5.1: no microphone or cloud AI; a short Practice summary is still saved in Earlier checks. |
| What should happen to legacy screenshot uploads with unknown ownership? | GPT-6.1 Sol, after Fable’s safety-review call was rate-limited: preserve legacy submit and run behavior, but no preview, deletion or ownership promotion. New uploads use the owned-photo action. |
| Which copy contradictions must be fixed? | Claude Fable 5.1 reviewed all new copy: distinguish practice from real listening, initial connection failure from dropped connections, Finish from Stop after an error, include calls in empty history, match the skeleton’s button label, and remove “local check” jargon from the new photo error. All must-fix suggestions were applied. Spoken and visible warning wording were also aligned. |
| Are lifecycle fixes sufficient? | GPT-6.1 Sol verified old alert-tail cancellation and final duration bounds. A follow-up found and fixed stale playing state suppressing warnings after reconnect. |

## Verification

Final validation passed: `bun run check`, `bun run check-types`, `bun run test` and `bun run build`. The 526 tests comprise 289 backend, 186 contracts, 34 solitaire, 4 bridge and 13 setup tests. Focused tests cover caption merging, conservative flagging, Unicode redaction, the deterministic script, transport cancellation/muting, summary ownership/idempotency/bounds, photo consent/ownership/deletion, legacy screenshot compatibility and passive token setup. The sandbox emitted non-fatal cache-write warnings (`WARNING  IO error: Operation not permitted (os error 1)`); every command exited successfully. The production build ran with the local port access Turbopack requires.

T3 preview browser checks used the signed-in LifeLink UI Review account in Practice mode on port 3002, at desktop and 390px phone widths:

- Landing layout, photo choices, disabled live Start and disabled photo submission in Practice.
- Repeated full practice calls with the same three flagged times, alert focus, muted/unmuted playback state, summary persistence and summary deletion.
- No horizontal overflow at phone width, large controls and trusted-person rows before captions in the mobile alert layout.
- Non-image and over-6-MiB validation; a valid selected photo preview remained blocked from checking in Practice.
- A typed message check produced a verdict. Message Sam opened the exact review-before-send task. That test draft was cancelled without approval or sending.

The additive backend was deployed to the shared development deployment to verify these flows. The web server uses port 3002; the user’s port 3001 was not used. No real call, live microphone, photo reading provider, camera permission prompt, real message, or approval was exercised. Real-device camera behavior, live captions and acoustic alert isolation still need device/provider verification. Automated audio playback state was checked; physical speaker audibility was not measured. T3 screenshots occasionally timed out; DOM inspection and later saved screenshots succeeded.

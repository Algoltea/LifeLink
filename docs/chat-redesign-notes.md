# Chat redesign

## Direction contract

Mode: Operate. The chat answers one question: what can LifeLink help me do, and what exactly am I approving?

The parent overhaul owns the warm Victorian inventor direction: parchment `#FAF4E8`, surface `#FFFDF8`, ink `#2D2118`, muted `#6C5C4C`, copper primary `#8F3F25`, and brass `#AC741C` for details. IBM Plex Sans uses an 18px body and 32px page title. This work inherits semantic surface, foreground, primary, border, and status tokens; it introduces no independent brand system or green/blue accents.

An empty chat centers the composer and a short invitation. After the first message, the conversation fills the available space and the composer stays at the bottom. History is a labeled control at the top right, opening a right-side drawer. Each history row represents a persisted, private conversation.

The defining interaction is a live action review inside the assistant reply: the exact current details, explicit approval, editing, cancellation, and delivery outcome remain together. No approval depends on a tool-result snapshot.

## Architecture and route audit

This change owns `components/assistant`, `components/tasks`, assistant conversation APIs, and the `assistantConversations` table. The parent subsequently authorized focused changes to `components/voice/composer.tsx`, `components/app/offline-queue.tsx`, and `lib/offline-queue.ts` for conversation/account binding and draft preservation.

- `/ask`: the account-keyed workspace holds unsent drafts by thread ID for the current visit. Switching history restores those drafts. Switching accounts unmounts the workspace. A saved, owned empty conversation is prepared before the composer becomes interactive, so the first voice request does not replace its component and end the voice session.
- The transcript scrolls independently; the composer occupies the bottom of the available workspace after a message or offline queued request. The workspace measures the space below the shell and notices, including viewport changes. The transcript follows replies only while the person remains near its end. Earlier-message loading and earlier-conversation loading are separate controls.
- History uses a Base UI modal dialog positioned at the right edge, with a visible title, close button, loading/error states, current-chat indication, focus trapping, Escape, and focus return. Rows are persisted conversations, not sample data. New chat reuses an existing empty selected conversation instead of creating duplicate empty rows.
- `/tasks/[taskId]` remains available for the complete task journey. Chat proposals no longer navigate there to obtain approval. The existing Today task panels and standalone task screens reuse the same updated action review controls.
- The Today composer also prepares a stable thread before accepting text/voice. Existing voice configuration, captions, dictation, and request handling remain in place. Stopping voice or switching threads invalidates a pending connection attempt; a late connection is stopped rather than attaching to a departed conversation. The helper names the microphone instead of its color.

## Persistence and authorization

`assistantConversations` records `ownerId`, Agent `threadId`, title, update time, and whether the chat has messages. The existing `profiles.assistantThreadId` is the selected conversation, not the complete history. Old single-thread profiles remain readable and are registered before selection changes, so their only history reference is preserved.

- `assistant.myThread({})` returns the selected owned thread.
- `assistant.newConversation({})` and `selectConversation({threadId})` persist selection. The latter rejects other owners' threads.
- `assistant.listConversationHistory({paginationOpts})` uses native owner-indexed pagination. Its first page can include an unregistered legacy thread; that virtual row disappears after registration. The older `listConversations({})` API remains compatible, but the drawer uses the paginated API and has no 100-conversation cap.
- `assistant.submitRequest({text, channel, threadId?})` accepts an explicit initiating thread ID and verifies ownership. Bound submissions do not change the selected conversation. Legacy callers can omit the optional argument. Scheduled responses keep the saved thread ID even if the person switches chats while waiting.
- Agent context explicitly disables searching other conversations. Neither family access nor a client-supplied identity can authorize conversation reads.

## Current action review

Live-model and new Practice-mode proposal tool results contain action identity. `InlineActionReview` subscribes to `assistant.actionReview({actionId})`, which re-checks ownership and derives the exact current action view from the existing task query. Older tool outputs with only a task ID use `taskActionIds` to resolve owned actions, then subscribe to each by action ID. The tool-result text never supplies approval details or an approval fingerprint.

The review shows its version and status. Approval still carries the displayed `{actionId, version, fingerprint}` through the shared approval mutation, including offline approval. Editing calls `assistant.reviseWords`, which checks the displayed version before invoking the existing revision mutation in the same transaction. A consequential edit still invalidates old approval through the existing lifecycle code.

Editors retain unsaved text when another update arrives. A conflict blocks saving until the person compares the latest displayed details and chooses whether to keep their edits or use the latest words. A request that has started retains any unsaved words for copying but disables saving. Entering editing focuses the textarea; completing an edit or approval moves focus to the updated review status when focus belonged to that review. Manual outcome confirmation awaits the mutation, disables both contradictory controls while pending, and reports failures inline. Cancellation remains available before execution, including the approved waiting state; execution and unknown outcomes retain their existing safeguards.

## Offline and account boundaries

The v2 offline queue is stored under a profile-specific key. Every entry also carries that profile ID; requests carry their initiating thread ID. Only the current authenticated profile's queue is shown or replayed, and replay stops when the profile changes. Backend ownership checks remain authoritative for requests and approvals. Connection failures retain queued work for reconnection; explicit server rejections are surfaced and removed. Storage failures do not clear the composer's text or falsely report a saved approval.

The old `lifelink:offline-queue:v1` storage is deliberately left untouched and never replayed automatically: it contains no trustworthy initiating account/thread binding. New queues never infer ownership for those entries. Draft preservation is in memory for the current Ask workspace visit, not a new server-side draft or cross-device feature.

## Validation and limits

- Focused Ultracite formatting and lint pass across the modified chat, task, composer, queue, assistant, and schema files.
- Web TypeScript check passes after the coordinated backend imports stabilized.
- Existing approval, permissions, outcomes, journey, and event suites: **22 tests passed across 5 files**. No regression tests were added. The backend implementation also passed its backend typecheck and performed network-disabled in-memory ownership/migration checks without adding test files.
- Live read-only inspection used an agent-owned T3 tab in the isolated Practice account. The Ask page renders, uses IBM Plex Sans, and has no horizontal overflow at the measured 1280×800 viewport. Its workspace fits below the actual shell/notices (main ends at y=800). History opens a right-side dialog containing the real saved empty conversation. Escape closes it and returns focus to History. No chat messages, approvals, provider connections, or real sends were performed.
- T3 screenshot capture repeatedly returned `Preview automation snapshot timed out after 15000ms.` Its requested resize also reported the old measured 1280×800 viewport. Screenshot/mobile visual approval and first-message/edit/approval runtime transitions remain for the parent's final route QA; DOM inspection is not a screenshot review.
- The design detector found one existing thick left border in task messages; it was replaced with a neutral thin border. Shared palette, Paper, shell, and global design documentation remain parent-owned.
- The initial independent review's issues about lost edits/focus, unchecked outcome promises, active-thread submission, and capped history were addressed. Automatic approval review rejected the optional second provider-backed delegated review under the retained no-provider-calls constraint. No retry or bypass was attempted; final checking used local lint, TypeScript, existing tests, and direct code inspection.

## Mobile QA correction

Parent QA at 390×844 found that the stacked composer consumed 356px, leaving only 24px for the empty prompt or 70.5px for an active transcript. Bottom alignment pushed the taller empty prompt above its collapsed region.

The composer now puts the microphone, a short-placeholder textarea, and Ask on one row, with help text across the row below. Controls retain at least 48px targets; textarea and caption heights are bounded and scroll internally. Empty conversation content keeps its intrinsic height instead of shrinking under bottom alignment. Active transcripts have a `min-h-40` minimum (180px at the current 18px root scale). The heading cannot shrink; tighter mobile gaps and a 28rem workspace minimum allow natural document scrolling at short or keyboard-reduced viewport heights. The existing live announcement is preserved.

Focused lint/format and the web typecheck pass after the layout correction. Agent-owned desktop measurement shows a 147px composer, a 416.5px active transcript, no horizontal overflow, and main content ending exactly at the viewport bottom. This agent's T3 resize continues to measure 1280×800 after requesting 390×844; the parent's working mobile tab supplies the final mobile evidence. No additional messages or approval actions were performed by this agent.

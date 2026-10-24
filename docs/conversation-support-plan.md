# Conversation support: product and implementation plan

Status: increments 1, 2, 4, and 5 are implemented. Increment 3 (guided practice) shipped and was then removed. Section 11 records that and the other differences from this plan. The live phone companion (section 8) remains evaluation only.

LifeLink's core flow still applies to everything here: _speak or type → review the exact action → approve → follow progress → see an accurate result._ None of these features adds a new way to send, save, or share anything. Any outward step goes through an existing action kind (`send_message`, `email_draft`, `create_reminder`, `calendar_event`) and the existing exact-version approval.

---

## 1. What the repository does today

These findings come from reading the code at `8cde579` and running the rule patterns against sample text. They determine where each feature fits.

### Scam checks (`packages/backend/convex/scam.ts`, `packages/contracts/src/model-output.ts`)

- **Model quotes are stored without verification.** `scamReviewSchema.signals[].quote` is a nullable string. `scam.finish` decodes the model output and stores `result.signals.slice(0, 8)` as-is. The system prompt asks for "the exact words that worry you", but no code checks that the quote appears in `review.inputText`. A fabricated or paraphrased quote is shown to the person in a `<blockquote>` (`scam-result.tsx:278`) as if it were the message's own words.
- **Negated warnings count as warning signs.** The local rules match a keyword, not a request. Results from the same regexes the rules use:

  | Text | Rule hit |
  | --- | --- |
  | "Your bank will never ask for your verification code. Do not share it with anyone." | Mentions private details (weight 3) |
  | "We never ask you to pay with gift cards." | Mentions a payment method (weight 3) |
  | "Reminder: never share your PIN or password." | Mentions private details (weight 3) |

  A genuine safety notice therefore scores as "suspicious" before any other signal. This is a bigger problem than it looks because local checks run automatically on every imported email (`ensureEmailCheck`), set `emails.suspicious`, and appear in the family member's **Scam alerts** section (`family.ts` `scamAlertsSection`) when the owner has shared that scope.

- **The model schema has no stance.** A signal cannot express whether the message _asks for_ a code or _warns against_ sharing one.
- **Screenshots have no text to validate against.** For `inputKind: "screenshot"`, `inputText` is whatever the person typed (often nothing). Quotes the model reads from the image cannot be checked, but the UI shows them exactly like verified quotes.
- **What already works and should stay:** `likely_safe` is coerced to `unsure` on save, the result always says it cannot prove a message is genuine, cloud analysis is per-submission opt-in, Practice data never goes to a cloud model, and the "Ask someone you trust" message never forwards the suspicious content.
- There are no scam tests in `packages/backend/tests`.

### Messages and email

- `messages.thread` returns up to 60 messages for one contact; incoming bodies are capped at 4,000 characters (`lib/incoming.ts`). There is no explanation, summary, or suggestion feature on a thread.
- `thread-screen.tsx` has a single compose box. Submitting calls `messages.draft`, which creates a `send_message` task with `proposedBy: "person"` and routes to `/tasks/[id]` for approval.
- `email-reader.tsx` has a consented summary (`emails.summarize`) and a reply box that calls `emails.draftReply` (an `email_draft` action, saved to the mailbox only after approval).
- Because both compose paths already exist, **suggested replies need no new action kind, no fingerprint change, and no change to approval code.** A suggestion only fills the existing text box.

### Reply interpretation (`replies.ts`, `lib/journey.ts`)

- The ride journey already separates _asked → replied → confirmed_: a reply is classified, and only an `accepted` classification _proposes_ a `confirm_arrangement` action that the person approves.
- **The Practice-mode reply reader misreads refusals and non-commitments.** `rulesClassify` treats any `YES_PATTERN` match as acceptance before considering `NO_PATTERN`:

  | Reply | Classified as |
  | --- | --- |
  | "Sorry, I can't make it Tuesday." | accepted (`\bi can\b` matches inside "I can't") |
  | "I'll check and let you know" | accepted |

  Approval still protects against acting on this, but in Practice mode it presents a refusal as a yes, which is exactly the offer/agreement confusion feature 4 must avoid.

### Practice mode

- "Practice mode" is the account-level `profiles.demoMode` flag. It seeds sample contacts, emails, an appointment, and a grocery list (`demo.ts`), and simulates sends and replies. There are no guided rehearsals. The only route with "practice" in its path, `/groceries/practice`, is a recovery page for retired shopping.

### Preferences

- `preferences` holds captions, contrast, read-aloud, reduced motion, speech rate, text scale, theme, and grocery notes. There is no explanation length, language, or communication-style setting, and no translation feature anywhere in the app.
- The assistant's instructions (`assistant.ts` `instructionsFor`) are fixed. Briefings (`briefings.ts`) use a facts-only pattern: the model may only rephrase supplied facts, with a rules fallback.

### Privacy boundaries to preserve

- The family view (`family.ts`) is built from explicit sections and re-checks live grant scopes on every read. Scam alerts reveal only that a check happened, its kind, and its verdict.
- New private data must stay out of: `family.ts` sections, `familyUpdates`, `family_update` action text, reminder `shareWithCircle` defaults, and the assistant's agent thread.

---

## 2. Priorities

| Order | Increment | Ideas | Why this order |
| --- | --- | --- | --- |
| **1** | Evidence-validated scam warnings | 2 | Fixes a correctness gap that already reaches people and family alerts. Small, self-contained, and produces the evidence validator that every later feature reuses. |
| **2** | "Help me understand this" with suggested replies (messages first, then email) | 1 | Highest everyday value. Builds on the validator and the existing compose and approval paths, so it needs no change to approvals. |
| **3** | Guided practice conversations | 3 | Independent of providers and the backend. Can run in parallel with 2 once its content is agreed. |
| **4** | Explanation preferences, structured part | 5 | Short vs detailed and "one step at a time" are cheap once explanations exist. Language and free-text notes come later, with more privacy work. |
| **5** | Conversation recaps with proposed next steps | 4 | Most valuable after 1 and 2 prove the evidence model. Needs the reply-reader fix and careful offer/agreement semantics. |
| Later | Live phone companion | none | Evaluation only (section 8). |

**Recommended first increment: 1 and 2 together**, delivered as two pull requests in that order. Increment 1 is a prerequisite for 2 and is worth shipping alone.

---

## 3. Increment 1: Evidence-validated scam warnings

### Product behavior

- Each item under "What stood out" shows a quote only if those exact words are in the text LifeLink was given.
- If the assistant cites words that aren't in the message, the quote is removed and the result says so in plain words: "Some words the assistant pointed to were not found in the message, so they are not shown." Confidence is lowered.
- Text that _warns against_ an action (for example, "never share your code") is shown separately from text that _asks for_ it, and never raises the verdict by itself. The wording stays careful: "This message tells you not to share codes. Real companies say this, and scammers copy it too, so check any other requests in it."
- For screenshots, quotes read from the image carry a visible note: "Read from the screenshot. LifeLink could not check these words against the original text."
- Nothing in this increment ever says a message is safe. `likely_safe` continues to be saved as `unsure`.

### Technical design

**Shared validator: `packages/contracts/src/evidence.ts` (new, pure, tested).**

```ts
type EvidenceCheck =
  | { found: true; start: number; end: number; text: string } // text === source.slice(start, end)
  | { found: false };

const locateQuote: (source: string, quote: string) => EvidenceCheck;
```

- Matching is an exact substring of the original text. Empty and whitespace-only quotes are rejected. Matching is case-sensitive by default.
- The stored and displayed quote is always `source.slice(start, end)` from the original, never the model's string.
- Open question (default: no): whether to allow whitespace-run and typographic-apostrophe differences. If allowed, matching must still map back to original offsets so what's displayed is the original's exact text.

**Negation and stance: `packages/contracts/src/stance.ts` (new, pure, tested).**

- `stanceOf(source, matchStart)` inspects a bounded window before a match (same sentence, about six words) for negators: _never, don't, do not, won't, will not, no one will, not, avoid_. It returns `"warns_against"` or `"requests_or_mentions"`.
- It's deliberately conservative. It only downgrades a hit when a negator clearly governs it. "Don't tell anyone, just buy the gift cards" is still a payment request, because "buy" sits between the negator and the match. The tests cover this case.

**Model contract (`model-output.ts`).**

- Add `stance: z.enum(["requests", "warns_against", "mentions"])` to each `scamReviewSchema` signal. The field is required because strict JSON schema mode needs every field.
- The prompt gets one line asking it to set `stance` and to copy quotes character for character.

**`scam.finish` becomes the enforcement point.** It's a pure helper, `validateReview(result, review)`, so it can be unit-tested:

1. For each signal with a quote, check `locateQuote(review.inputText ?? "", quote)`.
   - If found, store the original slice and set `evidence: "verified"`.
   - If not found and the review is a text or email review, drop the quote. Keep the signal's label and detail only if the local rules independently found the same category; otherwise drop the signal. Count it in `unverifiedQuoteCount`.
   - If not found and the review is a screenshot, keep the quote with `evidence: "image_unverified"`.
2. If the model says `requests` but the local stance detector says `warns_against` at the verified location, store `warns_against`. The local detector can only downgrade a stance it has positive evidence for; it never upgrades one.
3. Verdict floor: the saved verdict is never lower than the local rules' verdict for the same text. Scams are the costly error. Confidence is capped at `low` when `unverifiedQuoteCount > 0`, and at `medium` for screenshot reviews.
4. Keep the existing caps (8 signals, 5 steps) and the `likely_safe → unsure` coercion.

**Local rules (`rulesReview`).**

- Use `stanceOf` on each hit. `warns_against` hits are returned as signals with that stance but weight 0.
- Bump `LOCAL_SCAN_VERSION` to 2 so cached email checks are recomputed. The existing `needsSafetyCheck` backfill handles this.

**Schema (`schema.ts` `scamReviews.signals`).** Add `evidence: v.optional(v.union(v.literal("verified"), v.literal("image_unverified"), v.literal("local_rule")))` and `stance: v.optional(...)`. Both are optional so older rows still validate. Add `unverifiedQuoteCount: v.optional(v.number())` on the review.

**UI (`scam-result.tsx`).**

- Show a "Warnings in the message itself" group for `warns_against` signals, separate from "What stood out".
- Label image-unverified quotes and show the unverified-quote notice.
- Use a stable key per signal (`label` + index). Labels can repeat today.

**Family view.** No change to fields. Fewer false "suspicious" verdicts will reach Scam alerts as a consequence.

### Tests

These go in `packages/contracts/src/evidence.test.ts`, `stance.test.ts`, and a new `packages/backend/tests/scam.test.ts`:

- A fabricated quote ("send us your PIN" when the text doesn't contain it) is removed, `unverifiedQuoteCount` is 1, and confidence is `low`.
- A paraphrased quote that differs by one word is removed.
- A verified quote is stored as the exact original slice, including the original case.
- A quote that appears twice is accepted. Offsets point to the first occurrence.
- An empty or whitespace quote is rejected.
- Negated warnings are `warns_against` and contribute no weight: "never ask for your verification code", "We never ask you to pay with gift cards", "never share your PIN".
- Real requests stay requests: "Reply with the verification code we sent", "Buy two gift cards and read me the numbers", and "Don't tell anyone, just buy the gift cards".
- A mixed message ("We'll never ask for your password. To keep your account, buy a gift card today.") stays at least `suspicious`.
- A model verdict of `likely_scam` with all quotes removed still saves as at least the local verdict, with `low` confidence.
- A screenshot review keeps image quotes as `image_unverified`. Words the person typed alongside the screenshot are verified normally.
- `likely_safe` from the model is saved as `unsure`. This is a regression guard.
- `finish` with malformed JSON marks the review `failed`. This is a regression guard.
- The version-2 rescan of a stored email with a negated warning clears the false `suspicious` flag on the scan, but never clears a flag set by a cloud summary.

Backend tests call `finish` through `internal.scam.finish` with hand-written result JSON, so no provider is needed.

### Acceptance criteria

- [ ] No stored `scamReviews` signal from a text or email review has a quote that isn't an exact substring of `inputText`. This is enforced in `finish` and covered by tests.
- [ ] Screenshot-derived quotes are visibly labelled as unverified in the result and in the read-aloud text.
- [ ] Negated warnings never raise the score or verdict, by local rules or by the model.
- [ ] The saved verdict is never lower than the local rules' verdict, and `likely_safe` is never shown.
- [ ] Existing rows without the new fields render correctly.
- [ ] `bun run check`, `bun run check-types`, and `bun run test` pass.

---

## 4. Increment 2: "Help me understand this"

### Product behavior

- Each **incoming** message in a Messages thread, and each email in the reader, gets a **Help me understand** button.
- The explanation panel shows these sections. Empty sections are hidden.
  1. **In plain words:** two or three short sentences.
  2. **What they're asking:** explicit requests, each with the quoted words.
  3. **Dates and times mentioned:** quoted as written. A resolved date is shown only if it's unambiguous, for example "Tuesday (October 28)".
  4. **Not said yet:** missing details, for example "No pickup time is given."
  5. **What it might mean:** possible interpretations, headed "This is a guess, not something they said."
  6. **Possible replies:** up to three, such as accept, ask a question, or decline. Each shows its full text. **Use this reply** puts the text into the existing message box, moves focus there, and announces "Reply added to your message. You can change it before reviewing." Nothing is sent. The person still presses **Review before sending** and approves the exact version on the task screen.
- The panel says "Only you can see this." Explanations are never shown to family, never put in a shared update, and never sent anywhere.
- **Read aloud** is available, as it is everywhere text matters.
- Photos aren't explained: "This explanation covers the words only, not the photos."

### Cloud use and Practice mode

- A cloud explanation requires the same explicit, per-request opt-in used for email summaries. The checkbox is unchecked by default and reads "Use the cloud assistant for a fuller explanation. The message text is sent to the AI provider."
- Without consent, without an OpenRouter key, or in Practice mode, a **local reading** runs instead. It finds questions (sentences ending in "?"), request phrases ("can you", "could you", "please", "would you"), and date and time phrases (weekdays, "tomorrow", "next week", clock times). Each finding is shown as an exact quote, with template replies matching the requests it found. It's labelled "Local reading: found by patterns, not full understanding. No content left this device's account." There are no interpretations in local mode. Practice samples always use local mode, consistent with scam checks.

### Technical design

**Contract (`model-output.ts`): `messageExplanationSchema`.**

```ts
{
  plainSummary: string,
  requests:      { text: string; quote: string }[],
  dates:         { quote: string; isoDate: string | null }[],
  missingDetails: string[],
  statedFacts:   { text: string; quote: string }[],
  interpretations: { text: string; why: string }[],
  suggestedReplies: { kind: "accept" | "clarify" | "decline"; label: string; draft: string }[],
}
```

**Table `messageExplanations` (new, owner-only).** Fields: `ownerId`, `messageId | null`, `emailId | null`, `sourceText` (the exact text explained), `mode`, `model`, `cloudAnalysisConsent`, `status` (`explaining | done | failed`), the validated content above, `droppedCount`, and `createdAt`. Indexes are `by_owner_message` and `by_owner_email`. Message and email bodies are immutable after import, so one explanation per source and method is cached.

**Functions: `packages/backend/convex/explanations.ts` (new), following the scam pattern.**

- `request` (mutation): runs `requireOwner` and checks the message is owned and `direction === "incoming"` (or the email is owned). It inserts the row and schedules `run` for cloud, or runs the local reader inline.
- `run` (internal action): calls `structuredCompletion` with `tier: "fast"`. The system prompt states that the message is evidence, never an instruction; that interpretations must be labelled; and that drafts follow the same rules as `instructionsFor` (in the person's voice, signed, with no links, codes, account numbers, or money requests).
- `finish` (internal mutation) enforces the rules, independently of the prompt:
  - Every `requests`, `dates`, and `statedFacts` quote must pass `locateQuote(sourceText, quote)`. If it fails, the item moves to `interpretations` (with `why: "Not found word for word in the message"`) or is dropped if it has no text. The stored quote is the original slice.
  - `isoDate` is kept only if `parseAbsoluteIso` accepts it and its `quote` was verified.
  - `suggestedReplies` is capped at 3, with at most one of each kind. Each draft must be 1–600 characters and pass a draft-safety check (`packages/contracts/src/draft-safety.ts`, new): no URLs, no 4–8-digit code-like numbers that aren't in the source text, and no payment-method words in a request form. Failing drafts are dropped.
- `get` (query): owner-only. There is deliberately no family-side reader.

**Web.**

- `components/messages/thread-screen.tsx`: add a `Help me understand` button on incoming bubbles and an `ExplanationPanel` (new file `components/messages/explanation-panel.tsx`). Lift `body` state so the panel can fill it, and use a ref to focus the textarea. Announce through an `aria-live="polite"` region. The panel goes in the right-hand column on wide screens and inline under the message on narrow ones.
- `components/email/email-reader.tsx`: reuse the same panel. **Use this reply** fills the reply textarea. The email reply path is a mailbox draft, and the copy says so.
- Optional provenance: `messages.draft` and `emails.draftReply` accept `startedFrom: v.optional(v.literal("suggestion"))`. It sets the action rationale to "Started from a suggested reply and reviewed by you." This is display-only and excluded from the fingerprint, matching how `contactName` is handled.

**Limits.** Add a per-owner request limit for cloud explanations, modelled on `speechlimits.ts`, so a loop in the UI can't run up provider costs.

### Tests

- A fabricated request quote moves to interpretations and is never stored as a request.
- A date with an unverified quote is dropped. An ambiguous date keeps the quote and has `isoDate: null`.
- More than three suggested replies are cut to three, with no duplicate kinds.
- A suggested draft containing a URL, a code-like number, or "buy gift cards" is dropped.
- A family member calling `explanations.get` for the owner's row is rejected. `family.overview` contains no explanation data.
- A Practice (simulated) message never schedules a cloud run, even with consent set.
- An outgoing message can't be explained.
- `messages.draft` with `startedFrom: "suggestion"` creates the same fingerprint as without it. Editing the draft after review creates version 2 and voids approval. This reuses the `approvals` test helpers.

### Acceptance criteria

- [ ] From an incoming message, a person can open an explanation, choose a suggested reply, edit it, and reach the existing task review with that exact text. No message is sent without approval of that version.
- [ ] Every quoted request, date, and stated fact on screen is an exact substring of the original message.
- [ ] Interpretations are visually and verbally separated from stated facts, including in read-aloud.
- [ ] Explanations never appear in any family-facing query, shared update, or message.
- [ ] Without consent, without a key, or in Practice mode, the local reading works and says what it is.
- [ ] Works by keyboard alone, with 48px targets, a visible focus ring, and focus moving to the message box after **Use this reply**.
- [ ] `bun run check`, `bun run check-types`, and `bun run test` pass.

---

## 5. Increment 3: Guided practice conversations (removed)

### Product behavior

- A new **Practice a conversation** screen offers four short rehearsals (three to six turns each):
  1. **Booking an appointment:** a receptionist offers times. The person practises choosing one, asking about parking, and repeating back the date.
  2. **Asking family for a ride:** practise asking clearly with the day, time, and place, and handling "I can't, but Thursday works."
  3. **Asking someone to repeat or write it down:** a pharmacist gives instructions quickly. The person practises "Could you say that again more slowly?" and "Could you write that down for me?"
  4. **A suspicious caller:** a caller claims to be from the bank and asks for a code. The person practises "I don't give codes over the phone. I'll call my bank on the number on my card," and ending the call.
- Each turn shows what the other person says (with read-aloud), up to three optional response choices, and **Say it my own way**. That option takes typed or dictated text, which is accepted without grading, and the script continues neutrally. Feedback is encouraging and specific, never scored.
- Every screen carries the **Practice** label, and the heading includes "(practice)". The other party is a fictional role ("Receptionist at a sample clinic"), never a real contact.
- The end-of-practice recap lists what was practised, the useful phrases to remember (each with read-aloud and copy), and a fixed line: "This was practice. No appointment was booked and no message was sent."
- An optional link at the end, "Ready to do it for real? Ask LifeLink", opens Ask with a starter sentence. It starts the normal flow from scratch with full review. No state carries over from the rehearsal.

### Technical design

- **Pure engine and scripts:** a new package `packages/rehearsals`, following the `packages/solitaire` precedent of pure logic with Vitest tests. It contains `Script`, `Turn`, `Choice`, and `Recap` types; the four scripts as typed data; and `start`, `choose`, `answerFreely`, and `recapOf` as pure reducers.
- **Web:** `apps/web/src/features/rehearsals/` holds the screen and the local save/resume (localStorage, like solitaire). The route is `apps/web/src/app/(app)/practice/page.tsx`, with an entry point under Settings, Practice and a card in Today's getting-started list.
- **The structural guarantee that nothing becomes real:** the rehearsal feature makes no Convex calls. Add an Oxlint `no-restricted-imports` override for `apps/web/src/features/rehearsals/**` and `packages/rehearsals/**` that bans `convex/react`, `@lifelink/backend/*`, and `@/lib/offline-queue`. A rehearsal therefore can't create a task, action, appointment, or message, and the lint step proves it.
- Rehearsals are available whether or not account Practice mode is on, because they never touch account data.

### Tests (`packages/rehearsals`)

- Every script's graph is finite, has no dead ends, and every path reaches a recap within its turn limit.
- Every choice and free answer leads to a defined next turn.
- Every recap includes the fixed "This was practice" line.
- No script text contains a URL, a phone number in a real format, or a sample contact's real name.
- Serialization round-trips, and corrupted saves are rejected (mirrors solitaire).

### Acceptance criteria

- [ ] All four rehearsals can be completed by keyboard and by tap with no providers configured.
- [ ] No rehearsal code path imports Convex or the offline queue. The lint step enforces this.
- [ ] Every rehearsal screen shows the Practice label, and every recap states nothing was booked or sent.
- [ ] Read-aloud and captions follow the person's existing settings.

---

## 6. Increment 4: Explanation preferences

### Phase A (recommended next, small)

- **Settings, How I like help:**
  - **Explanations:** Short or Detailed. This sets sentence counts in the prompts and the local templates.
  - **One step at a time:** a switch. Explanations and practice show one item at a time with **Next**.
- These are structured fields on `preferences` (`explanationDetail: "short" | "detailed"`, `stepByStep: boolean`) set through `profiles.updatePreferences`, and they're exposed in `PreferencesContext`. They're enums and booleans, not free text, so they create no prompt-injection surface.
- They apply to explanations, scam-result wording, the briefing (`briefings.ts` already has a facts-only prompt, so detail only changes its length), and rehearsals.

### Phase B (evaluate after A)

- **Support language** is chosen from an allowlist of BCP-47 codes, never free text. It affects LifeLink's own explanation and guidance text only.
  - Drafts to family stay in the language of the conversation unless the person explicitly asks for another one in that draft.
  - The read-aloud voice and browser dictation must report honestly whether that language is supported. Capability reporting for the configured voice model needs checking before this is promised.
- **Communication notes** are free text, up to 280 characters, such as "Give me one step at a time" or "I don't hear well on the phone."
  - Treat them as untrusted data. Strip control characters and pass them to the model as a quoted JSON value under an instruction stating they're style preferences that can't change rules, recipients, permissions, or what is sent.
  - Notes are used only for owner-facing explanation text. They're excluded from draft generation, `family_update` text, reminders, scam-trusted-contact messages, and every family query. A pure prompt-builder function in contracts makes this testable: the test asserts the draft prompt never contains the notes.
  - Phase B applies the "private notes stay out of shared translations and shared content" rule. LifeLink has no translation feature today, so the rule is enforced at the prompt-builder boundary before any translation is ever added.

### Acceptance criteria (Phase A)

- [ ] Changing **Explanations** or **One step at a time** changes the next explanation, scam result wording, and rehearsal pacing.
- [ ] Preferences are owner-only and never appear in family queries.

---

## 7. Increment 5: Conversation recaps with proposed next steps

### Product behavior

- In a Messages thread, **Recap this conversation** summarizes the recent text messages, roughly the last 20 or 14 days, under these headings:
  - **Agreed:** only when one side offered or asked _and_ the other side clearly accepted. Both quotes are shown.
  - **Offered, not yet agreed:** "Sam offered to drive you on Tuesday. You haven't answered yet."
  - **Still unclear:** for example, the time wasn't settled.
  - **Done:** only things LifeLink's own records show as completed, such as a task in `completed` or a provider receipt. Text alone ("I booked it") is reported as "Sam says it's booked", never as done.
  - **Possible next steps:** up to three. Each becomes an ordinary proposal: a confirmation message (`send_message`), a reminder (`create_reminder`, with `shareWithCircle: false` by default), or a calendar entry (`calendar_event`, only where a calendar connection reports that capability). Each opens the existing review and approval.
- Live phone audio is out of scope.

### Technical design

- Contract `conversationRecapSchema` with `offers`, `agreements` (each with `offerQuote` and `acceptQuote`), `unclear`, and `proposedSteps`.
- `finish` validates each quote against the specific message it cites. The model must return message ids from the supplied list, and the quote must be a substring of that message's body. It also checks direction:
  - An agreement needs its offer and its acceptance to come from different sides of the conversation.
  - An agreement with a missing or unverified acceptance quote is downgraded to an offer.
- "Done" is computed server-side from `tasks` and `providerReceipts`. The model can't set it.
- Proposed steps go through `lib/proposals.ts` `applyProposal` (the same server-side resolution the assistant uses), so names, dates, and recipients are re-derived from stored data.
- **Prerequisite fix:** rewrite `replies.ts` `rulesClassify` so negation is checked first (`can't`, `cannot`, `won't`, `unable`) and hedges ("I'll check", "maybe", "let you know") classify as `unclear`. Add tests for "Sorry, I can't make it Tuesday" → declined and "I'll check and let you know" → unclear. This fix is small and could also ship on its own at any time.

### Acceptance criteria

- [ ] An offer without an explicit acceptance is never shown as agreed.
- [ ] Nothing is shown as done unless LifeLink's records show it done.
- [ ] Every proposed step opens the existing review, and nothing happens without approval of that exact version.
- [ ] Recaps are owner-only and never reach family queries or shared updates.

---

## 8. Later: live phone companion (evaluation only)

This isn't recommended for near-term work. Before it could be scoped, it would need:

- **Calling infrastructure:** a telephony provider, number provisioning, and how calls are placed or bridged. None exists in LifeLink today.
- **Consent:** two-party recording and transcription consent laws vary by place. Every party on the call would need to be told, not just the owner.
- **Real-time transcription and latency:** the existing Gemini Live integration is a browser voice session for the owner, not a call leg.
- **Honest capability reporting:** the integrations catalog would need new entries with clear "not offered" states.
- **Safety:** no real-time action-taking. Anything that comes out of a call would become a recap (increment 5) followed by the normal approval flow.

The recaps of text conversations (increment 5) deliver much of the value without this scope.

---

## 9. Open questions

1. **Quote matching strictness:** exact only (the recommended default), or also tolerate whitespace and typographic-quote differences while still displaying the original's exact slice?
2. **Rehearsal placement:** is a separate **Practice a conversation** screen acceptable? The term "Practice mode" already means the account-level simulation toggle, so the naming should keep them distinct.
3. **Email explanations:** ship in the same pull request as Messages, or after?
4. **Support language:** which languages first, and does the configured read-aloud voice support them?
5. **Cloud limits:** what per-owner daily limit for cloud explanations and recaps?

## 10. Validation for every increment

- `bun run check`, `bun run check-types`, and `bun run test` from the root.
- Read `packages/backend/AGENTS.md` and `convex/_generated/ai/guidelines.md` before backend changes, and regenerate Convex bindings with the backend's `codegen` command.
- Use the project UI skills (`impeccable`, `design-taste-frontend`) for new screens. Then verify keyboard-only use, 390px and 1280px widths, and reduced motion in Practice mode in the browser.
- No real messages, emails, or calendar changes are made during verification. Practice data only.

## 11. Implementation notes

What shipped differs from the plan above in these ways:

- **Evidence labels.** Scam signals store `evidence: "verified" | "image_unverified"`. Local rule quotes are cut from the text, so they are `verified`. A model signal whose quote isn't in the text is removed entirely, not kept without its quote. An explanation that quotes absent words is withheld.
- **Warning stance.** A model's `warns_against` is believed only when the local reading agrees at the same words. The local reading also treats conditionals ("if you don't…"), pressure ("don't forget to…"), and exceptions ("…except our agent") as requests.
- **Email rescans.** A rules update rewrites the earlier automatic check in place, so a corrected result replaces the old one in history and in family Scam alerts. Rescanning clears only the local check's own flag. Flags from cloud summaries and manual cloud checks are kept.
- **Suggested replies.** A separate model request writes the reply drafts from the message alone, so private notes and the help language can't shape words sent to someone else. If that request fails, the local suggestions remain.
- **Guided practice removed.** Increment 3 shipped and was then removed. Scripted conversation rehearsal risked feeling like skills training rather than help, and older users often reject anything that assumes they can't cope. Its package, `/practice` route, navigation item, Settings link, and lint rule are gone. The suspicious-caller and hearing-related situations remain worth revisiting with real users, for example as part of Scam check.
- **Preferences.** Phase B shipped with a narrow scope:
  - The help language applies to cloud explanations and cloud scam results. Local readings stay in English and say so, and read-aloud and voice typing are unchanged.
  - Notes are used only for message explanations. They aren't used for scam checks or recaps.
- **Recaps.**
  - Proposed steps are a confirming message or a reminder. Calendar steps aren't proposed yet.
  - Only messages that were really sent count as something the person said.
  - A step prepared from a Practice recap can't become real after Practice mode is turned off.
- **Generated API types.** `convex/_generated/api.d.ts` was updated by hand for `explanations`, `recaps`, and `lib/usage`, because this worktree has no Convex deployment. Run the backend's `codegen` command against a deployment to confirm it matches.

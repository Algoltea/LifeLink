# README iterations

Three directions for the same project. The root README implements iteration 3; iterations 1 and 2 below are alternative opening copy and section plans, not additional setup manuals. All three retain the same Practice-mode and live-provider limits.

## At a glance

| Iteration | First impression | Best fit | Tradeoff |
| --- | --- | --- | --- |
| 1. People first | A relatable need and a concrete interaction | Hackathon judges and first-time visitors | Technical setup comes later |
| 2. Trust first | An assistant that must ask before acting | Technical reviewers interested in agent safety | Less emotional introduction |
| 3. Product + developer | What it does, how to try it, what is verified | The everyday repository landing page | Less focused than a dedicated pitch |

## Iteration 1 — People first

### Proposed opening

# LifeLink

**A little help with the day. A closer connection to the people who matter.**

An appointment needs a ride. An email looks suspicious. A family message is waiting for a reply. LifeLink gives older adults one place to ask for help with those everyday moments, without giving up control of what gets sent or shared.

Ask in your own words. Read the proposed action. Approve it when it looks right.

> “Can Sam drive me to my appointment on Tuesday?”
>
> Review the message to Sam, approve that exact version, and follow the task through its reply and reminder. Explore the flow in Practice mode before connecting live services.

### Proposed section order

1. **The everyday problem** — family, appointments, and suspicious messages spread across apps.
2. **One request, start to finish** — the ride example, from asking to a clearly labeled Practice result.
3. **What else it helps with** — Today, email, scam checks, trusted circle, groceries, and Solitaire.
4. **Designed around the person** — keyboard use, readable text, scoped sharing, and exact-action review.
5. **Try the demo** — prerequisites, two setup commands, and the Practice walkthrough.
6. **Behind the scenes** — a compact stack summary and links to the developer reference.
7. **What we verified** — distinguish local Practice checks from unverified live delivery.

### Why choose it

Choose this if the README should feel like the start of a demo rather than a system manual. It leads with a recognizable situation, then explains the product through one interaction.

## Iteration 2 — Trust first

### Proposed opening

# LifeLink

**An assistant that asks before it acts.**

LifeLink helps older adults communicate with family, manage everyday tasks, and assess suspicious messages. Its central boundary is simple: a model can propose an action, but only the person can approve it, and the backend checks what is allowed before execution.

```text
Ask → Review exact details → Approve that version → Execute → Track the outcome
```

Change the message or recipient, and the old approval no longer applies. If a provider's result is unknown, the task must be reconciled before retrying. Practice mode keeps simulated outcomes visibly separate from real-world delivery.

### Proposed section order

1. **The approval boundary** — proposals, exact-version approval, and backend authority.
2. **A concrete example** — the appointment ride request, review, and task progress.
3. **Safety and sharing** — scoped family access, revocation, and uncertain-result handling.
4. **Run it locally** — prerequisites, setup commands, and the Practice-mode walkthrough.
5. **Architecture** — web, shared contracts, Convex, and provider adapters.
6. **Capabilities, not promises** — link to the matrix of implemented, unwired, and unavailable integrations.
7. **Checks and limits** — validation commands, recorded evidence, and unverified live paths.

### Why choose it

Choose this if the most important distinction is between a conversational demo and a controlled action system. It makes the approval lifecycle the project's organizing idea without implying that every integration is production-verified.

## Iteration 3 — Product + developer

### Implemented opening

# LifeLink

**Everyday help. You stay in control.**

LifeLink is an accessible assistant for older adults who want to stay connected, organize their day, and get help with suspicious messages. Ask in everyday language, review the proposed action, and approve exactly what happens next.

### Implemented section order

Why LifeLink → What you can explore → Try it locally → Demo walkthrough → How it works → Built for clarity → Development → Verification and limits.

### Why choose it

This is the default in the [root README](../README.md). It puts the purpose and a concrete example first, gets developers to the setup commands quickly, and keeps the operational detail in the [developer reference](developer-reference.md).

## Before publishing a final direction

- Add a real screenshot of the request and approval screen when an approved capture is available; do not substitute a mockup for implementation evidence.
- Add a demo-video or deployed-app link only after its destination is available and checked.
- Keep the verification section whichever opening you choose. These drafts do not establish new test or live-provider results.

# LifeLink

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Older adults who want calm, readable help with everyday communication, appointments, reminders, groceries, and suspicious messages. Trusted family members can see only information the account owner chooses to share.

## Product Purpose

LifeLink prepares useful actions and lets the person understand and approve the exact version before anything happens. The user's control is the central product promise.

## Operating Context

The existing Next.js app includes Today, Ask LifeLink, task detail, Messages, Email, Scam check, Trusted circle, Family, Groceries, Connections, Settings, onboarding, authentication, and offline Solitaire. Preserve all existing behavior during the visual replacement.

## Capabilities and Constraints

- Conversation is the main assistant workspace. Show the current action review inline and prior work in an optional right-hand History drawer. Task detail remains a valid alternate entry.
- Approval names the destination, exact content or purchase details, consequences, and version. Editing invalidates approval for the previous version. Preparing a draft is not sending it.
- Practice mode simulates outcomes. Mark sample data, accounts, messages, replies, rides, and shopping as practice. Never present a simulated event as a real completion.
- Email surfaces automatic scam signals with a reason and useful next step; the manual Scam check remains available as a backup.
- Connections retain provider-specific capabilities and setup requirements. Use understandable task-oriented groupings without concealing connection state or permission scope.
- iMessage links an existing registered contact through Spectrum Stable. LifeLink does not provision new people or charge new-user capacity. If the contact is missing, direct the person to add them in the Photon dashboard and retry. Existing users are retained. Internal API naming does not change this user-facing contract.
- Family is read-only: a family member cannot send, approve, or spend for the owner.
- Solitaire remains available offline and retains its navigation context. The offline fallback gives a clear retry path and access to the game.
- No external messages or live transactions are authorized by the design exercise.

## Brand Commitments

LifeLink uses a Victorian inventor's workshop direction based on the user's supplied SBU Hacks references: parchment, dark brown, copper, and brass; restrained typewriter, ticket, linkage, and instrument details. The interlocking-C luxury mark and green/gold treatment are rejected. Clear modern text and familiar controls remain essential.

## Evidence on Hand

Product facts above come from the explicit user brief and the existing route/component implementation. Five user-supplied reference images were inspected on 2026-10-24. They are visual inspiration, not LifeLink functionality or content. Paper uses clearly marked practice examples, not real account records. Live route verification belongs to the parent implementation/QA work and is tracked separately in docs/ui-route-audit.md.

## Product Principles

- Put the next useful decision in plain sight.
- Let the person read, edit, and approve the exact action.
- Separate preparation, approval, execution, and received replies.
- Preserve orientation across routes and device sizes.
- Treat practice as practice throughout the entire journey.

## Accessibility & Inclusion

Use readable type, generous targets, persistent text labels, explicit state wording, keyboard access, visible focus, reduced-motion support, and responsive layouts. Color never carries state by itself. Do not make an older adult decode decorative controls or ornamental language.

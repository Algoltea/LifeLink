# Presentation demo accounts

`internal.demoAccounts.create` is an operator-only action, callable from the authenticated Convex CLI or dashboard. The root setup command generates and stores credentials locally for provisioning and repeat calls:

```sh
bun run demo:create
```

The action accepts `email`, `password`, optional `displayName` (default `LifeLink Demo`), and optional `timeZone` (default `America/New_York`). It returns `email`, `profileId`, `created`, `displayName`, `timeZone`, `presentationDemo: true`, `demoMode: true`, and `passwordChanged: false`. It never returns credentials, password hashes, or session tokens.

Better Auth performs password hashing and verification using the application's existing configuration. Creating its user and credential, the owner profile, preferences, simulated connections, and sample data happens in one Convex mutation. Samples are available when the action returns; no scheduled seeding or onboarding is needed. No provider is contacted during provisioning.

A repeated call verifies the supplied password and checks the same auth identity and hash again in the final transaction. It preserves the password and profile settings. A conflicting email, including an existing auth user without a profile, is rejected rather than converted. A wrong password is rejected rather than reset. Concurrent creation or credential changes may return `account_changed`; rerun with the account's current password. No partial account commits on failure.

Only the internal provisioning path can set `profiles.presentationDemo`. Public profile APIs do not accept that field, and `profiles.setDemoMode(false)` rejects presentation profiles. This operator path can create an account even when public Practice enrollment is disabled by `DEMO_MODE_ALLOWED`.

Presentation changes only user-facing sample names and labels. Contacts remain `sample: true`; email, messages, appointments, connections, actions, and receipts keep their simulated provenance. Newly seeded grocery lists have `sample: true` as well. Real account connection and execution guards still apply, and ordinary Practice accounts retain their usual labels and ability to change modes.

Presentation accounts cannot create Telegram links or register usernames for live linking. Webhooks recheck profile ownership before binding a chat, ignore stale presentation links without sending bot notices, and exclude presentation profiles from live incoming message routing. A valid link for an ordinary account still works when unrelated presentation links mention the same chat or username.

Backend regression coverage lives in `convex/demoAccounts.test.ts`; run it with `bun run --cwd packages/backend test convex/demoAccounts.test.ts`.

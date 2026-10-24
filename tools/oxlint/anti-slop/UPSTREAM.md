# anti-slop provenance

This directory is a vendored copy of the anti-slop Oxlint plugin. The project
owns these files; local changes are allowed and must be recorded below.

| Field | Value |
| --- | --- |
| Source repository | https://github.com/dmmulroy/anti-slop |
| Source commit | `13909c9e07590f5a85d93c62712259fe14a883f7` (2026-10-13, "Merge pull request #45 from haydenbleasel/feat/group-singleline-bindings") |
| Copied from | `skills/install-anti-slop/assets/anti-slop/` at that commit |
| Installed by | `node .claude/skills/install-anti-slop/scripts/install.mjs` (fresh install; skill hash `1b9b5d3c…` in `skills-lock.json`) |
| Verification | `diff -r` of the upstream checkout's `skills/install-anti-slop` against the installed skill reported no differences on 2026-10-23 |
| License | MIT, Copyright (c) 2026 Dillon Mulroy, copied to `LICENSE` beside this file from the repository root |
| Nested vendor | `vendor/eslint-stylistic/` keeps its own `LICENSE` and `UPSTREAM.md` from ESLint Stylistic |
| Runtime dependency | `@oxlint/plugins`, pinned exactly to the installed `oxlint` version (both `1.88.0`) |

## Installed plugin paths

- Generic plugin: `tools/oxlint/anti-slop/index.ts`, registered in `oxlint.config.ts` as `anti-slop`.
- Effect plugin: `tools/oxlint/anti-slop/effect/index.ts` is present but **not** registered, because no package manifest in this repository depends on `effect` directly.

## Intentional deviations

None. The rule sources are unmodified. Configuration choices live in
`oxlint.config.ts`: every generic rule is at `"error"` with default options,
plus `oxc/no-accumulating-spread`, and three Ultracite core rules that
conflict with anti-slop are turned off there.

## Updating

Follow `.claude/skills/install-anti-slop/references/update.md`. `bun run
dev:setup` verifies this installation (files, licenses, pinned versions, and
registration) and only runs the fresh installer when the directory is missing.

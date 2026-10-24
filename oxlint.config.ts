import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

// Project-local agent tooling and the vendored plugin are not application
// source. See tools/oxlint/anti-slop/UPSTREAM.md for the plugin's provenance.
const agentAndVendorIgnores = [
  ".agent/**",
  ".agents/**",
  ".claude/**",
  ".codex/**",
  ".continue/**",
  ".cursor/**",
  ".gemini/**",
  ".impeccable/**",
  ".opencode/**",
  ".pi/**",
  ".roo/**",
  ".taste-skill/**",
  ".windsurf/**",
  "tools/oxlint/anti-slop/**",
];

export default defineConfig({
  extends: [core, react, next, vitest],
  ignorePatterns: [...core.ignorePatterns, ...agentAndVendorIgnores],
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
  ],
  // Rehearsals are fiction: their code may not reach the backend or the
  // offline queue, so a practice conversation can never book, send, or save.
  overrides: [
    {
      files: ["apps/web/src/features/rehearsals/**", "packages/rehearsals/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: [
                  "convex",
                  "convex/*",
                  "@lifelink/backend",
                  "@lifelink/backend/*",
                  "@/lib/offline-queue",
                  "@/components/app/offline-queue",
                ],
                message:
                  "Rehearsals must not reach the backend or the offline queue.",
              },
            ],
          },
        ],
      },
    },
  ],
  rules: {
    "anti-slop/no-array-filter-map": "error",
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reduce-accumulator-copy": "error",
    "anti-slop/no-reflect-apply": "error",
    "anti-slop/no-reflect-get": "error",
    "anti-slop/no-runtime-typeof": "error",
    "anti-slop/no-shape-in-symbol-names": "error",
    "anti-slop/no-unknown-parameters": "error",
    "anti-slop/no-unknown-returns": "error",
    "anti-slop/no-unknown-type-aliases": "error",
    "anti-slop/no-unsafe-dictionary-type": "error",
    "anti-slop/no-widen-then-assert": "error",
    "anti-slop/require-readable-spacing": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error",
    "oxc/no-accumulating-spread": "error",
    // Core rules that conflict with anti-slop when both are enabled (the same
    // three Ultracite's own anti-slop preset disables): the index-signature
    // autofix re-triggers no-known-value-widening, no-immediate-mutation bans
    // the fresh-accumulator pattern anti-slop recommends, and
    // prefer-reflect-apply steers toward the Reflect.apply that
    // no-reflect-apply rejects.
    "typescript/consistent-indexed-object-style": "off",
    "unicorn/no-immediate-mutation": "off",
    "unicorn/prefer-reflect-apply": "off",
  },
});

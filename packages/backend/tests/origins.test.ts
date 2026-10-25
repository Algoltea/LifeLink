import { describe, expect, it } from "vitest";

import { trustedOriginsFor } from "../convex/lib/origins";

describe("trusted origins", () => {
  it("trusts a domain with and without www", () => {
    expect(trustedOriginsFor("https://lifel.ink")).toStrictEqual([
      "https://lifel.ink",
      "https://www.lifel.ink",
    ]);
    expect(trustedOriginsFor("https://www.lifel.ink/")).toStrictEqual([
      "https://www.lifel.ink",
      "https://lifel.ink",
    ]);
  });

  it("trusts only the exact origin for local addresses", () => {
    expect(trustedOriginsFor("http://localhost:3001")).toStrictEqual([
      "http://localhost:3001",
    ]);
    expect(trustedOriginsFor("http://127.0.0.1:3001")).toStrictEqual([
      "http://127.0.0.1:3001",
    ]);
  });
});

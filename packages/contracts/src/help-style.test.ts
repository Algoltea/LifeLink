import { describe, expect, it } from "vitest";

import { helpStyleLines, helpStyleOf } from "./help-style";

describe("help style", () => {
  it("reads older preferences as short, all at once", () => {
    expect(helpStyleOf(null)).toStrictEqual({
      detail: "short",
      stepByStep: false,
    });
    expect(helpStyleOf({})).toStrictEqual({
      detail: "short",
      stepByStep: false,
    });
  });

  it("keeps the person's choices", () => {
    expect(
      helpStyleOf({ explanationDetail: "detailed", stepByStep: true })
    ).toStrictEqual({ detail: "detailed", stepByStep: true });
  });

  it("turns choices into fixed wording, never free text", () => {
    expect(helpStyleLines({ detail: "short", stepByStep: false })).toHaveLength(
      1
    );
    expect(
      helpStyleLines({ detail: "detailed", stepByStep: true }).join(" ")
    ).toContain("one step at a time");
  });
});

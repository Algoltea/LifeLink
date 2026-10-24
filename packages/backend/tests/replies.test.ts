import { describe, expect, it } from "vitest";

import { rulesClassify } from "../convex/replies";

const APPOINTMENT = "2026-10-28T10:30:00-04:00";

describe("the Practice reply reader", () => {
  it.each([
    "Sorry, I can't make it Tuesday.",
    "No, I'm working that day.",
    "I won't be able to, I'm afraid.",
    "I cannot drive that morning.",
  ])("reads a refusal as a no: %s", (reply) => {
    expect(rulesClassify(reply, APPOINTMENT).decision).toBe("declined");
  });

  it.each([
    "I'll check and let you know",
    "Maybe, I'm not sure yet.",
    "Let me see what I can do.",
  ])("reads a maybe as unclear, never a yes: %s", (reply) => {
    expect(rulesClassify(reply, APPOINTMENT).decision).toBe("unclear");
  });

  it.each([
    "Of course, Ruth! I'll pick you up at 9:45 am.",
    "No problem, see you then.",
    "Yes! I can't wait to see you.",
  ])("reads a clear yes as accepted: %s", (reply) => {
    expect(rulesClassify(reply, APPOINTMENT).decision).toBe("accepted");
  });

  it("keeps the stated time on the appointment's day", () => {
    expect(
      rulesClassify("Sure, I'll come at 9:45 am", APPOINTMENT).pickupTimeIso
    ).toBe("2026-10-28T09:45:00-04:00");
  });
});

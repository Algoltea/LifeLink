import { describe, expect, it } from "vitest";

import { emailImportance } from "./email-importance";
import type { EmailImportanceInput } from "./email-importance";
import { checkInboxOverview, localInboxInsight } from "./inbox";

const email = (
  overrides: Partial<EmailImportanceInput> = {}
): EmailImportanceInput => ({
  bodyText: "",
  fromAddress: "sam@example.com",
  fromName: "Sam",
  subject: "",
  ...overrides,
});

describe("importance from sender, subject, and current content", () => {
  it.each([
    { bodyText: "", subject: "" },
    { bodyText: "<img src='cid:123'>", subject: "(no subject)" },
    { bodyText: "[image: IMG_1234.jpg]", subject: "Re: (No subject)" },
    { bodyText: "IMG_1234.HEIC\nSent from my iPhone", subject: "" },
    { bodyText: "Here you go!", subject: "" },
    { bodyText: "A few photos from our trip.", subject: "Photos" },
    { bodyText: "Sharing this with you.", subject: "FYI" },
    { bodyText: "Thanks!\n> Please reply to confirm.", subject: "" },
    {
      bodyText: "Thanks!\nOn Monday Sam wrote:\nPlease reply to confirm.",
      subject: "",
    },
  ])("lowers context-free or casual mail: $subject / $bodyText", (input) => {
    expect(emailImportance(email(input)).category).toBe("low_priority");
  });

  it.each([
    { bodyText: "Are you okay?", category: "reply", subject: "" },
    { bodyText: "Please call me.", category: "reply", subject: "" },
    { bodyText: "Need help now!", category: "review", subject: "" },
    { bodyText: "Please reply by Friday.", category: "reply", subject: "" },
    { bodyText: "Can you call me tomorrow?", category: "reply", subject: "" },
    { bodyText: "", category: "review", subject: "Appointment reminder" },
    {
      bodyText: "<img src='invoice.png'>",
      category: "review",
      subject: "Invoice attached",
    },
    { bodyText: "Payment due tomorrow.", category: "review", subject: "" },
    {
      bodyText: "Our meeting is tomorrow at 10:30.",
      category: "review",
      subject: "",
    },
    {
      bodyText: '<img alt="Appointment reminder" src="cid:123">',
      category: "review",
      subject: "",
    },
    {
      bodyText: "",
      category: "review",
      fromAddress: "appointments@clinic.example",
      subject: "",
    },
    {
      bodyText: "",
      category: "review",
      fromAddress: "photos@hospital.example",
      subject: "",
    },
    { bodyText: "", category: "review", fromName: "Clinic", subject: "" },
  ])(
    "retains actionable or service-related mail: $subject / $bodyText",
    ({ category, ...input }) => {
      expect(emailImportance(email(input)).category).toBe(category);
    }
  );

  it("does not mistake promotional questions, boilerplate, or automated sends for a personal reply request", () => {
    expect(
      emailImportance(
        email({
          bodyText:
            "Can you save more? Sale this week. Manage your account or unsubscribe.",
          subject: "Newsletter",
        })
      ).category
    ).toBe("low_priority");
    expect(
      emailImportance(
        email({
          bodyText: "Please reply to confirm.",
          fromAddress: "no-reply@example.com",
          subject: "Status update",
        })
      ).category
    ).toBe("review");
    expect(
      emailImportance(
        email({
          bodyText: "Thanks for these!\n> Your payment is overdue.",
          subject: "Photos",
        })
      ).category
    ).toBe("low_priority");
  });

  it("uses an exact saved sender match as context without treating it as authentication", () => {
    const input = email({
      bodyText:
        "We wanted to share what has been happening at home recently. There are lots of little updates and stories to tell when we next see each other.",
      senderKnown: true,
      subject: "News from home",
    });

    expect(emailImportance(input).reason).toMatch(/Trusted circle/u);
    expect(emailImportance(input).reason).toMatch(/does not verify/u);
    expect(emailImportance(email({ senderKnown: true })).category).toBe(
      "low_priority"
    );
  });

  it("preserves safety gates and prevents AI from relabeling a short casual email", () => {
    const message = {
      ...email({ bodyText: "Here you go" }),
      checked: true,
      id: "one",
      summary: null,
      suspicious: false,
    };

    const local = localInboxInsight(message);

    const result = checkInboxOverview([message], {
      items: [
        {
          category: "review",
          id: "one",
          quote: "Here you go",
          reason: "Take a look.",
          summary: "A short message.",
        },
      ],
      summary: "One email.",
    });

    expect(local.category).toBe("low_priority");
    expect(result).toStrictEqual([local]);
    expect(localInboxInsight({ ...message, suspicious: true }).category).toBe(
      "check_first"
    );
    expect(localInboxInsight({ ...message, checked: false }).category).toBe(
      "review"
    );
  });
});

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
    {
      bodyText: "Would you join us for dinner? Let me know.",
      category: "reply",
      subject: "This weekend",
    },
    {
      bodyText: "RSVP for the neighborhood gathering.",
      category: "reply",
      subject: "Invitation",
    },
    {
      bodyText: "Your flight is tomorrow at 8:00.",
      category: "review",
      subject: "Travel details",
    },
    {
      bodyText: "Your account payment failed. Update it before Friday.",
      category: "review",
      subject: "Account update",
    },
    {
      bodyText: "Here are the pictures.",
      category: "low_priority",
      subject: "Photos",
    },
    {
      bodyText: "[image: photo.jpeg]",
      category: "low_priority",
      subject: "(no subject)",
    },
    {
      bodyText: "Our seasonal sale is here. Unsubscribe anytime.",
      category: "low_priority",
      subject: "This week's savings",
    },
    {
      bodyText: "Please complete the attached form by Friday.",
      category: "review",
      subject: "Documents",
    },
  ])(
    "uses intent rather than personal sender identity: $subject",
    ({ category, ...content }) => {
      const identities = [
        { fromAddress: "mina@cedar.example", fromName: "Mina" },
        { fromAddress: "jules@harbor.example", fromName: "Jules" },
        { fromAddress: "alex@birch.example", fromName: null },
        { fromAddress: "ren@maple.example", fromName: "Ren" },
      ];

      for (const identity of identities) {
        expect(
          emailImportance(email({ ...content, ...identity })).category
        ).toBe(category);
      }
    }
  );

  it.each([
    {
      bodyText: "Your prescription is ready.",
      category: "review",
      fromAddress: "no-reply@cedar.example",
      fromName: "Updates",
      subject: "Status",
    },
    {
      bodyText: "Can you save more? Unsubscribe from our sale notices.",
      category: "low_priority",
      fromAddress: "offers@birch.example",
      fromName: "Offers",
      subject: "Deals",
    },
    {
      bodyText: "Please reply to confirm.",
      category: "review",
      fromAddress: "notifications@maple.example",
      fromName: "Updates",
      subject: "Status",
    },
    {
      bodyText: "Your payment is overdue. Unsubscribe from optional updates.",
      category: "review",
      fromAddress: "marketing@harbor.example",
      fromName: "Newsletter",
      subject: "Billing notice",
    },
  ])(
    "keeps sender role and concrete content separate: $fromAddress",
    ({ category, ...input }) => {
      expect(emailImportance(email(input)).category).toBe(category);
    }
  );

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

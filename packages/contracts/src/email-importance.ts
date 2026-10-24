/** Conservative, deterministic importance rules. Sender wording is a hint, never authentication. */
interface EmailImportanceInput {
  bodyText: string;
  fromAddress: string;
  fromName: string | null;
  senderKnown?: boolean;
  subject: string;
}

interface EmailImportance {
  category: "reply" | "review" | "low_priority";
  quote: string | null;
  reason: string;
}

const SUBJECT_PREFIX = /^(?:(?:re|fw|fwd):\s*)+/iu;
const EMPTY_SUBJECT = /^(?:\(?no subject\)?|\[no subject\]|untitled)$/iu;
const IMAGE_ALT = /<img\b[^>]*\balt=["'](?<alt>[^"']*)["'][^>]*>/giu;
const HTML_TAG = /<[^>]+>/gu;

const IMAGE_PLACEHOLDER =
  /\[(?:image|photo|picture|attachment)(?::[^\]]*)?\]|\bcid:[^\s<>]+/giu;

const IMAGE_FILENAME =
  /\b[\w.-]+\.(?:jpe?g|png|gif|webp|heic|heif|bmp|tiff?)\b/giu;

const MOBILE_SIGNATURE =
  /(?:^|\n)sent from (?:my (?:iphone|ipad|android|galaxy)|outlook for (?:ios|android))\b[^\n]*/giu;

const QUOTED_LINE = /^\s*>.*$/gmu;

const REPLY_HISTORY =
  /(?:^|\n)(?:on [^\n]{1,200} wrote:|-{2,}\s*(?:original|forwarded) message\s*-{2,})/imu;

const SPACE = /\s+/gu;

const AUTOMATED_ADDRESS =
  /^(?:no[._-]?reply|do[._-]?not[._-]?reply|mailer[._-]?daemon|notifications?)(?:[+._-]|$)/iu;

const CAMPAIGN_SOURCE =
  /\b(?:newsletter|marketing|promotions?|offers|deals|digest)\b/iu;

const SERVICE_SOURCE =
  /\b(?:billing|appointments?|clinic|hospital|medical|doctor|pharmacy|insurance|bank|security|fraud|claims)\b/iu;

const PROMOTION =
  /\b(?:unsubscribe|newsletter|sale|discount|promotion|special offer|percent off|\d+% off)\b/iu;

const NO_REPLY =
  /\b(?:do not reply|don.t reply|no reply (?:is )?(?:needed|required))\b/iu;

const EXPLICIT_REPLY =
  /\b(?:please (?:reply|respond)|let me know|rsvp|your (?:reply|response) is (?:needed|required))\b/iu;

const CONVERSATIONAL_REQUEST =
  /\b(?:(?:can|could|would|will) you|please confirm|(?:please )?(?:call|text|email) me)\b|\b(?:are you|did you|do you|have you|what (?:time|day)|when (?:can|will|are|do)|how are you)\b[^?]{0,180}\?/iu;

const IMPORTANT_SUBJECT =
  /\b(?:appointment|invoice|bill|payment|bank|statement|receipt|delivery|order|renewal|cancellation|deadline|security|verification|password|medical|prescription|test results|insurance|legal|tax|interview|exam|flight|reservation)\b/iu;

const IMPORTANT_CONTENT =
  /\b(?:appointment|invoice|prescription|medical|doctor|test results|court|tax return|interview|exam|flight|reservation|emergency|need help|help me|verification code|password reset)\b|\b(?:payment|bill|balance|account|delivery|order|renewal|subscription)\b.{0,50}\b(?:due|required|failed|overdue|scheduled|changed|cancelled|canceled|shipped|charged|suspended|issue|problem)\b|\b(?:verify|reset|secure)\b.{0,30}\b(?:password|account|identity)\b|\b(?:reply|respond|confirm|submit|pay|complete|renew)\b.{0,25}\bby\b|\b(?:review|read|sign|complete)\b.{0,40}\b(?:attached|attachment|form|document)\b|\bdeadline\b|\b(?:meeting|pickup|pick-up|ready|class)\b.{0,40}\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}:\d{2})\b/iu;

const CASUAL_SUBJECT =
  /^(?:(?:some|a few|more|our|my|your|the|trip|holiday|vacation|family)\s+)*(?:photos?|pictures?|images?|snapshots?|fyi|just sharing|hello|hi|thanks|thank you)[.!\s]*$/iu;

const meaningfulSubject = (value: string): string => {
  const subject = value.trim().replace(SUBJECT_PREFIX, "").trim();

  return EMPTY_SUBJECT.test(subject) ? "" : subject;
};

/** Ignore image filenames, mobile signatures and quoted history when looking for a new request. */
const readableContent = (value: string): string => {
  const history = REPLY_HISTORY.exec(value);
  const current = history ? value.slice(0, history.index) : value;

  return current
    .replaceAll(QUOTED_LINE, "")
    .replaceAll(MOBILE_SIGNATURE, "")
    .replaceAll(IMAGE_ALT, "$<alt>")
    .replaceAll(HTML_TAG, " ")
    .replaceAll(IMAGE_PLACEHOLDER, " ")
    .replaceAll(IMAGE_FILENAME, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll(SPACE, " ")
    .trim();
};

const lowerPriority = (reason: string): EmailImportance => ({
  category: "low_priority",
  quote: null,
  reason,
});

const review = (
  reason: string,
  quote: string | null = null
): EmailImportance => ({ category: "review", quote, reason });

const replyPhrase = (
  text: string,
  automated: boolean,
  promotional: boolean,
  senderKnown: boolean
): string | null => {
  if (automated || (promotional && !senderKnown)) {
    return null;
  }

  const explicit = EXPLICIT_REPLY.exec(text);
  const conversational = promotional ? null : CONVERSATIONAL_REQUEST.exec(text);

  return (explicit ?? conversational)?.[0] ?? null;
};

const emailImportance = (message: EmailImportanceInput): EmailImportance => {
  const subject = meaningfulSubject(message.subject);
  const body = readableContent(message.bodyText);
  const text = `${subject}\n${body}`;
  const address = message.fromAddress.trim().toLowerCase();
  const localPart = address.split("@")[0] ?? "";
  const senderHint = `${address.replaceAll(/[@+._-]/gu, " ")} ${message.fromName ?? ""}`;
  const automated = AUTOMATED_ADDRESS.test(localPart) || NO_REPLY.test(body);
  const promotional = PROMOTION.test(text) || CAMPAIGN_SOURCE.test(senderHint);

  const reply = replyPhrase(
    text,
    automated,
    promotional,
    message.senderKnown === true
  );

  if (reply !== null) {
    return {
      category: "reply",
      quote: reply,
      reason:
        "The current subject or message asks for a reply or confirmation. Check the details before responding.",
    };
  }

  const importantSubject = IMPORTANT_SUBJECT.exec(subject);

  if (importantSubject) {
    return review(
      "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.",
      importantSubject[0]
    );
  }

  const importantContent = IMPORTANT_CONTENT.exec(body);

  if (importantContent) {
    return review(
      "The message contains a concrete event, account action, or timing detail worth reviewing.",
      importantContent[0]
    );
  }

  if (SERVICE_SOURCE.test(senderHint)) {
    return review(
      "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified."
    );
  }

  if (subject.length === 0 && body.length === 0) {
    return lowerPriority(
      "No subject or readable message text, and no action request found. Any images or attachments have not been assessed."
    );
  }

  const shortNote = body.length <= 160 && body.split(SPACE).length <= 24;

  if (shortNote && (subject.length === 0 || CASUAL_SUBJECT.test(subject))) {
    return lowerPriority(
      "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found."
    );
  }

  if (promotional) {
    return lowerPriority(
      "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested."
    );
  }

  if (message.senderKnown === true) {
    return review(
      "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it."
    );
  }

  return review(
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you."
  );
};

export { emailImportance, meaningfulSubject, readableContent };

export type { EmailImportanceInput };

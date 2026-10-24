/**
 * Checks for words LifeLink suggests the person might send. A suggestion is
 * only a starting point that the person edits and approves, but it should
 * never put a link, a code, private details, or an unusual payment in their
 * mouth.
 */

const MAX_DRAFT_LENGTH = 600;

const LINK =
  /\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|net|org|info|io|co|biz|xyz|link|click)\b/iu;

const CODE_LIKE = /\b\d{4,8}\b/gu;

// Four-digit years are dates, not codes.
const YEAR = /^(?:19|20)\d{2}$/u;

// Replies follow the message's language, so the common words are checked in each support language.
const PAYMENT =
  /\b(?:gift cards?|wire (?:transfer|money)|bitcoin|crypto|zelle|venmo|cash app|western union|tarjetas? de regalo|cartes? cadeaux?|geschenkkarten?|gutscheinkarten?|buoni? regalo|cart(?:ão|ões) (?:de )?presente|thẻ quà tặng)\b|礼品卡|禮品卡|기프트\s?카드|상품권/iu;

const PRIVATE_DETAILS =
  /\b(?:password|pin|verification code|one[- ]time code|account number|social security|ssn|medicare number|bank details|contraseña|código de verificación|mot de passe|code de vérification|passwort|bestätigungscode|kennwort|codice di verifica|senha|código de verificação|mật khẩu|mã xác minh)\b|密码|密碼|验证码|비밀번호|인증번호/iu;

type DraftProblem =
  | "code"
  | "empty"
  | "link"
  | "payment"
  | "private_details"
  | "too_long";

/** Why a suggested draft is not safe to offer, or null when it is. */
const draftProblem = (draft: string, source: string): DraftProblem | null => {
  const text = draft.trim();

  if (text.length === 0) {
    return "empty";
  }

  if (text.length > MAX_DRAFT_LENGTH) {
    return "too_long";
  }

  if (LINK.test(text)) {
    return "link";
  }

  // A number copied from the message (a house number, a time) is fine; a new code-like number is not.
  const newNumbers = [...text.matchAll(CODE_LIKE)].filter(
    (match) => !YEAR.test(match[0]) && !source.includes(match[0])
  );

  if (newNumbers.length > 0) {
    return "code";
  }

  if (PAYMENT.test(text)) {
    return "payment";
  }

  if (PRIVATE_DETAILS.test(text)) {
    return "private_details";
  }

  return null;
};

export { MAX_DRAFT_LENGTH, draftProblem };

export type { DraftProblem };

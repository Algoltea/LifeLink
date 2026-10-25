import type { InterfaceLocale } from "@lifelink/contracts/locale";

interface WarningDraft {
  body: string;
  subject: string;
}

interface WarningMessages {
  body: string;
  originalSubjectLabel: string;
  redacted: string;
  subjectPrefix: string;
  untitled: string;
}

const WARNINGS: Record<InterfaceLocale, WarningMessages> = {
  de: {
    body: "LifeLink-Sicherheitshinweis: Diese E-Mail scheint ein Betrugsversuch zu sein.\n\nBitte kontaktieren Sie jemanden aus Ihrem Vertrauenskreis, bevor Sie etwas unternehmen.\n\nAntworten Sie nicht dem Absender, klicken Sie nicht auf Links und geben Sie weder Geld noch persönliche Daten weiter.\n\nDies ist eine automatische Warnung, die als Entwurf für Sie gespeichert wurde. Es wurde nichts gesendet. Automatische Prüfungen können sich irren.",
    originalSubjectLabel: "Betreff der ursprünglichen E-Mail",
    redacted: "[Inhalt entfernt]",
    subjectPrefix: "LifeLink-Sicherheitswarnung",
    untitled: "Ohne Betreff",
  },
  en: {
    body: "LifeLink safety notice: This email appears to be a scam.\n\nPlease contact someone in your Trusted circle before taking any action.\n\nDo not reply to the sender, click links, or share money or personal details.\n\nThis is an automatic warning saved as a draft for you. Nothing has been sent. Automated checks can be mistaken.",
    originalSubjectLabel: "Original email subject",
    redacted: "[content removed]",
    subjectPrefix: "LifeLink safety warning",
    untitled: "No subject",
  },
  es: {
    body: "Aviso de seguridad de LifeLink: Este correo parece ser una estafa.\n\nPor favor, contacte con alguien de su Círculo de confianza antes de hacer nada.\n\nNo responda al remitente, no haga clic en enlaces ni envíe dinero o comparta datos personales.\n\nEsta es una advertencia automática guardada como borrador para usted. No se ha enviado nada. Las comprobaciones automáticas pueden equivocarse.",
    originalSubjectLabel: "Asunto del correo original",
    redacted: "[contenido eliminado]",
    subjectPrefix: "Advertencia de seguridad de LifeLink",
    untitled: "Sin asunto",
  },
  fr: {
    body: "Avis de sécurité LifeLink : Cet e-mail semble être une arnaque.\n\nVeuillez contacter une personne de votre Cercle de confiance avant toute action.\n\nNe répondez pas à l'expéditeur, ne cliquez sur aucun lien et ne transmettez ni argent ni renseignements personnels.\n\nCeci est un avertissement automatique enregistré dans vos brouillons. Rien n'a été envoyé. Les vérifications automatiques peuvent se tromper.",
    originalSubjectLabel: "Objet de l'e-mail d'origine",
    redacted: "[contenu supprimé]",
    subjectPrefix: "Avertissement de sécurité LifeLink",
    untitled: "Sans objet",
  },
  it: {
    body: "Avviso di sicurezza di LifeLink: Questa email sembra essere una truffa.\n\nContatta qualcuno della tua Cerchia di fiducia prima di fare qualsiasi cosa.\n\nNon rispondere al mittente, non fare clic sui link e non inviare denaro né condividere dati personali.\n\nQuesto è un avviso automatico salvato come bozza per te. Non è stato inviato nulla. I controlli automatici possono sbagliare.",
    originalSubjectLabel: "Oggetto dell'email originale",
    redacted: "[contenuto rimosso]",
    subjectPrefix: "Avviso di sicurezza di LifeLink",
    untitled: "Senza oggetto",
  },
  ko: {
    body: "LifeLink 안전 안내: 이 이메일은 사기로 의심됩니다.\n\n어떤 행동을 하기 전에 ‘믿을 수 있는 사람들’에 있는 분에게 연락해 주세요.\n\n보낸 사람에게 답장하거나 링크를 누르지 마세요. 돈을 보내거나 개인 정보를 공유하지 마세요.\n\n이것은 임시보관함에 저장된 자동 경고입니다. 아무것도 전송되지 않았습니다. 자동 검사는 틀릴 수 있습니다.",
    originalSubjectLabel: "원본 이메일 제목",
    redacted: "[내용 삭제됨]",
    subjectPrefix: "LifeLink 안전 경고",
    untitled: "제목 없음",
  },
  pt: {
    body: "Aviso de segurança do LifeLink: Este e-mail parece ser um golpe.\n\nEntre em contato com alguém do seu Círculo de confiança antes de tomar qualquer atitude.\n\nNão responda ao remetente, não clique em links nem envie dinheiro ou compartilhe dados pessoais.\n\nEste é um aviso automático salvo como rascunho para você. Nada foi enviado. As verificações automáticas podem estar erradas.",
    originalSubjectLabel: "Assunto do e-mail original",
    redacted: "[conteúdo removido]",
    subjectPrefix: "Alerta de segurança do LifeLink",
    untitled: "Sem assunto",
  },
  tl: {
    body: "Paunawa sa kaligtasan mula sa LifeLink: Mukhang panloloko ang email na ito.\n\nMangyaring makipag-ugnayan sa isa sa iyong Mga pinagkakatiwalaan bago gumawa ng anuman.\n\nHuwag sumagot sa nagpadala, mag-click ng mga link, magpadala ng pera, o magbahagi ng personal na impormasyon.\n\nIsa itong awtomatikong babala na na-save bilang draft para sa iyo. Walang naipadala. Maaaring magkamali ang mga awtomatikong pagsusuri.",
    originalSubjectLabel: "Paksa ng orihinal na email",
    redacted: "[inalis ang nilalaman]",
    subjectPrefix: "Babala sa kaligtasan mula sa LifeLink",
    untitled: "Walang paksa",
  },
  vi: {
    body: "Thông báo an toàn từ LifeLink: Email này có dấu hiệu lừa đảo.\n\nVui lòng liên hệ với một người trong Nhóm tin cậy trước khi thực hiện bất kỳ hành động nào.\n\nKhông trả lời người gửi, nhấp vào liên kết, gửi tiền hoặc chia sẻ thông tin cá nhân.\n\nĐây là cảnh báo tự động được lưu dưới dạng bản nháp cho bạn. Chưa có gì được gửi đi. Các bước kiểm tra tự động có thể nhầm lẫn.",
    originalSubjectLabel: "Tiêu đề email gốc",
    redacted: "[đã xóa nội dung]",
    subjectPrefix: "Cảnh báo an toàn từ LifeLink",
    untitled: "Không có tiêu đề",
  },
  zh: {
    body: "LifeLink 安全提醒：这封邮件疑似诈骗。\n\n在采取任何行动之前，请联系您信任圈中的一位成员。\n\n请勿回复发件人、点击链接、汇款或透露个人信息。\n\n这是一条自动生成并为您保存为草稿的警告。没有发送任何内容。自动检查可能出错。",
    originalSubjectLabel: "原邮件主题",
    redacted: "[内容已移除]",
    subjectPrefix: "LifeLink 安全警告",
    untitled: "无主题",
  },
};

const MAX_SUBJECT_CHARACTERS = 120;
const CONTROL_CHARACTERS = /[\p{Cc}\p{Zl}\p{Zp}]/gu;
const FORMAT_CHARACTERS = /\p{Cf}/gu;
const HTML_MARKUP = /<[^>]*(?:>|$)/gu;
const SUBJECT_TOKEN = /\S+/gu;

const UNSAFE_SUBJECT_TOKEN =
  /(?::\S|\/\/|[@\\<>&]|[\p{L}\p{M}\p{N}-][.。｡][\p{L}\p{M}\p{N}-])/u;

const WHITESPACE = /\s+/gu;

/**
 * Drafts are plain text, but mail clients can automatically link subjects.
 * Normalize compatibility characters, remove hidden formatting, and redact
 * markup and whole tokens containing URI-like punctuation, domains, or addresses.
 * This deliberately also removes times and dotted identifiers rather than
 * copying a possible link. Never decode entities or percent escapes.
 * Truncate only after redaction, by Unicode code point, to preserve surrogate
 * pairs and avoid leaving the beginning of a suspicious URL in the draft.
 */
const safeOriginalSubject = (
  originalSubject: string,
  messages: WarningMessages
): string => {
  const sanitized = originalSubject
    .normalize("NFKC")
    .replace(FORMAT_CHARACTERS, "")
    .replace(CONTROL_CHARACTERS, " ")
    .replace(HTML_MARKUP, ` ${messages.redacted} `)
    .replace(SUBJECT_TOKEN, (token) =>
      UNSAFE_SUBJECT_TOKEN.test(token) ? messages.redacted : token
    )
    .replace(WHITESPACE, " ")
    .trim();

  const characters = [...sanitized];

  if (characters.length > MAX_SUBJECT_CHARACTERS) {
    return `${characters
      .slice(0, MAX_SUBJECT_CHARACTERS - 1)
      .join("")
      .trimEnd()}…`;
  }

  return sanitized || messages.untitled;
};

/** Fixed warning copy accepts only the original subject, never other email content. */
const scamWarningMessage = (
  locale: InterfaceLocale,
  originalSubject: string
): WarningDraft => {
  const messages = WARNINGS[locale];
  const safeSubject = safeOriginalSubject(originalSubject, messages);

  return {
    body: `${messages.body}\n\n${messages.originalSubjectLabel}: “${safeSubject}”`,
    subject: `${messages.subjectPrefix}: “${safeSubject}”`,
  };
};

export { scamWarningMessage };

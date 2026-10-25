import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { PhotonConversation } from "../integrations/photon";
import { readEnv } from "./env";

type ReaderCtx = MutationCtx | QueryCtx;

interface PhotonRoute {
  peerUserId: string;
  projectId: string;
  senderId: string;
  spaceId: string;
}

const photonRouteValidator = v.object({
  peerUserId: v.string(),
  projectId: v.string(),
  senderId: v.string(),
  spaceId: v.string(),
});

const photonReconciliationValidator = v.object({
  actionId: v.id("actions"),
  attemptId: v.id("executionAttempts"),
  token: v.string(),
});

const conversationValidator = v.object({
  agentHandle: v.string(),
  handle: v.string(),
  messageId: v.string(),
  peerUserId: v.string(),
  projectId: v.string(),
  receivedAt: v.number(),
  senderId: v.string(),
  spaceId: v.string(),
});

const contactImessageHandle = (contact: Doc<"contacts">): string | null =>
  contact.channels
    .find((channel) => channel.channel === "imessage")
    ?.address.trim() ?? null;

const currentEnrollmentContact = async (
  ctx: ReaderCtx,
  enrollment: Doc<"imessageEnrollments">
): Promise<Doc<"contacts"> | null> => {
  const contact = await ctx.db.get(enrollment.contactId);
  const owner = await ctx.db.get(enrollment.ownerId);

  if (
    enrollment.protocol !== "spectrum" ||
    contact === null ||
    contact.ownerId !== enrollment.ownerId ||
    contact.sample ||
    contactImessageHandle(contact) !== enrollment.handle ||
    owner === null ||
    owner.role !== "owner" ||
    owner.demoMode ||
    enrollment.projectId !== readEnv("SPECTRUM_PROJECT_ID")
  ) {
    return null;
  }

  return contact;
};

const readyImessageRoute = async (
  ctx: ReaderCtx,
  ownerId: Id<"profiles">,
  contactId: string,
  address: string
): Promise<PhotonRoute | null> => {
  const projectId = readEnv("SPECTRUM_PROJECT_ID");

  if (projectId === null) {
    return null;
  }

  const enrollment = await ctx.db
    .query("imessageEnrollments")
    .withIndex("by_project_handle", (index) =>
      index.eq("projectId", projectId).eq("handle", address.trim())
    )
    .unique();

  if (
    enrollment === null ||
    enrollment.ownerId !== ownerId ||
    enrollment.contactId !== contactId ||
    enrollment.status !== "ready" ||
    enrollment.agentUserId !== "shared" ||
    enrollment.peerUserId !== enrollment.handle ||
    enrollment.spaceId === null ||
    (await currentEnrollmentContact(ctx, enrollment)) === null
  ) {
    return null;
  }

  return {
    peerUserId: enrollment.peerUserId,
    projectId,
    senderId: enrollment.agentUserId,
    spaceId: enrollment.spaceId,
  };
};

/** Bind a provider-verified direct conversation to one explicitly enrolled contact. */
const acceptImessageConversation = async (
  ctx: MutationCtx,
  conversation: PhotonConversation
): Promise<Doc<"imessageEnrollments"> | null> => {
  const enrollment = await ctx.db
    .query("imessageEnrollments")
    .withIndex("by_project_handle", (index) =>
      index
        .eq("projectId", conversation.projectId)
        .eq("handle", conversation.handle)
    )
    .unique();

  if (
    enrollment === null ||
    enrollment.assignmentId === null ||
    conversation.agentHandle !== "shared" ||
    conversation.senderId !== "shared" ||
    conversation.peerUserId !== enrollment.handle ||
    enrollment.assignmentCreatedAt === null ||
    conversation.receivedAt < enrollment.assignmentCreatedAt ||
    !Number.isFinite(conversation.receivedAt) ||
    conversation.senderId === conversation.peerUserId ||
    (enrollment.status !== "waiting" && enrollment.status !== "ready") ||
    (await currentEnrollmentContact(ctx, enrollment)) === null
  ) {
    return null;
  }

  // Older deliveries must not replace a more recently verified route.
  if (
    enrollment.lastIncomingAt === null ||
    conversation.receivedAt >= enrollment.lastIncomingAt
  ) {
    await ctx.db.patch(enrollment._id, {
      agentUserId: conversation.senderId,
      error: null,
      lastIncomingAt: conversation.receivedAt,
      lastIncomingId: conversation.messageId,
      peerUserId: conversation.peerUserId,
      spaceId: conversation.spaceId,
      status: "ready",
      updatedAt: Date.now(),
    });
  }

  return enrollment;
};

const INTRODUCTIONS: Record<InterfaceLocale, (ownerName: string) => string[]> =
  {
    de: (ownerName) => [
      `LifeLink: Dieses Gespräch ist mit dem LifeLink-Konto von ${ownerName} verbunden. Nachrichten von dieser Nummer werden im Namen von ${ownerName} gesendet. Ihre Antworten gehen direkt an ${ownerName}. Speichern Sie diese Nummer als „LifeLink“, damit Sie künftige Nachrichten erkennen.`,
      "",
      `Nachricht von ${ownerName}:`,
    ],
    en: (ownerName) => [
      `LifeLink: This conversation is connected to ${ownerName}'s LifeLink account. Messages from this number are sent on ${ownerName}'s behalf, and your replies go directly to ${ownerName}. Save this number as "LifeLink" to recognize future messages.`,
      "",
      `Message from ${ownerName}:`,
    ],
    es: (ownerName) => [
      `LifeLink: Esta conversación está conectada a la cuenta de LifeLink de ${ownerName}. Los mensajes de este número se envían en nombre de ${ownerName}, y sus respuestas le llegan directamente a ${ownerName}. Guarde este número como "LifeLink" para reconocer los próximos mensajes.`,
      "",
      `Mensaje de ${ownerName}:`,
    ],
    fr: (ownerName) => [
      `LifeLink : Cette conversation est liée au compte LifeLink de ${ownerName}. Les messages de ce numéro sont envoyés au nom de ${ownerName}, et vos réponses lui parviennent directement. Enregistrez ce numéro sous « LifeLink » pour reconnaître les prochains messages.`,
      "",
      `Message de ${ownerName} :`,
    ],
    it: (ownerName) => [
      `LifeLink: Questa conversazione è collegata all'account LifeLink di ${ownerName}. I messaggi da questo numero sono inviati per conto di ${ownerName} e le sue risposte arrivano direttamente a ${ownerName}. Salvi questo numero come «LifeLink» per riconoscere i prossimi messaggi.`,
      "",
      `Messaggio da ${ownerName}:`,
    ],
    ko: (ownerName) => [
      `LifeLink: 이 대화는 ${ownerName} 님의 LifeLink 계정에 연결되어 있습니다. 이 번호의 메시지는 ${ownerName} 님을 대신해 보내며, 답장은 ${ownerName} 님께 직접 전달됩니다. 앞으로 오는 메시지를 알아보실 수 있도록 이 번호를 “LifeLink”로 저장해 주세요.`,
      "",
      `${ownerName} 님의 메시지:`,
    ],
    pt: (ownerName) => [
      `LifeLink: Esta conversa está conectada à conta LifeLink de ${ownerName}. As mensagens deste número são enviadas em nome de ${ownerName}, e suas respostas chegam diretamente a ${ownerName}. Salve este número como “LifeLink” para reconhecer as próximas mensagens.`,
      "",
      `Mensagem de ${ownerName}:`,
    ],
    tl: (ownerName) => [
      `LifeLink: Nakakonekta ang pag-uusap na ito sa LifeLink account ni ${ownerName}. Ipinapadala ang mga mensahe mula sa numerong ito sa ngalan ni ${ownerName}, at direktang napupunta kay ${ownerName} ang inyong mga sagot. I-save ang numerong ito bilang “LifeLink” para makilala ang mga susunod na mensahe.`,
      "",
      `Mensahe mula kay ${ownerName}:`,
    ],
    vi: (ownerName) => [
      `LifeLink: Cuộc trò chuyện này được kết nối với tài khoản LifeLink của ${ownerName}. Tin nhắn từ số này được gửi thay mặt ${ownerName}, và câu trả lời của bạn sẽ được gửi thẳng đến ${ownerName}. Hãy lưu số này với tên “LifeLink” để nhận ra các tin nhắn sau này.`,
      "",
      `Tin nhắn từ ${ownerName}:`,
    ],
    zh: (ownerName) => [
      `LifeLink：此对话已连接到${ownerName}的LifeLink账户。此号码的消息代表${ownerName}发送，您的回复会直接送达${ownerName}。请将此号码保存为“LifeLink”，以便识别以后的消息。`,
      "",
      `来自${ownerName}的消息：`,
    ],
  };

/**
 * Sent once, above the first message in a new iMessage conversation, so the
 * recipient knows who this number is (and iOS can suggest saving it). Only the
 * recipient sees it: LifeLink's own thread and review show the message alone.
 * Written in the recipient's language; the approved message is never translated.
 */
const imessageIntroduction = (
  ownerName: string,
  locale: InterfaceLocale = "en"
): string => INTRODUCTIONS[locale](ownerName).join("\n");

/** What actually goes out: the introduction, when there is one, then the approved words unchanged. */
const withIntroduction = (introduction: string | null, body: string): string =>
  introduction === null ? body : `${introduction}\n${body}`;

/** The ready conversation behind this send, while it still needs its introduction. */
const enrollmentNeedingIntroduction = async (
  ctx: ReaderCtx,
  ownerId: Id<"profiles">,
  contactId: string,
  address: string
): Promise<Doc<"imessageEnrollments"> | null> => {
  const projectId = readEnv("SPECTRUM_PROJECT_ID");

  if (projectId === null) {
    return null;
  }

  const enrollment = await ctx.db
    .query("imessageEnrollments")
    .withIndex("by_project_handle", (index) =>
      index.eq("projectId", projectId).eq("handle", address.trim())
    )
    .unique();

  const needsIntroduction =
    enrollment !== null &&
    enrollment.ownerId === ownerId &&
    enrollment.contactId === contactId &&
    !enrollment.introducedAt;

  return needsIntroduction ? enrollment : null;
};

/** Once a send that carried the introduction is confirmed, later messages go without it. */
const markIntroduced = async (
  ctx: MutationCtx,
  attempt: Doc<"executionAttempts">
): Promise<void> => {
  const enrollmentId = attempt.imessageIntroduction?.enrollmentId;

  const enrollment =
    enrollmentId === undefined ? null : await ctx.db.get(enrollmentId);

  if (enrollment !== null && !enrollment.introducedAt) {
    await ctx.db.patch(enrollment._id, { introducedAt: Date.now() });
  }
};

export {
  acceptImessageConversation,
  contactImessageHandle,
  conversationValidator,
  currentEnrollmentContact,
  enrollmentNeedingIntroduction,
  imessageIntroduction,
  markIntroduced,
  photonReconciliationValidator,
  photonRouteValidator,
  readyImessageRoute,
  withIntroduction,
};

export type { PhotonRoute };

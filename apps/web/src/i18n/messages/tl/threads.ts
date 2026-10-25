import type { Messages } from "../en";

const threads: Messages["threads"] = {
  addPerson: "Magdagdag ng tao",
  addPhoto: "Magdagdag ng larawan",
  addWayToReach: (firstName) =>
    `Magdagdag ng paraan para makaugnayan si ${firstName} sa Mga pinagkakatiwalaan.`,
  addingPhoto: "Idinaragdag ang larawan…",
  backTo: "Bumalik sa ",
  channels: {
    discord: "Direktang mensahe sa Discord",
    email: "Email",
    imessage: "iMessage",
    in_app: "Mensahe sa LifeLink",
    telegram: "Telegram",
  },
  chooseConversation: "Pumili ng tao para basahin ang usapan at sumagot.",
  conversationWith: (name) => `Usapan kay ${name}`,
  conversationWithPrefix: "Usapan kay ",
  conversations: "Mga usapan",
  dividerAt: (day, time) => `${day}, ${time}`,
  empty:
    "Idagdag ang pamilya o kaibigan sa inyong mga pinagkakatiwalaan para makapagsimulang sumulat sa kanila.",
  emptyThread: (firstName) => `Wala pang mensahe kay ${firstName}`,
  emptyThreadHint: (firstName) =>
    `Sumulat sa ibaba para magsimula. Makikita ninyo kung ano mismo ang matatanggap ni ${firstName} bago may maipadala.`,
  helpMeUnderstand: "Tulungan akong maunawaan",
  loadingConversation: "Nilo-load ang usapan",
  loadingConversations: "Nilo-load ang mga usapan",
  maxPhotos: (count) =>
    `Maaari kayong maglakip ng hanggang ${count} larawan. Alisin ang isa para magdagdag ng iba.`,
  messageTo: (firstName) => `Mensahe para kay ${firstName}`,
  messagesWith: (name) => `Mga mensahe kay ${name}`,
  noWayToReach: "Wala pang paraan para makaugnayan sila",
  noWayToReachName: (firstName) =>
    `Wala pang paraan para makaugnayan si ${firstName}`,
  notSent: "Hindi naipadala",
  notSureSent: "Hindi tiyak kung naipadala",
  nothingSentUntilApproved:
    "Walang ipinapadala hanggang suriin at aprubahan ninyo.",
  pendingMany: (count, firstName) =>
    `${count} mensahe para kay ${firstName} ang naghihintay ng inyong pag-apruba.`,
  pendingOne: (firstName) =>
    `May mensahe para kay ${firstName} na naghihintay ng inyong pag-apruba.`,
  peopleCount: (count) => `${count} tao`,
  photoCount: (count) => `${count} larawan`,
  photoInvalid: (name) =>
    `${name}: Pumili po ng larawan (JPEG, PNG, WebP, o HEIC).`,
  photosToSend: "Mga larawang ipapadala",
  practiceNothingSent: (firstName) =>
    `Pagsasanay: walang ipapadala kay ${firstName}.`,
  preparing: "Inihahanda…",
  preparingMessage: "Inihahanda ang inyong mensahe",
  previewManyPhotos: (count) => `${count} larawan`,
  previewOnePhoto: "Isang larawan",
  previewYou: (words) => `Kayo: ${words}`,
  recap: "Buod",
  recapThis: " ang usapang ito",
  removePhoto: (name) => `Alisin ang ${name}`,
  replyAdded:
    "Naidagdag ang tugon sa inyong mensahe. Maaari ninyo itong baguhin bago suriin.",
  reviewAndSend: "Suriin at ipadala",
  reviewIt: "Suriin ito",
  seeWhatHappened: "Tingnan ang nangyari",
  srThem: (firstName, when) => `${firstName}, ${when}: `,
  srYou: (when) => `Kayo, ${when}: `,
  startConversation: "Magsimula ng usapan",
  status: {
    delivered: "Naihatid",
    draft: "Burador, hindi pa ipinadala",
    failed: "Hindi naipadala",
    read: "Nabasa",
    received: "Natanggap",
    sending: "Ipinapadala…",
    sent: "Naipadala",
    unknown: "Hindi tiyak kung naipadala",
  },
  subline:
    "Sumulat sa inyong mga pinagkakatiwalaan. Makikita ninyo ang bawat mensahe bago ito ipadala.",
  title: "Mga mensahe",
  toAddress: (address) => ` sa ${address}`,
  waitingForApproval: (count) =>
    count === 1
      ? "Naghihintay ng inyong pag-apruba"
      : `${count} ang naghihintay ng inyong pag-apruba`,
  writeTo: (firstName) => `Sumulat kay ${firstName}`,
  writeToPlaceholder: (firstName) => `Sumulat kay ${firstName}…`,
};

export { threads };

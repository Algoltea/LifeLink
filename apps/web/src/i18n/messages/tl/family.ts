import type { Messages } from "../en";

const family: Messages["family"] = {
  appointments: "Mga appointment",
  budget: (amount) => ` · badyet ${amount}`,
  checked: (kind, day) => `${kind} na sinuri noong ${day}`,
  codeHint:
    "Mababasa ng nag-imbita sa inyo ang code sa kanilang pahina ng Mga pinagkakatiwalaan.",
  connect: "Ikonekta",
  connected:
    "Nakakonekta na kayo. Makikita lang ninyo ang pinili nilang ibahagi.",
  empty:
    "Wala pang nagbabahagi sa inyo. Kapag may nag-imbita, ilagay ang kanilang code sa ibaba.",
  groceries: "Mga bibilhin",
  haveCode: "May code ba kayo ng imbitasyon?",
  invitationCode: "Code ng imbitasyon",
  kinds: {
    email: "email",
    screenshot: "screenshot",
    text: "teksto",
  },
  likelyScam: "Malamang na panloloko",
  loadingMessages: "Nilo-load ang mga mensahe",
  loadingPhoto: "Nilo-load ang larawan…",
  loadingShared: "Nilo-load ang ibinahaging impormasyon",
  loadingWhatWasShared: "Nilo-load ang mga ibinahagi",
  messagesWith: (name) => `Mga mensahe kay ${name}`,
  noMessages: "Wala pang mensahe sa LifeLink.",
  noSharedReminders: "Walang ibinahaging paalala.",
  notSharing: "Hindi nagbabahagi sa inyo ang taong ito sa ngayon.",
  nothingLeft: "Wala nang kailangang bilhin.",
  nothingSoon: "Walang nakatakda sa susunod na 30 araw.",
  onlyResult: "Resulta lang ang ibinabahagi, hindi ang mismong mensahe.",
  photoUnavailable: "Hindi available ang larawang ito.",
  photos: "Mga larawan",
  replyTo: (name) => `Tumugon kay ${name}`,
  ride: {
    asked: "Humiling ng masasakyan, hindi pa kumpirmado",
    confirmed: "Kumpirmado ang masasakyan",
    declined: "Tinanggihan ang hiling na maghatid",
  },
  scamChecks: "Mga pagsusuri sa panloloko",
  sendReply: "Ipadala ang tugon",
  sharedPhoto: "Ibinahaging larawan",
  sharedReminders: "Mga ibinahaging paalala",
  shares: (name, scopes) =>
    `Ibinabahagi ni ${name}: ${scopes}. Maaari kayong tumingin, pero hindi magpadala, mag-apruba, o gumastos para sa kanila.`,
  subline:
    "Makita lang ang piniling ibahagi ng bawat tao. Maaari kayong tumingin, pero hindi kailanman magpadala, mag-apruba, o gumastos para sa kanila.",
  suspicious: "Kahina-hinala",
  theyWrote: (name) => `Isinulat ni ${name}: `,
  title: "Pamilya",
  updates: "Mga balita",
  withPhotos: " · may mga larawan",
  you: "Kayo",
  youWrote: "Isinulat ninyo: ",
};

export { family };

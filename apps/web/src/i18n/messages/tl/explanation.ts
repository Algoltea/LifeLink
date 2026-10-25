import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Isara ang paliwanag",
  cloud:
    "Paliwanag ng AI sa cloud na hiniling nang may pahintulot ninyo. Bawat sipi ay itinugma sa mensahe.",
  cloudConsent:
    "Gamitin ang katulong sa cloud para sa mas buong paliwanag. Ipapadala ang teksto ng mensahe sa tagapagbigay ng AI. Huwag lagyan ng tsek para sa lokal na paliwanag.",
  cloudConsentWithNotes:
    "Gamitin ang katulong sa cloud para sa mas buong paliwanag. Ipapadala ang teksto ng mensahe at inyong mga tala tungkol sa gustong tulong sa tagapagbigay ng AI. Huwag lagyan ng tsek para sa lokal na paliwanag.",
  dateSpoken: (quote, date) =>
    `Nabanggit na petsa: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Mga nabanggit na petsa at oras",
  droppedNote:
    "Wala sa mismong mga salita ng mensahe ang ilang detalye mula sa katulong, kaya ipinakita bilang hula o inalis.",
  explainAgainWithCloud: "Ipaliwanag ulit gamit ang AI sa cloud",
  explainThis: "Ipaliwanag ang mensaheng ito",
  explainWithCloud: "Ipaliwanag gamit ang AI sa cloud",
  facts: "Ang sinasabi ng mensahe",
  guessNote: "Mga hula ito, hindi ang nakasaad sa mensahe.",
  guessSpoken: (text) => `Isang hula: ${text}`,
  guesses: "Maaaring ibig sabihin",
  inPlainWords: "Sa simpleng pananalita",
  intro:
    "Maaaring sabihin ng LifeLink kung ano ang hinihiling ng mensahe, anong mga petsa ang nabanggit, at ano ang hindi sinabi.",
  loading: "Nilo-load ang paliwanag",
  local: {
    chosen:
      "Lokal na paliwanag: batay sa mga pattern, hindi sa buong pag-unawa. Walang ipinadala sa tagapagbigay ng AI.",
    failed:
      "Lokal na paliwanag. Humiling kayo ng paliwanag sa cloud, pero hindi ito natapos. Maaaring natanggap na ng tagapagbigay ang mensaheng ito.",
    limit:
      "Lokal na paliwanag. Naabot na ang limitasyon sa paliwanag sa cloud ngayong araw, kaya wala nang ipinadala.",
    practice:
      "Pagsasanay: ipinaliwanag sa LifeLink. Hindi kailanman ipinapadala ang mga mensahe sa pagsasanay sa tagapagbigay ng AI.",
    unavailable:
      "Lokal na paliwanag. Hindi pa naka-set up ang katulong sa cloud, kaya walang ipinadala sa tagapagbigay ng AI.",
  },
  localLanguageNotice:
    "Nasa Ingles at hindi pa naisalin ang mga paliwanag batay sa lokal na tuntunin. Maaaring isulat sa pinili ninyong wika ang paliwanag sa cloud. Hindi binabago ang mga sipi mula sa orihinal na mensahe.",
  missing: "Hindi pa nasasabi",
  missingSpoken: (detail) => `Hindi pa nasasabi: ${detail}`,
  onlyYou:
    "Kayo lang ang makakakita nito. Hindi ito ipinapadala o ibinabahagi sa pamilya.",
  part: "Bahagi",
  practiceNote:
    "Sa mode ng pagsasanay, lokal na binabasa ng LifeLink ang mensahe. Hindi kailanman ipinapadala ang mga mensahe sa pagsasanay sa tagapagbigay ng AI.",
  readAloud: "Basahin nang malakas ang paliwanag",
  readReply: "Basahin nang malakas ang tugong ito",
  reading: "Binabasa ang mensahe…",
  replies: "Mga posibleng tugon",
  repliesHint:
    "Wala pong ipinapadala. Mapupunta ang tugon sa kahon ng mensahe, kung saan maaari ninyong baguhin at suriin bago may mangyari.",
  requestSpoken: (text, quote) =>
    `Hinihiling nila: ${text} Sa kanilang mga salita: ${quote}.`,
  requests: "Ang hinihiling nila",
  title: "Tulong sa pag-unawa sa mensaheng ito",
  useReply: "Gamitin ang tugong ito",
  useReplyLabel: (label) => `Gamitin ang tugong ito: ${label}`,
};

export { explanation };

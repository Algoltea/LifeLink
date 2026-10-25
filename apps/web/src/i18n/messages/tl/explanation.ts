import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Isara ang paliwanag",
  cloud: "Ipinaliwanag ng AI sa cloud. Bawat sipi ay itinugma sa mensahe.",
  dateSpoken: (quote, date) =>
    `Nabanggit na petsa: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Mga nabanggit na petsa at oras",
  droppedNote:
    "Wala sa mismong mga salita ng mensahe ang ilang detalye mula sa katulong, kaya ipinakita bilang hula o inalis.",
  facts: "Ang sinasabi ng mensahe",
  guessNote: "Mga hula ito, hindi ang nakasaad sa mensahe.",
  guessSpoken: (text) => `Isang hula: ${text}`,
  guesses: "Maaaring ibig sabihin",
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
  moreDetail: "Higit pang detalye",
  onlyYou: "Kayo lang ang makakakita nito.",
  part: "Bahagi",
  reading: "Binabasa ang mensahe…",
  replies: "Mga posibleng tugon",
  repliesHint:
    "Wala pong ipinapadala. Mapupunta ang tugon sa kahon ng mensahe, kung saan maaari ninyong baguhin at suriin bago may mangyari.",
  replyLabelFor: (label) => `Gamitin ang tugong ito: ${label}`,
  requestSpoken: (text, quote) =>
    `Hinihiling nila: ${text} Sa kanilang mga salita: ${quote}.`,
  requests: "Ang hinihiling nila",
  title: "Tulong sa pag-unawa sa mensaheng ito",
};

export { explanation };

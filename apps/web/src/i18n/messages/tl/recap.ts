import type { Messages } from "../en";

const recap: Messages["recap"] = {
  agreed: "Napagkasunduan",
  agreedSpoken: (text) => `Napagkasunduan: ${text}`,
  changedNote:
    "Wala sa mismong mga salita ng mensahe ang ilang detalye mula sa katulong, o mga alok lang at hindi kasunduan, kaya binago o inalis ang mga ito.",
  close: "Isara ang buod",
  cloud:
    "Buod ng AI sa cloud na hiniling nang may pahintulot ninyo. Bawat sipi ay itinugma sa mga mensahe.",
  cloudConsent:
    "Gamitin ang katulong sa cloud para sa mas buong buod. Ipapadala ang inyong mga kamakailang mensahe sa taong ito sa tagapagbigay ng AI. Huwag lagyan ng tsek para sa mabilis na buod sa LifeLink.",
  done: "Tapos na",
  doneFromRecords:
    "Mula sa sariling mga tala ng LifeLink, hindi sa sinasabi ng mga mensahe.",
  inShort: "Sa madaling sabi",
  intro: (contactName) =>
    `Maaaring ibuod ng LifeLink ang napagkasunduan ninyo ni ${contactName}, ang inalok lamang, at ang mga hindi pa napagpapasyahan.`,
  loading: "Nilo-load ang buod",
  local: {
    chosen:
      "Mabilis na buod sa LifeLink: batay sa mga pattern, hindi sa buong pag-unawa. Walang ipinadala sa tagapagbigay ng AI.",
    failed:
      "Mabilis na buod sa LifeLink. Humiling kayo ng buod sa cloud, pero hindi ito natapos. Maaaring natanggap na ng tagapagbigay ang mga mensaheng ito.",
    limit:
      "Mabilis na buod sa LifeLink. Naabot na ang limitasyon sa buod sa cloud ngayong araw, kaya wala nang ipinadala.",
    practice:
      "Pagsasanay: mabilis na buod sa LifeLink. Hindi kailanman ipinapadala ang mga mensahe sa pagsasanay sa tagapagbigay ng AI.",
    unavailable:
      "Mabilis na buod sa LifeLink. Hindi pa naka-set up ang katulong sa cloud, kaya walang ipinadala sa tagapagbigay ng AI.",
  },
  messageTo: (contactName) => `Mensahe para kay ${contactName}`,
  nextSteps: "Mga posibleng susunod na hakbang",
  nextStepsHint:
    "Walang mangyayari hanggang maghanda kayo ng hakbang, suriin ito, at aprubahan.",
  noFinishedTasks: (contactName) =>
    `Walang natapos na gawain sa LifeLink kasama si ${contactName} sa panahong ito. Hindi itinuturing na tapos ang isang bagay dahil lang sinabi sa mensahe.`,
  offerNote:
    "Hindi pa kasunduan ang alok hangga't hindi pumapayag ang kabilang tao.",
  offered: "Inalok, hindi pa napagkasunduan",
  offeredSpoken: (text) => `Inalok, hindi pa napagkasunduan: ${text}`,
  onlyYou:
    "Kayo lang ang makakakita nito. Hindi ito ipinapadala o ibinabahagi sa pamilya.",
  part: "Bahagi",
  practiceNote:
    "Sa mode ng pagsasanay, LifeLink mismo ang gumagawa ng buod. Hindi kailanman ipinapadala ang mga mensahe sa pagsasanay sa tagapagbigay ng AI.",
  prepare: "Ihanda para suriin",
  prepared: "Handa na. Suriin ito",
  readAloud: "Basahin nang malakas ang buod",
  reading: "Binabasa ang usapan…",
  recapAgain: "Ibuod ulit",
  recapThis: "Ibuod ang usapang ito",
  recapWithCloud: "Ibuod gamit ang AI sa cloud",
  reminderForYou: "Paalala para sa inyo",
  stillUnclear: "Hindi pa malinaw",
  title: (contactName) => `Buod ng usapan kay ${contactName}`,
  unclearSpoken: (text) => `Hindi pa malinaw: ${text}`,
  you: "Kayo",
};

export { recap };

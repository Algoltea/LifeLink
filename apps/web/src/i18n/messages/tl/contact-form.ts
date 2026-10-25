import type { Messages } from "../en";

const contactForm: Messages["contactForm"] = {
  add: "Idagdag ang taong ito",
  addWay: "Magdagdag ng ibang paraan ng pakikipag-ugnayan",
  added: (name) => `Naidagdag na si ${name}.`,
  anotherWay: "Ibang paraan",
  askingForHelp: "Paghingi ng tulong sa kanila",
  chooseDifferentPicture: "Pumili ng ibang larawan",
  choosePicture: "Pumili ng larawan",
  detailsNotSaved: (error) =>
    `Hindi na-save ang detalye ng taong ito. ${error} Nandito pa ang mga inilagay ninyo. I-save ulit para subukan muli.`,
  howToReach: "Paano sila makauugnayan",
  language: "Wikang gagamitin ng LifeLink sa kanila",
  languageHelp:
    "Gagamitin ang wikang ito sa sariling mga salita ng LifeLink para sa kanila, tulad ng pagpapakilala sa inyo sa unang iMessage. Laging eksaktong ayon sa inyong inaprubahan ang ipapadalang mensahe ninyo.",
  languageSameAsMine: (language) => `Tulad ng sa akin (${language})`,
  name: "Pangalan",
  notSetYet: "Hindi pa naitakda",
  picture: "Larawan",
  pictureFailed: (error) => `${error} Pumili ng larawan para subukan ulit.`,
  pictureHelp:
    "Opsyonal. Gagawing maliit at parisukat ang larawan sa device na ito, at aalisin ang detalye ng lokasyon at camera bago i-save.",
  pictureNotSaved: (error) =>
    `Na-save ang detalye ng taong ito, pero hindi ang larawan. ${error} Nandito pa ang mga pinili ninyo. I-save ulit o pumili ng ibang larawan.`,
  pictureUnusable:
    "Hindi magamit ang larawang iyon. Pakisubukan po ang ibang larawan.",
  preferredWay: "Gustong paraan ng pakikipag-ugnayan",
  relationship: "Kaugnayan nila sa inyo",
  relationshipPlaceholder: "Anak, kapitbahay, kaibigan",
  removePicture: "Alisin ang larawan",
  saveChanges: "I-save ang mga pagbabago",
  saved: "Na-save na.",
  savingPersonAndPicture: "Sine-save ang tao at larawan…",
  trusted:
    "Kasama sa aking mga pinagkakatiwalaan. Maaaring imungkahi ng LifeLink na humingi ng tulong sa kanila.",
  ways: {
    discord: {
      help: "Ang kanilang Discord user ID ay mahabang numero. Sa Discord: Settings, Advanced, Developer Mode, saka Copy User ID.",
      label: "Discord",
      valueLabel: "Discord user ID",
    },
    email: {
      help: "Ang kanilang email address.",
      label: "Email (Gmail, Outlook, at iba pa)",
      valueLabel: "Email address",
    },
    imessageEmail: {
      help: "Ang Apple ID email na ginagamit nila para sa iMessage. Iba itong pagkakakilanlan sa kanilang numero ng telepono. Para makapagpadala ng totoong iMessage, i-save ang taong ito, saka piliin ang Baguhin at I-link ang iMessage.",
      label: "iMessage (Apple ID email)",
      valueLabel: "Apple ID email",
    },
    imessagePhone: {
      help: "Ang numero ng kanilang iPhone. Para makapagpadala ng totoong iMessage, i-save ang taong ito, saka piliin ang Baguhin at I-link ang iMessage.",
      label: "iMessage (numero ng telepono)",
      valueLabel: "Numero ng telepono",
    },
    telegram: {
      help: "Ang kanilang Telegram username, gaya ng @sam_alvarez (sa Telegram: Settings, saka Username). Pagkatapos mag-save, hilinging buksan nila ang @LifeLinkMessage_Bot sa Telegram at pindutin ang Start. Walang username? Iwan itong blangko at gamitin ang link sa Telegram sa ibaba.",
      label: "Telegram",
      valueLabel: "Telegram username",
    },
    whatsapp: {
      help: "Itatabi para sa inyo. Hindi pa makapagpadala ng mga mensahe sa WhatsApp ang LifeLink.",
      label: "WhatsApp (naka-save lamang)",
      valueLabel: "Numero sa WhatsApp",
    },
  },
  whoTheyAre: "Kung sino sila",
};

export { contactForm };

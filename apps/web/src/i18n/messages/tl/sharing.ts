import type { Messages } from "../en";

const sharing: Messages["sharing"] = {
  canSee: (labels) => `Makikita: ${labels}`,
  changePermissions: "Baguhin ang mga pahintulot",
  chooseAtLeastOne: "Pumili ng kahit isang ibabahagi para makagawa ng code.",
  chooseWhatToShare: "Piliin ang ibabahagi",
  codeAriaLabel: (spelled) => `Code ng imbitasyon ${spelled}`,
  codeCopied: "Nakopya na ang code.",
  codeCopyFailed:
    "Hindi makopya ang code. Subukan ulit ang Kopyahin ang code, o isulat ang code sa itaas.",
  codeSpoken: (spelled) => `Ang code ay ${spelled}`,
  codeSpokenDash: ", gitling, ",
  copyCode: "Kopyahin ang code",
  createCode: "Gumawa ng code ng imbitasyon",
  expiry: {
    none: "Walang petsa ng pagtatapos",
    seven: "7 araw",
    thirty: "30 araw",
  },
  forHowLong: "Gaano katagal",
  giveCode: (firstName) =>
    `Ibigay ang code na ito kay ${firstName}. Gagawa sila ng LifeLink account, pipiliin ang “Inimbitahan ako ng kapamilya”, at ilalagay ang code. Isang beses lang itong magagamit sa loob ng 14 araw. Kopyahin na; isang beses lang itong ipinapakita rito.`,
  invitationWaiting: "Naghihintay tanggapin ang imbitasyon",
  inviteFailed: (error) =>
    `Hindi magawa ang imbitasyon. ${error} Nandito pa ang mga pinili ninyo. Subukang gumawa ulit ng code.`,
  keepSharing: "Ipagpatuloy ang pagbabahagi",
  loadingPermissions: "Nilo-load ang mga pahintulot",
  loadingPermissionsShort: "Nilo-load ang mga pahintulot…",
  makingCode: "Ginagawa ang code…",
  noInformationSelected: "Walang impormasyong napiling ibahagi.",
  noInformationShared: "Walang ibinahaging impormasyon",
  notSharing: (firstName) =>
    `Wala kayong ibinabahaging impormasyon kay ${firstName}.`,
  permissionsFor: (name) => `Mga pahintulot para kay ${name}`,
  readCode: "Basahin nang malakas ang code",
  savePermissions: "I-save ang mga pahintulot",
  scopes: {
    "appointments.view": {
      description: "Mga paparating na appointment, kasama ang oras at lugar.",
      label: "Mga appointment",
    },
    "groceries.view": {
      description: "Mga naka-save na listahan ng bibilhin at mga badyet nito.",
      label: "Mga listahan ng bibilhin",
    },
    "photos.view": {
      description: "Mga larawang ibinahagi ninyo sa mga usapan ng pamilya.",
      label: "Mga ibinahaging larawan",
    },
    "reminders.view": {
      description: "Mga paalalang na-save at pinili ninyong ibahagi.",
      label: "Mga paalala",
    },
    "rides.view": {
      description:
        "Kalagayan ng pagpapahatid o pakiusap: hiniling, nasagot, nakumpirma.",
      label: "Mga usapan sa pagpapahatid",
    },
    "scam_alerts.view": {
      description: "Abiso kapag sinuri ninyo ang mensaheng mukhang panloloko.",
      label: "Mga babala sa panloloko",
    },
  },
  sharedInformation: "Ibinahaging impormasyon",
  startSharing:
    "Para magsimulang magbahagi, piliin ang makikita nila at bigyan sila ng code ng imbitasyon. Ilalagay nila ito sa sarili nilang LifeLink account.",
  state: {
    active: "Makikita ang ibinahaging impormasyon",
    expired: "Natapos ang pagbabahagi",
    invited: "Hindi pa nagagamit ang imbitasyon",
    revoked: "Itinigil ang pagbabahagi",
  },
  stopDescription: (name) =>
    `Hindi na agad makikita ni ${name} ang anumang ibinahagi ninyo. Maaari ninyo silang imbitahan ulit sa ibang pagkakataon.`,
  stopFailed: (error) =>
    `Hindi maitigil ang pagbabahagi. ${error} Subukan ulit ang Itigil ang pagbabahagi.`,
  stopSharing: "Itigil ang pagbabahagi",
  stopSharingWith: (name) => `Itigil ang pagbabahagi kay ${name}`,
  stopTitle: (name) => `Itigil ang pagbabahagi kay ${name}?`,
  stopped: (name) => `Itinigil ang pagbabahagi kay ${name}.`,
  stopping: "Itinitigil ang pagbabahagi…",
  them: "kanila",
  until: (day) => `Hanggang ${day}`,
  updateFailed: (error) =>
    `Hindi ma-update ang pagbabahagi. ${error} Nandito pa ang mga pinili ninyo. Piliin ang I-save ang mga pahintulot para subukan ulit.`,
  updated: "Na-update ang pagbabahagi. May bisa agad ito.",
  viewOnly:
    "Piliin ang impormasyong ibabahagi sa LifeLink. Makakatingin lang sila; hindi makapagpapadala ng mensahe, makapag-aapruba ng gawain, o makagagastos para sa inyo.",
  whatNameCanSee: (firstName) => `Ang makikita ni ${firstName}`,
  whatTheyCanSee: "Ang makikita nila",
};

export { sharing };

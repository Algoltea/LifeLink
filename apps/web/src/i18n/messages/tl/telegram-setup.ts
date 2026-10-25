import type { Messages } from "../en";

const telegramSetup: Messages["telegramSetup"] = {
  copiedInvitation: (contactName) =>
    `Nakopya ang imbitasyon. Kayo mismo ang magpadala kay ${contactName}.`,
  copiedLink: (contactName) =>
    `Nakopya ang link. Kayo mismo ang magpadala kay ${contactName}.`,
  copyInvitation: "Kopyahin ang imbitasyon",
  copyInvitationFailed:
    "Hindi makopya ang imbitasyon. Kopyahin ang address sa itaas.",
  copyLink: "Kopyahin ang link",
  copyLinkFailed: "Hindi makopya ang link. Piliin at kopyahin ito sa itaas.",
  expires: (day) =>
    ` Isang beses lang ito magagamit at mawawalan ng bisa sa ${day}.`,
  heading: "Telegram",
  invite: (contactName, botUrl) =>
    `Kumusta ${contactName}! Buksan ang ${botUrl} sa Telegram at pindutin ang Start para makapagmensahan tayo sa LifeLink.`,
  link: "I-link ang Telegram",
  linked: (account, contactName) =>
    `Naka-link sa ${account}. Maaaring dumaan sa Telegram ang mga mensaheng aprubahan ninyo para kay ${contactName}, at darating sa Mga mensahe ang kanilang tugon.`,
  loading: "Nilo-load ang pag-set up ng Telegram…",
  newLink: "Gumawa ng bagong link",
  notConfigured:
    "Kailangang i-set up ang app. Dapat munang ikonekta ng namamahala sa LifeLink ang Telegram bago ninyo ma-link ang kontak na ito.",
  ownerOnly:
    "May-ari lang ng account ang maaaring mag-link ng Telegram para sa kanilang mga kontak.",
  sendLink: (contactName) =>
    `Ipadala ang link na ito kay ${contactName}. Kapag binuksan nila at pinindot ang Start, awtomatikong mali-link ang Telegram dito.`,
  theirAccount: "kanilang Telegram account",
  unlink: "Alisin ang link sa Telegram",
  waitingAsk: (contactName) => `. Hilingin kay ${contactName} na buksan ang `,
  waitingFor: (username) => `Hinihintay si @${username}`,
  waitingRest:
    " sa Telegram at pindutin ang Start. Ili-link sila ng LifeLink sa sandaling gawin nila ito.",
};

export { telegramSetup };

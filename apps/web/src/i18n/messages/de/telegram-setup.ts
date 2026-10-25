import type { Messages } from "../en";

const telegramSetup: Messages["telegramSetup"] = {
  copiedInvitation: (contactName) =>
    `Einladung kopiert. Senden Sie sie selbst an ${contactName}.`,
  copiedLink: (contactName) =>
    `Link kopiert. Senden Sie ihn selbst an ${contactName}.`,
  copyInvitation: "Einladung kopieren",
  copyInvitationFailed:
    "Die Einladung konnte nicht kopiert werden. Kopieren Sie die Adresse oben.",
  copyLink: "Link kopieren",
  copyLinkFailed:
    "Der Link konnte nicht kopiert werden. Markieren und kopieren Sie ihn oben.",
  expires: (day) => ` Er funktioniert einmal und läuft am ${day} ab.`,
  heading: "Telegram",
  invite: (contactName, botUrl) =>
    `Hallo ${contactName}! Öffnen Sie ${botUrl} in Telegram und tippen Sie auf Start, damit wir uns über LifeLink schreiben können.`,
  link: "Telegram verknüpfen",
  linked: (account, contactName) =>
    `Mit ${account} verknüpft. Nachrichten, die Sie für ${contactName} genehmigen, können über Telegram gesendet werden. Antworten erscheinen unter „Nachrichten“.`,
  loading: "Telegram-Einrichtung wird geladen…",
  newLink: "Neuen Link erstellen",
  notConfigured:
    "Die App muss eingerichtet werden. Die Person, die LifeLink betreibt, muss Telegram verbinden, bevor Sie es für diesen Kontakt verknüpfen können.",
  ownerOnly:
    "Nur die Person, der das Konto gehört, kann Telegram für ihre Kontakte verknüpfen.",
  sendLink: (contactName) =>
    `Senden Sie diesen Link an ${contactName}. Wenn die Person ihn öffnet und auf Start tippt, wird Telegram hier automatisch verknüpft.`,
  theirAccount: "das Telegram-Konto der Person",
  unlink: "Telegram-Verknüpfung aufheben",
  waitingAsk: (contactName) => `. Bitten Sie ${contactName}, `,
  waitingFor: (username) => `Warten auf @${username}`,
  waitingRest:
    " in Telegram zu öffnen und auf Start zu tippen. LifeLink verknüpft die Person, sobald sie das tut.",
};

export { telegramSetup };

import type { Messages } from "../en";

const contactForm: Messages["contactForm"] = {
  add: "Diese Person hinzufügen",
  addWay: "Weitere Kontaktmöglichkeit hinzufügen",
  added: (name) => `${name} wurde hinzugefügt.`,
  anotherWay: "Weitere Möglichkeit",
  askingForHelp: "Diese Person um Hilfe bitten",
  chooseDifferentPicture: "Anderes Bild auswählen",
  choosePicture: "Bild auswählen",
  detailsNotSaved: (error) =>
    `Die Angaben zur Person konnten nicht gespeichert werden. ${error} Ihre Eingaben sind noch da. Wählen Sie erneut „Speichern“.`,
  howToReach: "So erreichen Sie die Person",
  language: "Sprache, die LifeLink mit dieser Person verwendet",
  languageHelp:
    "LifeLinks eigene Texte an diese Person verwenden diese Sprache, zum Beispiel die Vorstellung in ihrer ersten iMessage. Ihre Nachrichten werden immer genau so gesendet, wie Sie sie genehmigen.",
  languageSameAsMine: (language) => `Wie meine (${language})`,
  name: "Name",
  notSetYet: "Noch nicht festgelegt",
  picture: "Bild",
  pictureFailed: (error) =>
    `${error} Wählen Sie ein Bild aus, um es erneut zu versuchen.`,
  pictureHelp:
    "Optional. Das Foto wird auf diesem Gerät verkleinert und quadratisch zugeschnitten. Standort- und Kameradaten werden vor dem Speichern entfernt.",
  pictureNotSaved: (error) =>
    `Die Angaben zur Person wurden gespeichert, das Bild jedoch nicht. ${error} Ihre Auswahl ist noch da. Speichern Sie erneut oder wählen Sie ein anderes Bild.`,
  pictureUnusable:
    "Dieses Bild konnte nicht verwendet werden. Bitte versuchen Sie ein anderes Foto.",
  preferredWay: "Bevorzugte Kontaktmöglichkeit",
  relationship: "Ihre Beziehung zu dieser Person",
  relationshipPlaceholder: "Sohn, Nachbarin, Freund",
  removePicture: "Bild entfernen",
  saveChanges: "Änderungen speichern",
  saved: "Gespeichert.",
  savingPersonAndPicture: "Person und Bild werden gespeichert…",
  trusted:
    "Gehört zu meinem Vertrauenskreis. LifeLink darf vorschlagen, diese Person um Hilfe zu bitten.",
  ways: {
    discord: {
      help: "Die Discord-Nutzer-ID der Person, eine lange Zahl. In Discord: Einstellungen, Erweitert, Entwicklermodus und dann Nutzer-ID kopieren.",
      label: "Discord",
      valueLabel: "Discord-Nutzer-ID",
    },
    email: {
      help: "Die E-Mail-Adresse der Person.",
      label: "E-Mail (Gmail, Outlook und andere)",
      valueLabel: "E-Mail-Adresse",
    },
    imessageEmail: {
      help: "Die Apple-ID-E-Mail-Adresse, die die Person für iMessage verwendet. Sie ist eine andere Identität als die Telefonnummer. Um später echte iMessages zu senden, speichern Sie die Person und wählen Sie dann „Bearbeiten“ und „iMessage verknüpfen“.",
      label: "iMessage (Apple-ID-E-Mail)",
      valueLabel: "Apple-ID-E-Mail-Adresse",
    },
    imessagePhone: {
      help: "Die iPhone-Nummer der Person. Um später echte iMessages zu senden, speichern Sie die Person und wählen Sie dann „Bearbeiten“ und „iMessage verknüpfen“.",
      label: "iMessage (Telefonnummer)",
      valueLabel: "Telefonnummer",
    },
    telegram: {
      help: "Der Telegram-Nutzername der Person, zum Beispiel @sam_alvarez (in Telegram: Einstellungen, dann Nutzername). Bitten Sie die Person nach dem Speichern, @LifeLinkMessage_Bot in Telegram zu öffnen und auf Start zu tippen. Kein Nutzername? Lassen Sie das Feld leer und verwenden Sie unten den Telegram-Link.",
      label: "Telegram",
      valueLabel: "Telegram-Nutzername",
    },
    whatsapp: {
      help: "Wird für Sie gespeichert. LifeLink kann noch keine WhatsApp-Nachrichten senden.",
      label: "WhatsApp (nur gespeichert)",
      valueLabel: "WhatsApp-Nummer",
    },
  },
  whoTheyAre: "Wer diese Person ist",
};

export { contactForm };

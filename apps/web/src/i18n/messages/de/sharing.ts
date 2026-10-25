import type { Messages } from "../en";

const sharing: Messages["sharing"] = {
  canSee: (labels) => `Kann sehen: ${labels}`,
  changePermissions: "Berechtigungen ändern",
  chooseAtLeastOne:
    "Wählen Sie mindestens eine Information zum Teilen aus, um einen Code zu erstellen.",
  chooseWhatToShare: "Auswählen, was Sie teilen möchten",
  codeAriaLabel: (spelled) => `Einladungscode ${spelled}`,
  codeCopied: "Code kopiert.",
  codeCopyFailed:
    "Der Code konnte nicht kopiert werden. Wählen Sie erneut „Code kopieren“ oder schreiben Sie den oben angezeigten Code auf.",
  codeSpoken: (spelled) => `Der Code lautet ${spelled}`,
  codeSpokenDash: ", Bindestrich, ",
  copyCode: "Code kopieren",
  createCode: "Einladungscode erstellen",
  expiry: { none: "Kein Enddatum", seven: "7 Tage", thirty: "30 Tage" },
  forHowLong: "Für wie lange",
  giveCode: (firstName) =>
    `Geben Sie ${firstName} diesen Code. Die Person erstellt ein LifeLink-Konto, wählt „Ein Familienmitglied hat mich eingeladen“ und gibt ihn ein. Er funktioniert einmal und gilt 14 Tage. Kopieren Sie ihn jetzt. Er wird hier nur einmal angezeigt.`,
  invitationWaiting: "Einladung wartet auf Annahme",
  inviteFailed: (error) =>
    `Die Einladung konnte nicht erstellt werden. ${error} Ihre Auswahl ist noch da. Versuchen Sie erneut, den Code zu erstellen.`,
  keepSharing: "Weiter teilen",
  loadingPermissions: "Berechtigungen werden geladen",
  loadingPermissionsShort: "Berechtigungen werden geladen…",
  makingCode: "Code wird erstellt…",
  noInformationSelected: "Es sind keine Informationen zum Teilen ausgewählt.",
  noInformationShared: "Keine Informationen geteilt",
  notSharing: (firstName) => `Sie teilen keine Informationen mit ${firstName}.`,
  permissionsFor: (name) => `Berechtigungen für ${name}`,
  readCode: "Code vorlesen",
  savePermissions: "Berechtigungen speichern",
  scopes: {
    "appointments.view": {
      description: "Bevorstehende Termine mit Uhrzeit und Ort.",
      label: "Termine",
    },
    "groceries.view": {
      description: "Ihre gespeicherten Einkaufslisten und deren Budgets.",
      label: "Einkaufslisten",
    },
    "photos.view": {
      description:
        "Fotos, die Sie in Ihren Familienunterhaltungen geteilt haben.",
      label: "Geteilte Fotos",
    },
    "reminders.view": {
      description:
        "Erinnerungen, die Sie gespeichert und zum Teilen ausgewählt haben.",
      label: "Erinnerungen",
    },
    "rides.view": {
      description:
        "Der Stand einer Fahrt oder Besorgung: angefragt, beantwortet, bestätigt.",
      label: "Fahrtabsprachen",
    },
    "scam_alerts.view": {
      description:
        "Ein Hinweis, wenn Sie eine Nachricht prüfen, die nach Betrug aussieht.",
      label: "Betrugswarnungen",
    },
  },
  sharedInformation: "Geteilte Informationen",
  startSharing:
    "Wählen Sie aus, was die Person sehen darf, und geben Sie ihr einen Einladungscode. Sie gibt ihn in ihrem eigenen LifeLink-Konto ein.",
  state: {
    active: "Kann geteilte Informationen sehen",
    expired: "Freigabe abgelaufen",
    invited: "Einladung noch nicht verwendet",
    revoked: "Teilen beendet",
  },
  stopDescription: (name) =>
    `${name} kann sofort nichts mehr sehen, was Sie geteilt haben. Sie können die Person später erneut einladen.`,
  stopFailed: (error) =>
    `Das Teilen konnte nicht beendet werden. ${error} Wählen Sie erneut „Teilen beenden“.`,
  stopSharing: "Teilen beenden",
  stopSharingWith: (name) => `Teilen mit ${name} beenden`,
  stopTitle: (name) => `Teilen mit ${name} beenden?`,
  stopped: (name) => `Teilen mit ${name} beendet.`,
  stopping: "Teilen wird beendet…",
  them: "dieser Person",
  until: (day) => `Bis ${day}`,
  updateFailed: (error) =>
    `Die Freigabe konnte nicht aktualisiert werden. ${error} Ihre Auswahl ist noch da. Wählen Sie „Berechtigungen speichern“, um es erneut zu versuchen.`,
  updated: "Freigabe aktualisiert. Die Änderung gilt sofort.",
  viewOnly:
    "Wählen Sie, welche Informationen Sie in LifeLink teilen möchten. Die Person kann sie nur ansehen. Sie kann keine Nachrichten für Sie senden, Aktionen genehmigen oder Geld für Sie ausgeben.",
  whatNameCanSee: (firstName) => `Was ${firstName} sehen kann`,
  whatTheyCanSee: "Was die Person sehen kann",
};

export { sharing };

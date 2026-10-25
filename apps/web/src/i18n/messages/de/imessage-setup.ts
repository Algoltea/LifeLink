import type { Messages } from "../en";

const imessageSetup: Messages["imessageSetup"] = {
  agreeAndLink: "Zustimmen und diesen Kontakt verknüpfen",
  assignedNumber: "Zugewiesene iMessage-Nummer: ",
  checkComplete: "Prüfung abgeschlossen. Der aktuelle Status steht oben.",
  checkFailed:
    "Die erste Nachricht konnte nicht überprüft werden. Bitte versuchen Sie es erneut.",
  checkFirstMessage: "Nach erster Nachricht suchen",
  checking: "Die erste Nachricht wird gesucht…",
  confirmDescription:
    "Prüfen Sie die genaue Adresse und wie sie verwendet wird, bevor Sie fortfahren.",
  confirmInvitation: (contactName, handle) =>
    `Es wird keine Einladungsnachricht gesendet. Sie sehen die zugewiesene Nummer, die Sie ${contactName} mitteilen können. Die erste Nachricht muss von ${handle} an diese Nummer gesendet werden. Telefonnummer und Apple-ID-E-Mail-Adresse sind verschiedene Identitäten, auch auf demselben Telefon.`,
  confirmLink: "Den bestehenden Photon-Kontakt mit der Adresse ",
  confirmLookup:
    "Wenn Sie fortfahren, wird genau diese Adresse bei Photon, unserem iMessage-Anbieter, gesucht und der bestehende Kontakt verwendet. LifeLink registriert keine neuen Personen und belegt keine zusätzlichen Kontaktplätze.",
  confirmNoAccount: (contactName) =>
    `${contactName} benötigt weder ein LifeLink-Konto noch eine Dashboard-Einladung. Dies gewährt keinen Zugriff auf Inhalte Ihres Kontos.`,
  confirmTitle: (contactName) => `iMessage für ${contactName} verknüpfen?`,
  confirmTo: " verknüpfen mit ",
  copied: (contactName) =>
    `Anleitung kopiert. Senden Sie sie selbst an ${contactName}.`,
  copy: "Anleitung kopieren",
  copyFailed:
    "Die Anleitung konnte nicht kopiert werden. Markieren und kopieren Sie den Text oben oder wählen Sie erneut „Anleitung kopieren“.",
  exactAddress: "Genaue Kontaktadresse: ",
  firstMessageConfirmed:
    "Die erste Nachricht wurde bestätigt. LifeLink kann jetzt an diese registrierte Adresse schreiben.",
  heading: "iMessage einrichten",
  instructions: (contactName, assignedNumber, handle) =>
    `${contactName}: Um iMessage mit LifeLink zu nutzen, senden Sie bitte zuerst eine iMessage (zum Beispiel „Hallo“) an ${assignedNumber}, und zwar von Ihrer genau so registrierten Adresse: ${handle}. Achten Sie in Nachrichten darauf, dass die Unterhaltung von ${handle} aus beginnt. Telefonnummer und Apple-ID-E-Mail-Adresse sind verschiedene Identitäten, auch auf demselben Telefon. Eine Nachricht von einer anderen Adresse aktiviert diese Adresse nicht. Sie benötigen weder ein LifeLink-Konto noch eine Dashboard-Einladung.`,
  link: "iMessage verknüpfen",
  linkExplanation:
    "Verknüpfen Sie die Person, die bereits unter genau dieser Adresse bei Photon registriert ist. Falls sie dort fehlt, fügen Sie sie zuerst im Photon-Dashboard hinzu und versuchen Sie es erneut. LifeLink legt keine neuen Personen an.",
  linkFailed:
    "Dieser Kontakt konnte nicht verknüpft werden. Prüfen Sie, ob genau diese Adresse im Photon-Dashboard registriert ist, und versuchen Sie es erneut.",
  loading: "iMessage-Einrichtung wird geladen…",
  lookingUp: "Dieser bestehende Kontakt wird bei Photon gesucht…",
  mustSendFirst: (contactName) =>
    `${contactName} muss die erste Nachricht von der oben gezeigten Adresse senden. Ihre eigene Nachricht aktiviert die Einrichtung dieser Person nicht.`,
  needsAddress:
    "Eine iMessage-Adresse wird benötigt. Tragen Sie oben die Telefonnummer oder Apple-ID-E-Mail-Adresse der Person ein und speichern Sie sie.",
  notConfigured:
    "Die App muss eingerichtet werden. Die Person, die LifeLink betreibt, muss Photon verbinden, bevor Sie iMessage für diesen Kontakt einrichten können.",
  ownerOnly:
    "Nur die Person, der das Konto gehört, kann iMessage für ihre Kontakte einrichten oder prüfen.",
  practice: (contactName) =>
    `Übungsnachrichten bleiben in LifeLink. Deshalb gibt es hier nichts einzurichten. Wenn Sie zu echtem iMessage wechseln, können Sie ${contactName} hier verknüpfen.`,
  retryLink: "iMessage erneut verknüpfen versuchen",
  row: {
    failed: "iMessage braucht Ihre Aufmerksamkeit",
    not_registered: "iMessage noch nicht verknüpft",
    registering: "iMessage wird verknüpft",
    waiting: "Warten auf die erste iMessage der Person",
  },
  status: {
    failed: "Einrichtung braucht Ihre Aufmerksamkeit",
    not_registered: "Nicht verknüpft",
    ready: "Bereit für iMessage",
    registering: "Wird verknüpft",
    waiting: "Warten auf die erste Nachricht der Person",
  },
};

export { imessageSetup };

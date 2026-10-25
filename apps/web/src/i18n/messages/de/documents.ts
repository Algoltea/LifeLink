import type { Messages } from "../en";

const documents: Messages["documents"] = {
  backToFiles: "Zurück zu Ihren Dateien",
  changed: "Geändert ",
  changedAt: (when) => `Geändert ${when}`,
  changedSr: ", geändert ",
  changedSuffix: (when) => ` · Geändert ${when}`,
  checkingConnection: "Ihre Google-Drive-Verbindung wird geprüft",
  chooseFile: "Wählen Sie eine Datei aus, um hier eine Vorschau zu sehen.",
  connect: "Google Drive verbinden",
  connectHint: "Verbinden Sie Google Drive, um Ihre Dateien hier zu sehen.",
  connectPracticeHint:
    "Verbinden Sie Google Drive im Übungsmodus, um dies mit Beispieldateien auszuprobieren.",
  connected: (account) =>
    `Verbunden: Google Drive${account ? ` (${account})` : ""}. Öffnen Sie eine Datei in Google Drive, um sie zu ändern oder zu teilen.`,
  embedHint:
    "Google zeigt diese Vorschau direkt an. Falls Sie sich anmelden sollen, verwenden Sie dasselbe Google-Konto, das Sie verbunden haben, oder öffnen Sie die Datei in Google Drive.",
  empty: "In Ihrem Google Drive gibt es noch keine Dateien.",
  fileCountAll: (count) =>
    count === 1
      ? "Das ist die einzige Datei."
      : `Das sind alle ${count} Dateien.`,
  filesFound: "Gefundene Dateien",
  find: "Datei nach Namen suchen",
  folderNoPreview:
    "Ordner können hier nicht als Vorschau angezeigt werden. Öffnen Sie den Ordner in Google Drive, um seinen Inhalt zu sehen.",
  kinds: {
    Document: "Dokument",
    File: "Datei",
    Folder: "Ordner",
    PDF: "PDF",
    Picture: "Bild",
    Slides: "Präsentation",
    Spreadsheet: "Tabelle",
  },
  loadingFiles: "Ihre Drive-Dateien werden geladen",
  loadingMore: "Weitere Dateien werden geladen",
  moreFailed: "Die nächsten Dateien konnten nicht geladen werden.",
  noLink:
    "Google Drive hat keinen Link für diese Datei bereitgestellt. Öffnen Sie Google Drive und suchen Sie nach dem Dateinamen.",
  noMatch: (search) => `Kein Dateiname enthält „${search}“.`,
  openInDrive: "In Google Drive öffnen",
  opened: (name) => `Geöffnet: ${name}`,
  opensNewTab: "(öffnet sich in einem neuen Tab)",
  practiceConnected:
    "Drive zum Üben mit Beispieldateien und Notizen, die Sie im Übungsmodus speichern. Nichts hier stammt aus einem echten Google-Konto.",
  practiceNoLink:
    "Übungsdateien gibt es nur in LifeLink. Sie lassen sich nicht in Google Drive öffnen. Wenn Ihr echtes Drive verbunden ist, öffnet diese Schaltfläche die Datei dort.",
  previewOf: (name) => `Vorschau von ${name} aus Google Drive`,
  previewPrefix: "Vorschau: ",
  reconnect: "Google Drive erneut verbinden",
  searching: "Wird gesucht…",
  sort: "Sortieren",
  sorts: {
    folders_first: "Ordner zuerst",
    name_asc: "Name, A bis Z",
    name_desc: "Name, Z bis A",
    oldest: "Älteste zuerst",
    recent: "Kürzlich geändert",
  },
  title: "Dokumente",
  whatItSays: (name) => `Was in ${name} steht`,
  yourDrive: "Ihr Google Drive",
  yourDriveFiles: "Ihre Drive-Dateien",
  yourFiles: "Ihre Dateien",
};

export { documents };

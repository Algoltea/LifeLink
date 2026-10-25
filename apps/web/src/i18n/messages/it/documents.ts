import type { Messages } from "../en";

const documents: Messages["documents"] = {
  backToFiles: "Torna ai Suoi file",
  changed: "Modificato ",
  changedAt: (when) => `Modificato ${when}`,
  changedSr: ", modificato ",
  changedSuffix: (when) => ` · Modificato ${when}`,
  checkingConnection: "Controllo del collegamento a Google Drive",
  chooseFile: "Scelga un file per vederne l’anteprima qui.",
  connect: "Collega Google Drive",
  connectHint: "Colleghi Google Drive per vedere qui i Suoi file.",
  connectPracticeHint:
    "Colleghi Google Drive di prova per provare con file di esempio.",
  connected: (account) =>
    `Collegato: Google Drive${account ? ` (${account})` : ""}. Apra un file in Google Drive per modificarlo o condividerlo.`,
  embedHint:
    "Google mostra direttamente questa anteprima. Se Le chiede di accedere, usi lo stesso account Google che ha collegato, oppure apra il file in Google Drive.",
  empty: "Il Suo Google Drive non contiene ancora file.",
  fileCountAll: (count) =>
    count === 1 ? "È l’unico file." : `Sono tutti i ${count} file.`,
  filesFound: "File trovati",
  find: "Trova un file per nome",
  folderNoPreview:
    "Qui non è possibile vedere l’anteprima delle cartelle. La apra in Google Drive per vederne il contenuto.",
  kinds: {
    Document: "Documento",
    File: "File",
    Folder: "Cartella",
    PDF: "PDF",
    Picture: "Immagine",
    Slides: "Presentazione",
    Spreadsheet: "Foglio di calcolo",
  },
  loadingFiles: "Caricamento dei Suoi file Drive",
  loadingMore: "Caricamento di altri file",
  moreFailed: "Non è stato possibile caricare i file successivi.",
  noLink:
    "Google Drive non ha fornito un collegamento per questo file. Apra Google Drive e lo cerchi per nome.",
  noMatch: (search) => `Nessun nome di file contiene “${search}”.`,
  openInDrive: "Apri in Google Drive",
  opened: (name) => `Aperto: ${name}`,
  opensNewTab: "(si apre in una nuova scheda)",
  practiceConnected:
    "Drive di prova con file di esempio e le note che salva in modalità di prova. Nulla qui proviene da un account Google reale.",
  practiceNoLink:
    "I file di prova esistono solo in LifeLink, quindi non possono essere aperti in Google Drive. Con il Suo Drive reale collegato, questo pulsante apre lì il file.",
  previewOf: (name) => `Anteprima di ${name} da Google Drive`,
  previewPrefix: "Anteprima: ",
  reconnect: "Ricollega Google Drive",
  searching: "Ricerca…",
  sort: "Ordina",
  sorts: {
    folders_first: "Prima le cartelle",
    name_asc: "Nome, dalla A alla Z",
    name_desc: "Nome, dalla Z alla A",
    oldest: "Prima i meno recenti",
    recent: "Modificati di recente",
  },
  title: "Documenti",
  whatItSays: (name) => `Cosa dice ${name}`,
  yourDrive: "Il Suo Google Drive",
  yourDriveFiles: "I Suoi file Drive",
  yourFiles: "I Suoi file",
};

export { documents };

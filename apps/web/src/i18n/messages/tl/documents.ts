import type { Messages } from "../en";

const documents: Messages["documents"] = {
  backToFiles: "Bumalik sa inyong mga file",
  changed: "Binago noong ",
  changedAt: (when) => `Binago noong ${when}`,
  changedSr: ", binago noong ",
  changedSuffix: (when) => ` · Binago noong ${when}`,
  checkingConnection: "Sinusuri ang inyong koneksyon sa Google Drive",
  chooseFile: "Pumili ng file para makita ang paunang pagtingin dito.",
  connect: "Ikonekta ang Google Drive",
  connectHint:
    "Ikonekta ang Google Drive para makita rito ang inyong mga file.",
  connectPracticeHint:
    "Ikonekta ang Google Drive para sa pagsasanay upang subukan gamit ang mga halimbawang file.",
  connected: (account) =>
    `Nakakonekta: Google Drive${account ? ` (${account})` : ""}. Magbukas ng file sa Google Drive para baguhin o ibahagi ito.`,
  embedHint:
    "Direktang ipinapakita ng Google ang paunang pagtinging ito. Kung kailangan ng pag-sign in, gamitin ang parehong Google account na ikinonekta ninyo, o buksan ang file sa Google Drive.",
  empty: "Wala pang file ang inyong Google Drive.",
  fileCountAll: (count) => `Iyan na ang lahat ng ${count} file.`,
  filesFound: "Mga nahanap na file",
  find: "Maghanap ng file ayon sa pangalan",
  folderNoPreview:
    "Hindi maaaring tingnan ang laman ng folder dito. Buksan ito sa Google Drive para makita ang nilalaman.",
  kinds: {
    Document: "Dokumento",
    File: "File",
    Folder: "Folder",
    PDF: "PDF",
    Picture: "Larawan",
    Slides: "Mga slide",
    Spreadsheet: "Spreadsheet",
  },
  loadingFiles: "Nilo-load ang inyong mga file sa Drive",
  loadingMore: "Nilo-load ang iba pang file",
  moreFailed: "Hindi ma-load ang mga susunod na file.",
  noLink:
    "Walang ibinigay na link ang Google Drive para sa file na ito. Buksan ang Google Drive at hanapin ito ayon sa pangalan.",
  noMatch: (search) => `Walang pangalan ng file na may “${search}”.`,
  openInDrive: "Buksan sa Google Drive",
  opened: (name) => `Nabuksan: ${name}`,
  opensNewTab: "(bubukas sa bagong tab)",
  practiceConnected:
    "Drive para sa pagsasanay na may mga halimbawang file at mga talang sine-save ninyo sa mode ng pagsasanay. Walang galing sa totoong Google account dito.",
  practiceNoLink:
    "Nasa LifeLink lamang ang mga file sa pagsasanay, kaya hindi mabubuksan sa Google Drive. Kapag nakakonekta ang tunay ninyong Drive, bubuksan ng button na ito ang file roon.",
  previewOf: (name) => `Paunang pagtingin ng ${name} mula sa Google Drive`,
  previewPrefix: "Paunang pagtingin: ",
  reconnect: "Ikonekta ulit ang Google Drive",
  searching: "Naghahanap…",
  sort: "Ayusin",
  sorts: {
    folders_first: "Mga folder muna",
    name_asc: "Pangalan, A hanggang Z",
    name_desc: "Pangalan, Z hanggang A",
    oldest: "Pinakaluma muna",
    recent: "Kamakailang binago",
  },
  title: "Mga dokumento",
  whatItSays: (name) => `Nilalaman ng ${name}`,
  yourDrive: "Inyong Google Drive",
  yourDriveFiles: "Inyong mga file sa Drive",
  yourFiles: "Inyong mga file",
};

export { documents };

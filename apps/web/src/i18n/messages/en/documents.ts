const documents = {
  backToFiles: "Back to your files",
  changed: "Changed ",
  changedAt: (when: string) => `Changed ${when}`,
  changedSr: ", changed ",
  changedSuffix: (when: string) => ` · Changed ${when}`,
  checkingConnection: "Checking your Google Drive connection",
  chooseFile: "Choose a file to see a preview of it here.",
  connect: "Connect Google Drive",
  connectHint: "Connect Google Drive to see your files here.",
  connectPracticeHint:
    "Connect the practice Google Drive to try this with sample files.",
  connected: (account: string | null) =>
    `Connected: Google Drive${account ? ` (${account})` : ""}. Open a file in Google Drive to change or share it.`,
  embedHint:
    "Google shows this preview directly. If it asks you to sign in, use the same Google account you connected, or open the file in Google Drive.",
  empty: "Your Google Drive has no files yet.",
  fileCountAll: (count: number) =>
    count === 1 ? "That’s the only file." : `That’s all ${count} files.`,
  filesFound: "Files found",
  find: "Find a file by name",
  folderNoPreview:
    "Folders cannot be previewed here. Open it in Google Drive to see what is inside.",
  kinds: Object.fromEntries(
    [
      "Document",
      "File",
      "Folder",
      "PDF",
      "Picture",
      "Slides",
      "Spreadsheet",
    ].map((kind) => [kind, kind])
  ),
  loadingFiles: "Loading your Drive files",
  loadingMore: "Loading more files",
  moreFailed: "The next files could not be loaded.",
  noLink:
    "Google Drive did not share a link for this file. Open Google Drive and search for it by name.",
  noMatch: (search: string) => `No file names contain “${search}”.`,
  openInDrive: "Open in Google Drive",
  opened: (name: string) => `Opened: ${name}`,
  opensNewTab: "(opens in a new tab)",
  practiceConnected:
    "Practice Drive with sample files, plus notes you save in Practice mode. Nothing here comes from a real Google account.",
  practiceNoLink:
    "Practice files live only in LifeLink, so they can’t be opened in Google Drive. With your real Drive connected, this button opens the file there.",
  previewOf: (name: string) => `Preview of ${name} from Google Drive`,
  previewPrefix: "Preview: ",
  reconnect: "Reconnect Google Drive",
  searching: "Searching…",
  sort: "Sort",
  sorts: {
    folders_first: "Folders first",
    name_asc: "Name, A to Z",
    name_desc: "Name, Z to A",
    oldest: "Oldest first",
    recent: "Recently changed",
  },
  title: "Documents",
  whatItSays: (name: string) => `What ${name} says`,
  yourDrive: "Your Google Drive",
  yourDriveFiles: "Your Drive files",
  yourFiles: "Your files",
};

export { documents };

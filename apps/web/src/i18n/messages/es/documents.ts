import type { Messages } from "../en";

const documents: Messages["documents"] = {
  backToFiles: "Volver a sus archivos",
  changed: "Cambiado ",
  changedAt: (when) => `Cambiado el ${when}`,
  changedSr: ", cambiado ",
  changedSuffix: (when) => ` · Cambiado el ${when}`,
  checkingConnection: "Revisando la conexión con su Google Drive",
  chooseFile: "Elija un archivo para ver aquí una vista previa.",
  connect: "Conectar Google Drive",
  connectHint: "Conecte Google Drive para ver aquí sus archivos.",
  connectPracticeHint:
    "Conecte el Google Drive de práctica para probarlo con archivos de ejemplo.",
  connected: (account) =>
    `Conectado: Google Drive${account ? ` (${account})` : ""}. Abra un archivo en Google Drive para cambiarlo o compartirlo.`,
  embedHint:
    "Google muestra esta vista previa directamente. Si le pide iniciar sesión, use la misma cuenta de Google que conectó, o abra el archivo en Google Drive.",
  empty: "Su Google Drive todavía no tiene archivos.",
  fileCountAll: (count) =>
    count === 1 ? "Es el único archivo." : `Son todos: ${count} archivos.`,
  filesFound: "Archivos encontrados",
  find: "Buscar un archivo por nombre",
  folderNoPreview:
    "Las carpetas no se pueden ver aquí. Ábrala en Google Drive para ver qué contiene.",
  kinds: {
    Document: "Documento",
    File: "Archivo",
    Folder: "Carpeta",
    PDF: "PDF",
    Picture: "Imagen",
    Slides: "Presentación",
    Spreadsheet: "Hoja de cálculo",
  },
  loadingFiles: "Cargando sus archivos de Drive",
  loadingMore: "Cargando más archivos",
  moreFailed: "No se pudieron cargar los siguientes archivos.",
  noLink:
    "Google Drive no compartió un enlace para este archivo. Abra Google Drive y búsquelo por su nombre.",
  noMatch: (search) => `Ningún nombre de archivo contiene «${search}».`,
  openInDrive: "Abrir en Google Drive",
  opened: (name) => `Abierto: ${name}`,
  opensNewTab: "(se abre en una pestaña nueva)",
  practiceConnected:
    "Drive de práctica con archivos de ejemplo, más las notas que guarde en el modo de práctica. Nada de esto viene de una cuenta real de Google.",
  practiceNoLink:
    "Los archivos de práctica solo existen en LifeLink, así que no se pueden abrir en Google Drive. Con su Drive real conectado, este botón abre el archivo allí.",
  previewOf: (name) => `Vista previa de ${name} desde Google Drive`,
  previewPrefix: "Vista previa: ",
  reconnect: "Volver a conectar Google Drive",
  searching: "Buscando…",
  sort: "Orden",
  sorts: {
    folders_first: "Carpetas primero",
    name_asc: "Nombre, de la A a la Z",
    name_desc: "Nombre, de la Z a la A",
    oldest: "Más antiguos primero",
    recent: "Cambiados hace poco",
  },
  title: "Documentos",
  whatItSays: (name) => `Lo que dice ${name}`,
  yourDrive: "Su Google Drive",
  yourDriveFiles: "Sus archivos de Drive",
  yourFiles: "Sus archivos",
};

export { documents };

import type { Messages } from "../en";

const documents: Messages["documents"] = {
  backToFiles: "Voltar para seus arquivos",
  changed: "Alterado ",
  changedAt: (when) => `Alterado ${when}`,
  changedSr: ", alterado ",
  changedSuffix: (when) => ` · Alterado ${when}`,
  checkingConnection: "Verificando sua conexão com o Google Drive",
  chooseFile: "Escolha um arquivo para ver uma prévia aqui.",
  connect: "Conectar Google Drive",
  connectHint: "Conecte o Google Drive para ver seus arquivos aqui.",
  connectPracticeHint:
    "Conecte o Google Drive de prática para experimentar com arquivos de exemplo.",
  connected: (account) =>
    `Conectado: Google Drive${account ? ` (${account})` : ""}. Abra um arquivo no Google Drive para alterar ou compartilhar.`,
  embedHint:
    "O Google mostra esta prévia diretamente. Se pedir para entrar, use a mesma conta Google que você conectou ou abra o arquivo no Google Drive.",
  empty: "Seu Google Drive ainda não tem arquivos.",
  fileCountAll: (count) =>
    count === 1
      ? "Este é o único arquivo."
      : `Estes são todos os ${count} arquivos.`,
  filesFound: "Arquivos encontrados",
  find: "Encontrar um arquivo pelo nome",
  folderNoPreview:
    "Não é possível ver uma prévia de pastas aqui. Abra no Google Drive para ver o conteúdo.",
  kinds: {
    Document: "Documento",
    File: "Arquivo",
    Folder: "Pasta",
    PDF: "PDF",
    Picture: "Imagem",
    Slides: "Apresentação",
    Spreadsheet: "Planilha",
  },
  loadingFiles: "Carregando seus arquivos do Drive",
  loadingMore: "Carregando mais arquivos",
  moreFailed: "Não foi possível carregar os próximos arquivos.",
  noLink:
    "O Google Drive não forneceu um link para este arquivo. Abra o Google Drive e pesquise pelo nome.",
  noMatch: (search) => `Nenhum nome de arquivo contém “${search}”.`,
  openInDrive: "Abrir no Google Drive",
  opened: (name) => `Aberto: ${name}`,
  opensNewTab: "(abre em uma nova aba)",
  practiceConnected:
    "Drive de prática com arquivos de exemplo e notas que você salva no modo de prática. Nada aqui vem de uma conta Google real.",
  practiceNoLink:
    "Os arquivos de prática existem apenas no LifeLink, por isso não podem ser abertos no Google Drive. Com seu Drive real conectado, este botão abre o arquivo lá.",
  previewOf: (name) => `Prévia de ${name} do Google Drive`,
  previewPrefix: "Prévia: ",
  reconnect: "Reconectar Google Drive",
  searching: "Pesquisando…",
  sort: "Ordenar",
  sorts: {
    folders_first: "Pastas primeiro",
    name_asc: "Nome, de A a Z",
    name_desc: "Nome, de Z a A",
    oldest: "Mais antigos primeiro",
    recent: "Alterados recentemente",
  },
  title: "Documentos",
  whatItSays: (name) => `O que ${name} diz`,
  yourDrive: "Seu Google Drive",
  yourDriveFiles: "Seus arquivos do Drive",
  yourFiles: "Seus arquivos",
};

export { documents };

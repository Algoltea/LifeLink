import type { Messages } from "../en";

const settings: Messages["settings"] = {
  accountsAndPermissions: "Contas e permissões",
  accountsLink: "Contas que o LifeLink pode usar",
  aiEmailChecks: "Verificar novos e-mails com IA",
  aiEmailChecksDescription:
    "Quando chega um novo e-mail, um serviço de IA na nuvem verifica sinais de golpe. E-mails antigos e de prática nunca são enviados.",
  captions: "Legendas durante a conversa",
  captionsDescription:
    "Mostra as palavras enquanto você conversa com o LifeLink.",
  characterCount: (count, maximum) => `${count} de ${maximum} caracteres`,
  choicesNotSaved: (error) =>
    `Suas escolhas não foram salvas na sua conta. ${error} Tente novamente abaixo.`,
  contrast: "Contraste",
  contrastDescription:
    "Um contraste maior deixa o texto mais escuro e as bordas mais fortes.",
  contrastMore: "Mais contraste",
  contrastStandard: "Padrão",
  defaultVoice: "Voz padrão do LifeLink",
  demoAllowedHint: "Esta opção é salva automaticamente.",
  demoBetweenModes:
    "Tudo o que for preparado em um modo precisa ser revisado novamente antes de ser executado no outro.",
  demoDescription:
    "No modo de prática, nada é enviado de verdade, salvo em outro lugar ou comprado. Tudo o que aconteceria é simulado e marcado como “Prática”. Pessoas e mensagens de exemplo são adicionadas para você experimentar com segurança.",
  demoFailed: (error) =>
    `Não foi possível mudar o modo de prática. ${error} Tente usar a opção novamente.`,
  demoOff:
    "O modo de prática está desativado. Tudo o que você aprovar agora acontecerá de verdade.",
  demoOn: "O modo de prática está ativado.",
  demoTitle: "Modo de prática",
  demoTurnedOff: "O modo de prática foi desativado para este aplicativo.",
  demoUse: "Usar modo de prática",
  detailDetailed: "Detalhadas",
  detailShort: "Curtas",
  explanations: "Explicações",
  explanationsDescription:
    "Curtas mostra os pontos principais. Detalhadas explica um pouco mais.",
  fullName: "Nome completo",
  groceriesLink: "Listas de compras e orçamentos",
  hearSample: "Ouvir uma amostra",
  helpDescription:
    "Estas preferências são usadas quando o LifeLink explica uma mensagem, uma verificação de golpe, um resumo de conversa ou seu resumo da manhã. Só você vê essas explicações. As opções abaixo são salvas ao mudar; as notas têm o botão Salvar notas.",
  helpTitle: "Como gosto de receber ajuda",
  language: "Idioma",
  languageDescription:
    "Escolha o idioma das telas principais e da ajuda na nuvem do LifeLink. As telas principais estão traduzidas nos dez idiomas disponíveis; algumas páginas mais recentes ainda usam inglês. As verificações de golpes e e-mails que usam regras locais cobrem apenas o inglês e podem não reconhecer golpes em outros idiomas. Citações e mensagens mantêm as palavras originais.",
  lessMovement: "Menos movimento",
  lessMovementDescription:
    "Desativa os efeitos de deslizamento e transição gradual.",
  loading: "Carregando configurações",
  newsOnToday: "Notícias em Hoje",
  newsOnTodayDescription:
    "Mostra três manchetes em Hoje. Lá você escolhe boas notícias ou principais notícias.",
  notes: "Notas sobre como gosto de receber ajuda",
  notesHint:
    "Por exemplo, “Mostre um passo de cada vez”. Estas notas são usadas apenas nas explicações do LifeLink para você. Nunca são mostradas à família nem incluídas em mensagens. Se você permitir uma explicação na nuvem, as notas serão enviadas ao provedor de IA junto com a mensagem.",
  notesNotSaved: (error) =>
    `Suas notas não foram salvas. ${error} Seu texto continua aqui. Escolha Salvar notas para tentar novamente.`,
  notesSaveHint: "Escolha Salvar notas para guardar as mudanças neste texto.",
  notesSaved: "Suas notas foram salvas.",
  oneStep: "Um passo de cada vez",
  oneStepDescription:
    "Mostra explicações e próximos passos um de cada vez, com um botão Próximo.",
  permissionsLink: "Quem pode ver o quê",
  postalCode: "Código postal",
  preferredName: "Como o LifeLink chama você",
  profileNotSaved: (error) =>
    `Seu perfil não foi salvo. ${error} Os dados que você preencheu continuam aqui. Escolha Salvar perfil para tentar novamente.`,
  profileSaveHint:
    "Escolha Salvar perfil para guardar as mudanças nesta seção.",
  profileTitle: "Sobre você",
  readAloudAuto: "Ler em voz alta automaticamente",
  readAloudAutoDescription:
    "O LifeLink lê novos resumos e respostas em voz alta.",
  readAloudVoice: "Voz de leitura",
  readAloudVoiceDescription:
    "Escolha a voz que lê para você. A opção padrão do LifeLink usa a voz habitual.",
  saveNotes: "Salvar notas",
  saveProfile: "Salvar perfil",
  saved: "Salvo.",
  savesAsYouChange: "Estas preferências são salvas quando você as altera.",
  seeingAndHearing: "Visão e audição",
  signOff: "Como você assina as mensagens",
  signOffPlaceholder: "Por exemplo, Mãe",
  speakingSpeed: "Velocidade da fala",
  speakingSpeedDescription: "A velocidade com que o LifeLink lê em voz alta.",
  speechQuicker: "Mais rápida",
  speechSample: "Esta é a voz do LifeLink quando lê para você.",
  speechSlower: "Mais lenta",
  speechUsual: "Normal",
  subline: "Deixe o LifeLink confortável para ler e ouvir.",
  textSize: "Tamanho do texto",
  textSizeDescription:
    "Muda todas as páginas. Sua escolha fica salva neste dispositivo.",
  textSizeLarge: "Grande",
  textSizeLarger: "Maior",
  textSizeLargest: "Muito grande",
  textSizeStandard: "Padrão",
  theme: "Claro ou escuro",
  themeDark: "Escuro",
  themeLight: "Claro",
  themeSystem: "Seguir meu dispositivo",
  timeZone: "Fuso horário",
  title: "Configurações",
  trySavingAgain: "Tentar salvar novamente",
};

export { settings };

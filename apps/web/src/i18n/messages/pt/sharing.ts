import type { Messages } from "../en";

const sharing: Messages["sharing"] = {
  canSee: (labels) => `Pode ver: ${labels}`,
  changePermissions: "Alterar permissões",
  chooseAtLeastOne:
    "Escolha pelo menos uma informação para compartilhar e criar um código.",
  chooseWhatToShare: "Escolha o que compartilhar",
  codeAriaLabel: (spelled) => `Código de convite ${spelled}`,
  codeCopied: "Código copiado.",
  codeCopyFailed:
    "Não foi possível copiar o código. Tente Copiar o código novamente ou anote o código mostrado acima.",
  codeSpoken: (spelled) => `O código é ${spelled}`,
  codeSpokenDash: ", hífen, ",
  copyCode: "Copiar o código",
  createCode: "Criar código de convite",
  expiry: {
    none: "Sem data de término",
    seven: "7 dias",
    thirty: "30 dias",
  },
  forHowLong: "Por quanto tempo",
  giveCode: (firstName) =>
    `Dê este código a ${firstName}. A pessoa cria uma conta no LifeLink, escolhe “Um familiar me convidou” e digita o código. Ele funciona uma vez, por 14 dias. Copie agora; ele só é mostrado aqui uma vez.`,
  invitationWaiting: "Convite aguardando aceitação",
  inviteFailed: (error) =>
    `Não foi possível criar o convite. ${error} Suas escolhas continuam aqui. Tente criar o código novamente.`,
  keepSharing: "Continuar compartilhando",
  loadingPermissions: "Carregando permissões",
  loadingPermissionsShort: "Carregando permissões…",
  makingCode: "Criando o código…",
  noInformationSelected:
    "Nenhuma informação foi selecionada para compartilhar.",
  noInformationShared: "Nenhuma informação compartilhada",
  notSharing: (firstName) =>
    `Você não está compartilhando informações com ${firstName}.`,
  permissionsFor: (name) => `Permissões para ${name}`,
  readCode: "Ler o código em voz alta",
  savePermissions: "Salvar permissões",
  scopes: {
    "appointments.view": {
      description: "Próximos compromissos, com horário e local.",
      label: "Compromissos",
    },
    "groceries.view": {
      description: "Suas listas de compras salvas e seus orçamentos.",
      label: "Listas de compras",
    },
    "photos.view": {
      description: "Fotos que você compartilhou nas conversas com a família.",
      label: "Fotos compartilhadas",
    },
    "reminders.view": {
      description: "Lembretes que você salvou e escolheu compartilhar.",
      label: "Lembretes",
    },
    "rides.view": {
      description:
        "O andamento de uma carona ou tarefa: pedido feito, resposta recebida, confirmado.",
      label: "Organização de caronas",
    },
    "scam_alerts.view": {
      description:
        "Um aviso quando você verifica uma mensagem que parece um golpe.",
      label: "Alertas de golpe",
    },
  },
  sharedInformation: "Informações compartilhadas",
  startSharing:
    "Para começar a compartilhar, escolha o que a pessoa pode ver e dê a ela um código de convite. Ela digita o código na própria conta do LifeLink.",
  state: {
    active: "Pode ver as informações compartilhadas",
    expired: "Compartilhamento encerrado",
    invited: "Convite ainda não usado",
    revoked: "Compartilhamento interrompido",
  },
  stopDescription: (name) =>
    `${name} deixará de ver imediatamente tudo o que você compartilhou. Você pode convidar essa pessoa novamente depois.`,
  stopFailed: (error) =>
    `Não foi possível parar de compartilhar. ${error} Tente Parar de compartilhar novamente.`,
  stopSharing: "Parar de compartilhar",
  stopSharingWith: (name) => `Parar de compartilhar com ${name}`,
  stopTitle: (name) => `Parar de compartilhar com ${name}?`,
  stopped: (name) => `Compartilhamento com ${name} interrompido.`,
  stopping: "Parando de compartilhar…",
  them: "essa pessoa",
  until: (day) => `Até ${day}`,
  updateFailed: (error) =>
    `Não foi possível atualizar o compartilhamento. ${error} Suas escolhas continuam aqui. Escolha Salvar permissões para tentar novamente.`,
  updated: "Compartilhamento atualizado. As alterações valem imediatamente.",
  viewOnly:
    "Escolha quais informações compartilhar no LifeLink. A pessoa só pode ver; não pode enviar mensagens, aprovar ações nem gastar por você.",
  whatNameCanSee: (firstName) => `O que ${firstName} pode ver`,
  whatTheyCanSee: "O que essa pessoa pode ver",
};

export { sharing };

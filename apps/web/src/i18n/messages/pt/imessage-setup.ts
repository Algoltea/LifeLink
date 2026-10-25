import type { Messages } from "../en";

const imessageSetup: Messages["imessageSetup"] = {
  agreeAndLink: "Concordar e vincular este contato",
  assignedNumber: "Número do iMessage atribuído: ",
  checkComplete: "Verificação concluída. O estado atual aparece acima.",
  checkFailed:
    "Não foi possível verificar a primeira mensagem. Tente novamente.",
  checkFirstMessage: "Verificar primeira mensagem",
  checking: "Verificando a primeira mensagem…",
  confirmDescription:
    "Confira o endereço exato e como será usado antes de continuar.",
  confirmInvitation: (contactName, handle) =>
    `Nenhuma mensagem de convite é enviada. Você verá o número atribuído para compartilhar com ${contactName}. Essa pessoa precisa enviar a primeira mensagem a esse número a partir de ${handle}. Um número de telefone e um e-mail do Apple ID são identidades diferentes, mesmo no mesmo telefone.`,
  confirmLink: "Vincular o contato já existente no Photon com o endereço ",
  confirmLookup:
    "Ao continuar, este endereço exato será consultado no Photon, nosso provedor de iMessage, e o contato existente será reutilizado. O LifeLink não cadastra novas pessoas nem ocupa novas vagas.",
  confirmNoAccount: (contactName) =>
    `${contactName} não precisa de conta no LifeLink nem de convite para o painel. Isso não dá acesso a nada da sua conta.`,
  confirmTitle: (contactName) => `Vincular iMessage para ${contactName}?`,
  confirmTo: " a ",
  copied: (contactName) =>
    `Instruções copiadas. Envie você mesmo para ${contactName}.`,
  copy: "Copiar instruções",
  copyFailed:
    "Não foi possível copiar as instruções. Selecione e copie o texto acima ou tente Copiar instruções novamente.",
  exactAddress: "Endereço exato do contato: ",
  firstMessageConfirmed:
    "A primeira mensagem foi confirmada. Agora o LifeLink pode enviar mensagens para este endereço cadastrado.",
  heading: "Configuração do iMessage",
  instructions: (contactName, assignedNumber, handle) =>
    `${contactName}: para começar a usar o iMessage com o LifeLink, você precisa primeiro enviar um iMessage (como “Olá”) para ${assignedNumber} a partir do seu endereço exato cadastrado: ${handle}. Em Mensagens, confira se a conversa começa a partir de ${handle}. Um número de telefone e um e-mail do Apple ID são identidades diferentes, mesmo no mesmo telefone. Uma mensagem de outro endereço não ativará este. Você não precisa de uma conta no LifeLink nem de convite para o painel.`,
  link: "Vincular iMessage",
  linkExplanation:
    "Vincule a pessoa já cadastrada no Photon com este endereço exato. Se ela não estiver lá, adicione-a primeiro no painel do Photon e tente novamente. O LifeLink não cria novas pessoas.",
  linkFailed:
    "Não foi possível vincular este contato. Confira se este endereço exato está cadastrado no painel do Photon e tente novamente.",
  loading: "Carregando configuração do iMessage…",
  lookingUp: "Procurando este contato existente no Photon…",
  mustSendFirst: (contactName) =>
    `${contactName} precisa enviar a primeira mensagem a partir do endereço mostrado acima. Uma mensagem sua não ativará a configuração dessa pessoa.`,
  needsAddress:
    "É necessário um endereço do iMessage. Adicione acima o número de telefone ou o e-mail do Apple ID da pessoa e salve.",
  notConfigured:
    "É preciso configurar o aplicativo. Quem administra o LifeLink precisa conectar o Photon antes de você configurar o iMessage para este contato.",
  ownerOnly:
    "Só a pessoa titular da conta pode configurar ou verificar o iMessage para seus contatos.",
  practice: (contactName) =>
    `As mensagens de prática ficam no LifeLink, então não há nada para configurar aqui. Quando você passar a usar o iMessage real, poderá vincular ${contactName} aqui.`,
  retryLink: "Tentar vincular iMessage novamente",
  row: {
    failed: "iMessage precisa de atenção",
    not_registered: "iMessage ainda não vinculado",
    registering: "Vinculando iMessage",
    waiting: "Aguardando o primeiro iMessage da pessoa",
  },
  status: {
    failed: "A configuração precisa de atenção",
    not_registered: "Não vinculado",
    ready: "Pronto para iMessage",
    registering: "Vinculando",
    waiting: "Aguardando a primeira mensagem da pessoa",
  },
};

export { imessageSetup };

import type { Messages } from "../en";

const contactForm: Messages["contactForm"] = {
  add: "Adicionar esta pessoa",
  addWay: "Adicionar outra forma de contato",
  added: (name) => `${name}: contato adicionado.`,
  anotherWay: "Outra forma",
  askingForHelp: "Pedir ajuda a essa pessoa",
  chooseDifferentPicture: "Escolher outra imagem",
  choosePicture: "Escolher uma imagem",
  detailsNotSaved: (error) =>
    `Não foi possível salvar os dados da pessoa. ${error} O que você preencheu continua aqui. Salve novamente para tentar outra vez.`,
  howToReach: "Como entrar em contato",
  language: "Idioma que o LifeLink usa com essa pessoa",
  languageHelp:
    "As palavras do próprio LifeLink para essa pessoa, como a nota que apresenta você no primeiro iMessage, usam este idioma. Suas mensagens são sempre enviadas exatamente como você as aprova.",
  languageSameAsMine: (language) => `O mesmo que o meu (${language})`,
  name: "Nome",
  notSetYet: "Ainda não definido",
  picture: "Imagem",
  pictureFailed: (error) =>
    `${error} Escolha uma imagem para tentar novamente.`,
  pictureHelp:
    "Opcional. A foto fica pequena e quadrada neste dispositivo, e os dados de localização e da câmera são removidos antes de salvar.",
  pictureNotSaved: (error) =>
    `Os dados da pessoa foram salvos, mas a imagem não. ${error} Suas escolhas continuam aqui. Salve novamente para tentar outra vez ou escolha outra imagem.`,
  pictureUnusable: "Não foi possível usar essa imagem. Tente outra foto.",
  preferredWay: "Forma de contato preferida",
  relationship: "Seu vínculo com essa pessoa",
  relationshipPlaceholder: "Filho, vizinho, amigo",
  removePicture: "Remover imagem",
  saveChanges: "Salvar alterações",
  saved: "Salvo.",
  savingPersonAndPicture: "Salvando pessoa e imagem…",
  trusted:
    "Faz parte do meu círculo de confiança. O LifeLink pode sugerir que eu peça ajuda a essa pessoa.",
  ways: {
    discord: {
      help: "O ID de usuário do Discord da pessoa, um número longo. No Discord: Configurações, Avançado, Modo desenvolvedor e depois Copiar ID do usuário.",
      label: "Discord",
      valueLabel: "ID de usuário do Discord",
    },
    email: {
      help: "O endereço de e-mail da pessoa.",
      label: "E-mail (Gmail, Outlook e outros)",
      valueLabel: "Endereço de e-mail",
    },
    imessageEmail: {
      help: "O e-mail do Apple ID que a pessoa usa no iMessage. É uma identidade diferente do número de telefone. Para enviar iMessages reais depois, salve esta pessoa e escolha Editar e Vincular iMessage.",
      label: "iMessage (e-mail do Apple ID)",
      valueLabel: "E-mail do Apple ID",
    },
    imessagePhone: {
      help: "O número do iPhone da pessoa. Para enviar iMessages reais depois, salve esta pessoa e escolha Editar e Vincular iMessage.",
      label: "iMessage (número de telefone)",
      valueLabel: "Número de telefone",
    },
    telegram: {
      help: "O nome de usuário do Telegram da pessoa, como @sam_alvarez (no Telegram: Configurações e depois Nome de usuário). Após salvar, peça à pessoa para abrir @LifeLinkMessage_Bot no Telegram e tocar em Iniciar. Sem nome de usuário? Deixe em branco e use o link do Telegram abaixo.",
      label: "Telegram",
      valueLabel: "Nome de usuário do Telegram",
    },
    whatsapp: {
      help: "Fica salvo para você. O LifeLink ainda não pode enviar mensagens pelo WhatsApp.",
      label: "WhatsApp (apenas salvo)",
      valueLabel: "Número do WhatsApp",
    },
  },
  whoTheyAre: "Quem é essa pessoa",
};

export { contactForm };

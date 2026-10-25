import type { Messages } from "../en";

const actionDetails: Messages["actionDetails"] = {
  and: " e ",
  appointment: "Compromisso",
  budget: (amount) => ` Orçamento: ${amount}.`,
  by: (channel) => `Por ${channel}`,
  calendar: "Calendário",
  confirming: "Você está confirmando",
  document: "Documento",
  draftSavedIn: (provider) =>
    `Salvo como rascunho no seu ${provider}. Só será enviado quando você enviar por lá.`,
  driveNoteHint:
    "É salvo como um novo documento no seu Google Drive. Só você pode ver, a menos que compartilhe por lá.",
  estimate: (amount) => `Sua estimativa: ${amount}.`,
  event: "Evento",
  itemCount: (name, count) =>
    `${name}: ${count} ${count === 1 ? "item" : "itens"}`,
  noEstimate: "Ainda sem estimativa.",
  noJustYou: "Não, só você",
  notGiven: "Não informado",
  notes: "Notas",
  onlyGrantees: (names, scope) =>
    `Só ${names} verá isto, porque você compartilha ${scope} com essas pessoas.`,
  peopleYouAllowed: "pessoas que você autorizou",
  readEmail: "Ler o e-mail em voz alta",
  readMessage: "Ler a mensagem em voz alta",
  readNote: "Ler a nota em voz alta",
  readUpdate: "Ler a atualização em voz alta",
  reminder: "Lembrete",
  replySentFrom: (provider) =>
    `A resposta é enviada pelo seu ${provider} na mesma conversa, somente depois da sua aprovação.`,
  sharedWithCircle: "Compartilhado com seu círculo de confiança",
  shoppingRecord:
    "Este é o registro de um pedido de compras anterior. As compras pelo LifeLink não estão mais disponíveis.",
  spoken: {
    appointment: (title: string, when: string, location: string | null) =>
      `Compromisso: ${title}. ${when}${location ? `, em ${location}` : ""}.`,
    calendar: (title, when, location) =>
      `${title}. ${when}${location ? `, em ${location}` : ""}.`,
    confirm: (summary) => `Você está confirmando: ${summary}`,
    driveNote: (title, body) =>
      `Uma nota no seu Google Drive chamada ${title}. O texto diz: ${body}`,
    email: (to, subject, body) =>
      `E-mail para ${to}. Assunto: ${subject}. O texto diz: ${body}`,
    emailAloud: (subject, body) => `Assunto: ${subject}. ${body}`,
    message: (name, channel, route, body) =>
      `Para ${name}, por ${channel}${route}. A mensagem diz: ${body}`,
    reminder: (title, when, shared) =>
      `Lembrete: ${title}. ${when}. ${shared ? "Compartilhado com seu círculo de confiança." : "Só para você."}`,
    reply: (to, subject, body) =>
      `Resposta para ${to}. Assunto: ${subject}. O texto diz: ${body}`,
    update: (text) => `A atualização diz: ${text}`,
  },
  starts: "Início",
  subject: "Assunto",
  thisScope: "estas informações",
  to: "Para",
  toAddress: (address) => ` para ${address}`,
  toName: (name) => `Para ${name}`,
  when: "Quando",
  where: "Onde",
  withPhotos: (count) => `Com ${count} ${count === 1 ? "foto" : "fotos"}.`,
  yesShared: "Sim",
};

export { actionDetails };

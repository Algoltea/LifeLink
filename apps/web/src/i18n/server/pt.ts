interface ServerCatalog {
  exact: Record<string, string>;
  patterns: [RegExp, (...parts: string[]) => string][];
}

const SCAM_SIGNS = [
  ["pressure to act fast", "pressão para agir rápido"],
  ["mentions private details", "menção a dados privados"],
  ["mentions a payment method", "menção a uma forma de pagamento"],
  ["contains a link", "presença de um link"],
  ["threats", "ameaças"],
  ["prize or windfall", "prêmio ou ganho inesperado"],
] as const;

/** Only the combinations emitted by scam.ts; arbitrary lists are not translated. */
const scamSummaries = (): ServerCatalog["exact"] => {
  const combinations: (typeof SCAM_SIGNS)[number][][] = [[]];

  for (const sign of SCAM_SIGNS) {
    // Snapshot this round because the loop appends the new combinations.
    const previousCombinations = [...combinations];

    for (const previous of previousCombinations) {
      combinations.push([...previous, sign]);
    }
  }

  const translations: Record<string, string> = {};

  for (const signs of combinations) {
    if (signs.length === 0) {
      continue;
    }

    const english = signs.map(([label]) => label).join(", ");
    const localized = signs.map(([, label]) => label).join(", ");
    translations[
      `This message shows ${signs.length} common warning ${signs.length === 1 ? "sign" : "signs"}: ${english}.`
    ] =
      `Esta mensagem apresenta ${signs.length} ${signs.length === 1 ? "sinal de alerta comum" : "sinais de alerta comuns"}: ${localized}.`;
  }

  return translations;
};

const SPEECH_ERRORS: ServerCatalog["exact"] = {
  "Audio playback stopped responding. Please try again.":
    "A reprodução de áudio parou de responder. Tente novamente.",
  "Choose between 1 and 600 characters to read.":
    "Escolha um texto de 1 a 600 caracteres para ler.",
  "Please choose a shorter section to read aloud.":
    "Escolha um trecho mais curto para ler em voz alta.",
  "Please read a shorter passage at a time.":
    "Leia um trecho mais curto de cada vez.",
  "Please sign in again to use read-aloud.":
    "Entre novamente para usar a leitura em voz alta.",
  "Read-aloud is not set up yet.":
    "A leitura em voz alta ainda não está configurada.",
  "Read-aloud is not set up yet. An OpenRouter key is needed.":
    "A leitura em voz alta ainda não está configurada. É necessária uma chave do OpenRouter.",
  "Read-aloud is unavailable. Please try again.":
    "A leitura em voz alta não está disponível. Tente novamente.",
  "Read-aloud needs a short pause. Please try again in a minute.":
    "A leitura em voz alta precisa de uma breve pausa. Tente novamente em um minuto.",
  "Read-aloud returned an unexpected audio format. Please try again later.":
    "A leitura em voz alta retornou um formato de áudio inesperado. Tente novamente mais tarde.",
  "Read-aloud returned no audio. Please try again.":
    "A leitura em voz alta não retornou áudio. Tente novamente.",
  "Read-aloud took too long. Please try again.":
    "A leitura em voz alta demorou demais. Tente novamente.",
  "That audio was too large. Please read a shorter section.":
    "O áudio era grande demais. Leia um trecho mais curto.",
  "That passage is too long to read at once. Please choose a shorter section.":
    "O trecho é longo demais para ler de uma só vez. Escolha uma parte mais curta.",
  "The audio could not be loaded. Please try again.":
    "Não foi possível carregar o áudio. Tente novamente.",
  "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.":
    "O modelo configurado para leitura em voz alta não é um modelo ElevenLabs verificado no OpenRouter.",
  "The configured read-aloud voice is not supported. Please check the speech settings.":
    "A voz configurada para leitura em voz alta não é compatível. Verifique as configurações de voz.",
  "This audio could not be played. Please try again.":
    "Não foi possível reproduzir este áudio. Tente novamente.",
  "This browser cannot play audio. You can still read the text here.":
    "Este navegador não consegue reproduzir áudio. Você ainda pode ler o texto aqui.",
  "Today’s read-aloud limit has been reached. Please try again tomorrow.":
    "O limite de leitura em voz alta de hoje foi atingido. Tente novamente amanhã.",
};

/** Brazilian Portuguese for the backend's fixed English messages, matched exactly. */
const pt: ServerCatalog = {
  exact: {
    ...scamSummaries(),
    ...SPEECH_ERRORS,
    "Action not found.": "Ação não encontrada.",
    "Added to your calendar.": "Adicionado ao seu calendário.",
    "An action cannot change into a different kind of action.":
      "Uma ação não pode se transformar em outro tipo de ação.",
    "An earlier try is still unresolved.":
      "O resultado de uma tentativa anterior ainda está indefinido.",
    "Ask for a ride": "Pedir uma carona",
    "Ask someone in your trusted circle to take a look.":
      "Peça a alguém do seu círculo de confiança para dar uma olhada.",
    "Attempt not found.": "Tentativa não encontrada.",
    "Check up to 15 emails at a time.": "Verifique até 15 e-mails por vez.",
    "Choose someone from your trusted circle who can be messaged.":
      "Escolha alguém do seu círculo de confiança que possa receber mensagens.",
    "Cloud AI is not set up. Your local overview is still available.":
      "A IA na nuvem não está configurada. Seu resumo local continua disponível.",
    "Cloud AI suggestions, with supporting quotes checked against each email. Verify details in the original message.":
      "Sugestões da IA na nuvem, com citações de apoio conferidas em cada e-mail. Verifique os detalhes na mensagem original.",
    "Confirm the ride": "Confirmar a carona",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "Conecte o Gmail ou o Outlook na tela Conexões para enviar e-mails.",
    "Contains a link": "Contém um link",
    "Discord is not set up for this app yet.":
      "O Discord ainda não está configurado para este aplicativo.",
    "Discord is not set up for this app.":
      "O Discord não está configurado para este aplicativo.",
    "Don't click links or call numbers in the message.":
      "Não abra links nem ligue para números presentes na mensagem.",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "As conexões de e-mail, calendário e Drive ainda não estão configuradas para este aplicativo.",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "Digite um valor igual ou maior que zero em centavos inteiros, ou deixe a estimativa em branco.",
    "Enter a quantity greater than 0.": "Digite uma quantidade maior que 0.",
    "Found it in your mailbox.": "Encontrado na sua caixa de e-mail.",
    "Found the event on your calendar.":
      "O evento foi encontrado no seu calendário.",
    "Found the message in the Discord conversation.":
      "A mensagem foi encontrada na conversa do Discord.",
    "Found the notes in your Google Drive.":
      "As notas foram encontradas no seu Google Drive.",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "Se a mensagem diz ser de uma empresa, ligue para o número no seu cartão, na sua fatura ou no site oficial da empresa.",
    "It is not in your mailbox, so it did not go through.":
      "Não está na sua caixa de e-mail, então o envio não foi concluído.",
    "Let family know": "Avisar a família",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "Links em mensagens inesperadas podem levar a páginas falsas de acesso. Vá diretamente ao site por conta própria.",
    "Mentions a payment method": "Menciona uma forma de pagamento",
    "Mentions private details": "Menciona dados privados",
    "New conversation": "Nova conversa",
    "No connected mailbox to send from.":
      "Não há uma caixa de e-mail conectada para enviar.",
    "No recent emails to summarize yet.":
      "Ainda não há e-mails recentes para resumir.",
    "No subject or readable message text, and no action request found. Any images or attachments have not been assessed.":
      "Não foram encontrados assunto, texto legível ou pedido de ação. Imagens ou anexos não foram avaliados.",
    "Nobody in your trusted circle can see ride plans, so no update was shared.":
      "Ninguém no seu círculo de confiança pode ver os planos de carona, então nenhuma atualização foi compartilhada.",
    "Not needed because the ride was declined.":
      "Não é necessário porque a carona foi recusada.",
    "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found.":
      "Foi encontrada apenas uma nota informal curta ou informação sobre um arquivo compartilhado, sem assunto relevante, pedido de resposta ou detalhe que exija atenção dentro de um prazo.",
    "Only something that failed can be tried again.":
      "Só é possível tentar novamente uma operação que falhou.",
    "Only the account owner can do this.":
      "Só o titular da conta pode fazer isso.",
    "Open emails in pages of 15.": "Abra os e-mails em páginas de 15.",
    "Paste the message you would like checked.":
      "Cole a mensagem que você quer verificar.",
    "Photon accepted the iMessage for delivery under the same approval.":
      "O Photon aceitou o iMessage para entrega com a mesma aprovação.",
    "Photon confirmed it accepted the earlier iMessage for delivery.":
      "O Photon confirmou que aceitou o iMessage anterior para entrega.",
    "Please answer the open question first.":
      "Responda primeiro à pergunta pendente.",
    "Please check up to 8,000 characters at a time.":
      "Verifique até 8.000 caracteres por vez.",
    "Please choose a JPG, PNG, or WebP photo under 6 MB.":
      "Escolha uma foto JPG, PNG ou WebP com menos de 6 MB.",
    "Please choose a photo under 6 MB.": "Escolha uma foto com menos de 6 MB.",
    "Please choose a time that has not passed yet.":
      "Escolha um horário que ainda não passou.",
    "Please choose one of the options shown.":
      "Escolha uma das opções mostradas.",
    "Please sign in again to continue.": "Entre novamente para continuar.",
    "Please sign in again.": "Entre novamente.",
    "Please write your reply first.": "Escreva sua resposta primeiro.",
    "Practice emails are reviewed in LifeLink and are never sent to cloud AI.":
      "Os e-mails de prática são revisados no LifeLink e nunca são enviados à IA na nuvem.",
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "O modo de prática está ativado. Desative-o e revise isto novamente para fazer de verdade.",
    "Practice: done.": "Prática: concluído.",
    "Practice: no draft was saved in your real mailbox.":
      "Prática: nenhum rascunho foi salvo na sua caixa de e-mail real.",
    "Practice: nothing was added to your real calendar.":
      "Prática: nada foi adicionado ao seu calendário real.",
    "Practice: nothing was saved in your real Google Drive.":
      "Prática: nada foi salvo no seu Google Drive real.",
    "Practice: the reply was not really sent.":
      "Prática: a resposta não foi enviada de verdade.",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "A pressão pode dificultar uma pausa para verificar. Confirme um pedido urgente com um contato que você já conhece.",
    "Pressure to act fast": "Pressão para agir rápido",
    "Prize or windfall": "Prêmio ou ganho inesperado",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "Pedidos de cartões-presente, transferências ou criptomoedas merecem uma verificação separada. Pode ser difícil recuperar esses pagamentos.",
    "Save a reminder": "Salvar um lembrete",
    "Save the reminder": "Salvar o lembrete",
    "Saved the notes in your Google Drive.":
      "As notas foram salvas no seu Google Drive.",
    "Sharing changed for someone on this update. Please review who will see it.":
      "As permissões de compartilhamento mudaram para alguém incluído nesta atualização. Revise quem poderá vê-la.",
    "Showing the overview made in LifeLink. Nothing was sent to cloud AI.":
      "Mostrando o resumo feito no LifeLink. Nada foi enviado à IA na nuvem.",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "O Spectrum não confirmou se esta mensagem foi enviada. Verifique novamente ou confirme quando ela chegar; não é seguro marcá-la como não enviada.",
    "Surprise winnings that need a fee first are almost always scams.":
      "Prêmios inesperados que exigem o pagamento de uma taxa primeiro quase sempre são golpes.",
    "Telegram allows 1024 characters with photos. Shorten the message or send the photos separately.":
      "O Telegram permite 1024 caracteres com fotos. Encurte a mensagem ou envie as fotos separadamente.",
    "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.":
      "O Telegram pediu ao LifeLink para reduzir o ritmo. Nada foi enviado; tente novamente em um minuto.",
    "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.":
      "O Telegram ainda não está configurado para este aplicativo. Peça à pessoa responsável pela configuração para executar bun run dev:setup --only=telegram.",
    "Telegram is not set up for this app.":
      "O Telegram não está configurado para este aplicativo.",
    "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.":
      "O Telegram recusou: esta pessoa bloqueou o bot ou nunca tocou em Iniciar. Peça que ela abra o link novamente.",
    "That Google Drive is no longer connected.":
      "Esse Google Drive não está mais conectado.",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "Essa conta não está mais conectada. Conecte-a novamente na tela Conexões.",
    "That calendar is no longer connected.":
      "Esse calendário não está mais conectado.",
    "That could not be found.": "Não foi possível encontrar esse item.",
    "That email could not be found.": "Não foi possível encontrar esse e-mail.",
    "That mailbox is no longer connected.":
      "Essa caixa de e-mail não está mais conectada.",
    "That person has no way to be reached yet.":
      "Ainda não há uma forma de entrar em contato com essa pessoa.",
    "That step could not be found.": "Não foi possível encontrar esse passo.",
    "That task could not be found.": "Não foi possível encontrar essa tarefa.",
    "The automatic check has not finished. Review this message before deciding.":
      "A verificação automática não terminou. Revise esta mensagem antes de decidir.",
    "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.":
      "O resumo na nuvem não foi concluído. O resumo local é mostrado; o provedor pode ter recebido estes e-mails.",
    "The cloud-reading limit has been reached. Your local overview is still available.":
      "O limite de leituras na nuvem foi atingido. Seu resumo local continua disponível.",
    "The current subject or message asks for a reply or confirmation. Check the details before responding.":
      "O assunto ou a mensagem atual pede uma resposta ou confirmação. Verifique os detalhes antes de responder.",
    "The details changed since you looked. Please review them again.":
      "Os detalhes mudaram desde que você os viu. Revise-os novamente.",
    "The event is not on your calendar.":
      "O evento não está no seu calendário.",
    "The message cannot be empty.": "A mensagem não pode estar vazia.",
    "The message contains a concrete event, account action, or timing detail worth reviewing.":
      "A mensagem contém um evento específico, uma ação relacionada a uma conta ou um detalhe de data ou horário que merece revisão.",
    "The message is not in the Discord conversation, so it did not go through.":
      "A mensagem não está na conversa do Discord, então o envio não foi concluído.",
    "The notes are not in your Google Drive.":
      "As notas não estão no seu Google Drive.",
    "The person you are writing to is no longer in your contacts.":
      "A pessoa para quem você está escrevendo não está mais nos seus contatos.",
    "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it.":
      "O endereço do remetente corresponde ao de alguém do seu Círculo de confiança e a mensagem tem informações que merecem revisão. A correspondência do endereço não confirma quem enviou a mensagem.",
    "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified.":
      "O nome ou endereço do remetente sugere uma mensagem sobre saúde, cobrança ou serviços de uma conta. Revise a mensagem; a identidade do remetente não foi verificada.",
    "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested.":
      "O remetente ou a mensagem parece ser uma promoção ou um boletim, sem ação específica ou assunto importante. Geralmente pode esperar se você não tiver interesse.",
    "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.":
      "O assunto menciona um compromisso, uma transação, um aviso sobre uma conta ou outro tema que merece revisão.",
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you.":
      "Há um assunto ou uma mensagem com conteúdo relevante, mas nenhum pedido claro de resposta. Leia para decidir se é importante para você.",
    "There is nothing to check for this one.":
      "Não há nada para verificar neste caso.",
    "These details could not be verified. Please prepare them again.":
      "Não foi possível verificar estes detalhes. Prepare-os novamente.",
    "This action is missing its details.": "Faltam os detalhes desta ação.",
    "This can no longer be changed because it has already started.":
      "Esta operação já começou e não pode mais ser alterada.",
    "This changed while you were offline. Please look it over again before approving.":
      "Isto mudou enquanto você estava sem conexão. Revise novamente antes de aprovar.",
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.":
      "Esta verificação não encontrou sinais de alerta comuns no texto disponível. Ela não pode verificar o remetente nem provar que uma mensagem é autêntica. Confira pedidos inesperados com alguém de confiança.",
    "This check for common warning signs found only advice not to share details or pay in unusual ways. That advice does not prove the message is genuine. Check unexpected requests with someone you trust.":
      "Esta verificação encontrou apenas conselhos para não compartilhar dados nem pagar de formas incomuns. Esses conselhos não provam que a mensagem é autêntica. Confira pedidos inesperados com alguém de confiança.",
    "This check has expired.": "Esta verificação expirou.",
    "This email is not from a connected mailbox.":
      "Este e-mail não é de uma caixa de e-mail conectada.",
    "This has already started, so it can no longer be cancelled.":
      "Esta operação já começou e não pode mais ser cancelada.",
    "This is already approved.": "Isto já foi aprovado.",
    "This is not waiting for approval.": "Isto não está aguardando aprovação.",
    "This mentions sensitive details. Do not share passwords, codes, or account details in response to an unexpected message.":
      "Isto menciona dados sensíveis. Não compartilhe senhas, códigos ou dados de contas em resposta a uma mensagem inesperada.",
    "This message tells you not to do this. Real companies say this, and scammers copy it too, so check any other requests in it.":
      "Esta mensagem diz para você não fazer isso. Empresas verdadeiras dizem isso, e golpistas também copiam esse aviso. Por isso, verifique os outros pedidos da mensagem.",
    "This was prepared in practice mode. Please prepare it again now that practice mode is off.":
      "Isto foi preparado no modo de prática. Prepare novamente agora que o modo de prática está desativado.",
    Threats: "Ameaças",
    "Threats of arrest or legal trouble are a common scare tactic.":
      "Ameaças de prisão ou de problemas com a Justiça são uma tática comum para assustar.",
    "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.":
      "Use um número inteiro para itens individuais ou pacotes. Escolha peso ou volume para uma quantidade medida.",
    "Wait for an answer": "Aguardar uma resposta",
    "Warning signs were found. Check the message before replying, paying, or sharing details.":
      "Foram encontrados sinais de alerta. Verifique a mensagem antes de responder, pagar ou compartilhar dados.",
    "Warns against sharing private details":
      "Alerta para não compartilhar dados privados",
    "Warns against threats": "Alerta sobre ameaças",
    "Warns against unusual payments": "Alerta sobre pagamentos incomuns",
    "We are not sure the last try failed. Check whether it went through before trying again.":
      "Não temos certeza se a última tentativa falhou. Verifique se ela foi concluída antes de tentar novamente.",
    "We are still checking this action. Wait for that check to finish.":
      "Ainda estamos verificando esta ação. Aguarde a conclusão da verificação.",
    "Which appointment is the ride for?": "Para qual compromisso é a carona?",
    "Who would you like to ask?": "A quem você gostaria de pedir?",
    "Write a few words or add a photo first.":
      "Escreva algumas palavras ou adicione uma foto primeiro.",
    "Write your reply first.": "Escreva sua resposta primeiro.",
    "You are not connected with this person.":
      "Você não está conectado a esta pessoa.",
    "You cancelled this.": "Você cancelou esta operação.",
    "You offered or asked, and the answer was yes.":
      "Você fez uma oferta ou um pedido, e a resposta foi sim.",
    "You offered or asked. The answer is not clear yet.":
      "Você fez uma oferta ou um pedido. A resposta ainda não está clara.",
    "You offered or asked. There is no answer yet.":
      "Você fez uma oferta ou um pedido. Ainda não há resposta.",
    "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.":
      "O iMessage ainda não está configurado para este aplicativo. Peça à pessoa responsável pela configuração para executar bun run dev:setup.",
    "iMessage is not set up for this app.":
      "O iMessage não está configurado para este aplicativo.",
  },
  // Match complete templates only; captured names, titles and quotes stay verbatim.
  patterns: [
    [
      /^Read-aloud is unavailable \((?<status>[1-5]\d{2})\)\. Please try again later\.$/u,
      (status) =>
        `A leitura em voz alta não está disponível (${status}). Tente novamente mais tarde.`,
    ],
    [/^Ride to (?<title>.+)$/u, (title) => `Carona para ${title}`],
    [
      /^Waiting for (?<name>[^“”"\r\n]+) to answer\.$/u,
      (name) => `Aguardando a resposta de ${name}.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) said: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name} disse: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) can't drive this time\. You could ask someone else\.$/u,
      (name) =>
        `${name} não pode dar uma carona desta vez. Você pode pedir a outra pessoa.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\.$/u,
      (name) => `Ainda não há uma forma de entrar em contato com ${name}.`,
    ],
    [
      /^Set up iMessage for (?<name>[^“”"\r\n]+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `Configure o iMessage para ${name} no Círculo de confiança e peça que essa pessoa envie a primeira mensagem para o número atribuído.`,
    ],
    [
      /^Link (?<name>[^“”"\r\n]+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `Primeiro, vincule o Telegram de ${name} no Círculo de confiança: envie o link para essa pessoa e peça que ela toque em Iniciar.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) replied, but it is not clear yet: “(?<body>[\s\S]*)”$/u,
      (name, body) =>
        `${name} respondeu, mas o sentido ainda não está claro: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\. Add one under Trusted circle\.$/u,
      (name) =>
        `Ainda não há uma forma de entrar em contato com ${name}. Adicione uma no Círculo de confiança.`,
    ],
    [
      /^Practice: the message to (?<name>[^“”"\r\n]+) was not really sent\. A practice reply will arrive shortly\.$/u,
      (name) =>
        `Prática: a mensagem para ${name} não foi enviada de verdade. Uma resposta de prática chegará em breve.`,
    ],
    [
      /^Photon accepted the iMessage to (?<name>[^“”"\r\n]+) for delivery\.$/u,
      (name) => `O Photon aceitou para entrega o iMessage destinado a ${name}.`,
    ],
    [
      /^Shared with (?<count>\d+) (?:person|people) in your trusted circle\.$/u,
      (count) =>
        `Compartilhado com ${count} ${count === "1" ? "pessoa" : "pessoas"} do seu círculo de confiança.`,
    ],
    [
      /^Reply sent to (?<to>[^“”"\r\n]+)\.$/u,
      (to) => `Resposta enviada para ${to}.`,
    ],
    [
      /^Draft saved in your (?<provider>Gmail|Outlook) Drafts folder\. It has not been sent\.$/u,
      (provider) =>
        `Rascunho salvo na pasta Rascunhos do seu ${provider}. Ele não foi enviado.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked, and the answer was yes\.$/u,
      (name) => `${name} fez uma oferta ou um pedido, e a resposta foi sim.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. There is no answer yet\.$/u,
      (name) => `${name} fez uma oferta ou um pedido. Ainda não há resposta.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. The answer is not clear yet\.$/u,
      (name) =>
        `${name} fez uma oferta ou um pedido. A resposta ainda não está clara.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) asked a question you haven't answered yet\.$/u,
      (name) => `${name} fez uma pergunta que você ainda não respondeu.`,
    ],
    [
      /^Answer (?<name>[^“”"\r\n]+)'s offer, if you'd like to accept it\.$/u,
      (name) => `Responda à oferta de ${name} se quiser aceitá-la.`,
    ],
    [
      /^In your last (?<messages>\d+) messages? with (?<name>[^“”"\r\n]+), LifeLink found (?<agreements>\d+) agreements? and (?<offers>\d+) offers? or requests? without a clear answer\.$/u,
      (messages, name, agreements, offers) =>
        `Nas suas trocas mais recentes com ${name} (${messages} ${messages === "1" ? "mensagem" : "mensagens"}), o LifeLink encontrou ${agreements} ${agreements === "1" ? "acordo" : "acordos"} e ${offers} ${offers === "1" ? "oferta ou pedido" : "ofertas ou pedidos"} sem uma resposta clara.`,
    ],
  ],
};

export { pt };

export type { ServerCatalog };

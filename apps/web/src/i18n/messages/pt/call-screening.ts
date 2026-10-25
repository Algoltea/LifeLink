import type { Messages } from "../en";

const callScreening: Messages["callScreening"] = {
  alertOff: "Som de alerta desativado",
  alertPlayed: "Alerta reproduzido em voz alta",
  alertPlaying: "Reproduzindo alerta em voz alta",
  alertReady: "Alerta pronto",
  alertUnavailable: "Não foi possível reproduzir o som. Leia o aviso na tela.",
  askTrusted: "Peça ajuda a alguém de confiança",
  bigger: "Letras maiores",
  callCaptions: "O que foi ouvido na ligação",
  callTime: "após o início da ligação",
  callback:
    "Se algo pareceu estranho, desligue e ligue para a pessoa ou empresa em um número em que você já confia.",
  callbackAdvice:
    "Se algo pareceu estranho, desligue e ligue de volta em um número de confiança.",
  caller: "Pessoa que ligou",
  cannotConfirm: "Isso não pode confirmar quem ligou.",
  captionSize: "Tamanho das legendas",
  captionSource: "Feito a partir de legendas que podem conter erros.",
  captions: "Legendas",
  captionsEmpty: "As palavras da ligação aparecerão aqui.",
  captionsNotSaved: "Mostradas até você sair desta página. Não são salvas.",
  checkMessage: "Verificar uma mensagem",
  checkingLastPart: "Verificando sinais de alerta na última parte da ligação…",
  checksUnavailable:
    "As verificações de sinais de alerta não estão disponíveis agora. As palavras da ligação continuam aparecendo abaixo.",
  clearTitle: "Nenhum sinal de alerta ouvido",
  close: "Fechar",
  codes: "pedidos de código, senha ou dados pessoais",
  connectionError:
    "A conexão de escuta parou. Suas legendas continuam aqui. Pressione Iniciar novamente para continuar ouvindo ou Finalizar para salvar um resumo.",
  consent:
    "Entendo que o som e as palavras da ligação serão enviados a serviços de IA na nuvem enquanto esta verificação estiver ativada.",
  credentialsReason:
    "Um pedido para compartilhar código de verificação ou senha.",
  delete: "Excluir resumo",
  deleteError: "Não foi possível excluir o resumo. Tente novamente.",
  deleteNotice:
    "Excluir este resumo não exclui mensagens que você preparou ou enviou.",
  deleting: "Excluindo…",
  discard: "Descartar resumo",
  earlierAria: "Verificações de ligações anteriores",
  finish: "Finalizar",
  finishSave: "Finalizar e salvar resumo",
  flagged: "O que o LifeLink sinalizou",
  flaggedAdvice:
    "Não compartilhe códigos nem envie dinheiro. Desligue e ligue de volta em um número em que você já confia.",
  flaggedBody: "A pessoa que ligou pediu coisas que golpistas costumam pedir.",
  flaggedTitle: (count) =>
    `${count} ${count === 1 ? "sinal de alerta ouvido" : "sinais de alerta ouvidos"}`,
  gettingReady: "Preparando…",
  guideCaution:
    "Pode deixar passar sinais de alerta. Se uma ligação parecer estranha, desligue e ligue de volta em um número em que você já confia.",
  guideTitle: "O LifeLink pode avisar você em voz alta sobre:",
  hangUpFirst: "Você pode dizer “Vou ligar de volta” e desligar primeiro.",
  heard: "O que o LifeLink ouviu",
  heardText: (heardWords) => {
    if (heardWords === undefined) {
      return "Nada do que o LifeLink ouviu correspondia a pedidos comuns de golpistas.";
    }

    const words =
      heardWords === 1 ? "1 palavra" : `cerca de ${heardWords} palavras`;

    return `O LifeLink ouviu ${words}. Nenhuma correspondia a pedidos comuns de golpistas.`;
  },
  help: "Acabei de receber uma ligação sobre a qual estou em dúvida. Você pode me ajudar a verificar se era verdadeira antes que eu compartilhe informações ou envie dinheiro?",
  interrupted:
    "A conexão parou durante esta verificação. Só foram verificadas as partes que o LifeLink ouviu.",
  intro:
    "O LifeLink mostra as palavras da ligação na tela, usa IA para procurar sinais de golpe e avisa você em voz alta se encontrar algum.",
  languageLimit:
    "As ligações ao vivo usam IA na nuvem. As verificações locais de texto ainda dependem de padrões em inglês; traduzir a interface não amplia os idiomas que elas conseguem analisar. O roteiro de prática e o alerta falado estão em inglês. As legendas e as palavras citadas permanecem no idioma original.",
  listenTitle: "Ouvir uma ligação",
  listening: "O LifeLink está ouvindo",
  liveCall: "Ligação ao vivo",
  messageReview: "Mensagem para revisar",
  mixedVoices: "Estas legendas misturam as duas vozes e podem conter erros.",
  money: "pedidos de dinheiro ou cartões-presente",
  moneyReason: "Um pedido para enviar dinheiro ou pagar com cartões-presente.",
  mute: "Silenciar alerta",
  noWarnings: "Nenhum sinal de alerta detectado",
  noWarningsYet: " · Nenhum sinal de alerta detectado até agora",
  notConfigured:
    "As verificações de ligações ao vivo ainda não estão configuradas. Você pode experimentar uma ligação de prática ou digitar as palavras de quem ligou.",
  notSafe:
    "Isso não significa que a ligação era segura. O LifeLink pode deixar passar sinais de alerta e não pode verificar quem ligou.",
  openStep: "Mantenha esta tela aberta enquanto conversa.",
  otherDevice:
    "Se seu telefone não puder usar o microfone durante uma ligação, abra o LifeLink em outro dispositivo.",
  outcomeLabels: {
    clear: "Nenhum sinal de alerta detectado",
    flagged: "Sinais de alerta detectados",
    silent: "Nada foi ouvido",
    unchecked: "Verificação incompleta",
  },
  partlyChecked:
    "Parte desta ligação não pôde ser verificada, então pode haver mais sinais de alerta.",
  paused:
    "A escuta pausa enquanto o alerta toca para não ouvir o próprio aviso.",
  permissionDenied:
    "O acesso ao microfone não foi permitido. Permita nas configurações do site no navegador e tente novamente. Você também pode experimentar uma ligação de prática.",
  phoneCall: "Ligação telefônica",
  potentialScam: "Possível golpe.",
  practice: "Prática",
  practiceCall: "Ligação de prática",
  practiceCaptionSource:
    "Estas são as palavras do roteiro da ligação de prática.",
  practiceCaptions: "O que está sendo dito",
  practiceExplanation:
    "Esta é uma ligação inventada. Não usa microfone nem IA na nuvem.",
  practiceFlaggedBody:
    "Na ligação de prática, foram pedidas coisas que golpistas costumam pedir.",
  practiceHeard: "O que foi dito na ligação de prática",
  practiceHelp:
    "Experimentei a ligação de golpe simulada do LifeLink. Podemos conversar sobre o que fazer se eu receber uma ligação assim?",
  practiceMode:
    "O modo de prática está ativado. Experimente a ligação inventada abaixo, sem microfone.",
  practicePlaying: "Reproduzindo ligação de prática",
  practicePrivacy:
    "Não usa microfone nem IA na nuvem. Um resumo curto é salvo em Verificações anteriores.",
  practiceSaved:
    "A ligação de prática não usa microfone nem IA na nuvem. Seu resumo curto é salvo em Verificações anteriores.",
  practiceSilentBody:
    "A ligação de prática terminou antes de reproduzir palavras, então não havia nada para verificar.",
  practiceSilentTitle: "Prática encerrada antes da hora",
  practiceSource: "Feito a partir do roteiro de prática.",
  practiceSummary: "Resumo da ligação de prática",
  practiceTime: "após o início",
  practiceVoices:
    "As vozes de prática são identificadas. As legendas de ligações reais misturam as duas vozes e não as identificam.",
  privacy:
    "O LifeLink não grava ligações. O som do seu microfone vai para o Gemini do Google para criar as legendas, e as legendas vão para um modelo de IA que procura sinais de alerta. Quando você para, o LifeLink salva um resumo curto dos sinais de alerta, não as legendas.",
  protect:
    "Não compartilhe códigos, senhas nem dinheiro. Peça ajuda a alguém de confiança.",
  quoteNotice: "As citações podem conter erros. Números longos ficam ocultos.",
  readResult: "Ler o resultado em voz alta",
  remote: "pedidos para controlar seu computador ou telefone",
  remoteReason: "Um pedido para permitir acesso remoto a um dispositivo.",
  retrySave: "Tentar salvar novamente",
  retrySteps: [
    "Coloque a ligação no viva-voz.",
    "Mantenha o telefone perto deste dispositivo.",
    "Inicie a verificação de chamada novamente antes de responder.",
  ],
  retryTitle: "Para tentar novamente",
  review: "Revisar",
  saveError:
    "Não foi possível salvar o resumo. Mantenha esta página aberta e tente novamente.",
  saving: "Salvando seu resumo…",
  scamWarning: "Isso parece um golpe.",
  screenAnotherCall: "Verificar outra ligação",
  secrecyReason:
    "Um pedido de segredo junto com pressão para agir com urgência.",
  silentBody:
    "Nenhuma fala chegou ao LifeLink, por isso ele não pôde verificar sinais de alerta nesta ligação.",
  silentTitle: "O LifeLink não ouviu a ligação",
  smaller: "Letras menores",
  soundUnavailable:
    "O som não está disponível. Os sinais de alerta continuarão aparecendo na tela.",
  speakerStep: "Coloque a ligação no viva-voz perto deste dispositivo.",
  start: "Começar a ouvir",
  startAgain: "Iniciar novamente",
  startError:
    "O LifeLink não conseguiu começar a ouvir. Tente novamente ou experimente uma ligação de prática.",
  startStep: "Pressione Começar a ouvir e permita o microfone.",
  stop: "Parar",
  stopListening: "Parar de ouvir",
  stopPractice: "Parar ligação de prática",
  stopped: "A escuta foi encerrada",
  summary: "Resumo da ligação",
  summaryNoWarnings: "Nenhum sinal de alerta foi detectado.",
  summarySaved:
    "Salvo em Verificações anteriores como um resumo curto. Áudio e legendas não são guardados.",
  summaryStorage:
    "Só um resumo curto é salvo em Verificações anteriores. Áudio e legendas não são guardados.",
  summaryWarnings: "Esta ligação apresentou sinais de alerta.",
  tellTrusted: "Conte a alguém de confiança",
  timeLimit:
    "A verificação parou após 30 minutos. Aqui está o resumo até esse momento.",
  times:
    "Os tempos indicam minutos e segundos desde o início da verificação. Números longos ficam ocultos.",
  tryPractice: "Experimentar uma ligação de prática",
  uncheckedBody:
    "Parte do que foi dito não pôde ser verificada, então este resumo pode deixar passar sinais de alerta.",
  uncheckedTitle: "O LifeLink não conseguiu verificar toda a ligação",
  unmute: "Ativar som do alerta",
  urgency: "ameaças ou pressão para agir depressa e guardar segredo",
  warningReasons: {
    codes_or_passwords:
      "Um pedido para compartilhar código de verificação ou senha.",
    gift_cards:
      "Um pedido para pagar com cartões-presente ou compartilhar seus códigos.",
    money: "Um pedido para enviar dinheiro ou mover suas economias.",
    personal_details: "Um pedido de dados pessoais ou bancários.",
    remote_access: "Um pedido para permitir acesso remoto a um dispositivo.",
    secrecy_or_pressure:
      "Um pedido de segredo ou pressão para agir imediatamente.",
    threats: "Uma ameaça de prisão, multas ou encerramento de conta.",
  },
  warningSign: "Sinal de alerta",
  warnings: "Sinais de alerta detectados",
  you: "Você",
};

export { callScreening };

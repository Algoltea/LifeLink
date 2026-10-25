import type { Messages } from "../en";

const voice: Messages["voice"] = {
  captions: "Legendas",
  connectionProblem: "Houve um problema na conexão de voz.",
  dictationStopped: "O ditado por voz parou. Tente novamente ou digite.",
  emptyRequest: "Nada foi preparado porque o pedido estava vazio.",
  inputLabel: "Com o que você gostaria de ajuda?",
  lifeLinkSaid: "O LifeLink disse: ",
  listening:
    "Ouvindo. Suas palavras aparecerão no campo; pressione Enviar quando estiverem corretas.",
  microphoneBusy:
    "Outro aplicativo está usando o microfone. Feche-o e tente novamente ou digite.",
  microphoneDenied:
    "O LifeLink não tem permissão para usar o microfone. Permita nas configurações do navegador para este site ou digite.",
  microphoneFailed: "O microfone não iniciou. Tente novamente ou digite.",
  microphoneMissing:
    "Nenhum microfone foi encontrado. Confira se há um conectado ou digite.",
  network:
    "O ditado por voz precisa de conexão com a internet agora. Por favor, digite.",
  noSpeech:
    "Não ouvi nada. Pressione Falar e tente novamente um pouco mais perto do microfone.",
  offlineFailed:
    "Não foi possível salvar este pedido sem conexão. Suas palavras continuam aqui. Tente novamente quando a conexão voltar.",
  opening: "Abrindo um espaço para sua mensagem",
  placeholder: "Pergunte ao LifeLink…",
  prepareFailed:
    "Não foi possível preparar. Peça à pessoa para tentar novamente ou digitar.",
  prepared:
    "Está preparado e aparece na tela agora. Nada acontece até ser aprovado ali.",
  readAloudUnavailable:
    "A leitura em voz alta não está disponível. Tente novamente.",
  retry:
    "Suas palavras continuam no campo. Pressione Enviar para tentar novamente.",
  savedOffline:
    "Salvo. O LifeLink analisará o pedido quando sua conexão voltar.",
  screeningConnectionProblem:
    "Houve um problema na conexão da verificação de chamada.",
  screeningDisconnected: "A verificação de chamada foi desconectada.",
  screeningLost: "A verificação de chamada perdeu a conexão.",
  screeningMicrophoneStopped:
    "O microfone parou. Inicie a verificação de chamada novamente para reconectar.",
  screeningResumeFailed:
    "Não foi possível retomar a verificação de chamada após o aviso. Inicie novamente.",
  screeningStopped: "A verificação de chamada foi interrompida.",
  send: "Enviar",
  sending: "Enviando",
  serviceDenied:
    "O ditado por voz está desativado neste navegador. Por favor, digite.",
  speak: "Falar",
  speakHint:
    "Pressione Falar para falar em vez de digitar. Nada é enviado até você aprovar.",
  speaking: "O LifeLink está falando…",
  startFailed: (error) => `A voz não iniciou: ${error} Você pode digitar.`,
  stop: "Parar",
  talking:
    "Você está conversando com o LifeLink. Tudo o que ele preparar aparecerá na tela para você aprovar.",
  unavailable:
    "A voz não está disponível neste navegador, então digite. Nada é enviado até você aprovar.",
  voiceStopped: "A voz foi interrompida.",
  youSaid: "Você disse: ",
};

export { voice };

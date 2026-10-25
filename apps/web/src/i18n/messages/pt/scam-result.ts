import type { Messages } from "../en";

const scamResult: Messages["scamResult"] = {
  aboutCheck: "Sobre esta verificação",
  adviceNote:
    "Este conselho veio da mensagem, por isso não é contado como sinal de alerta",
  adviceTitle: "Conselhos na própria mensagem",
  allWords: "Todas as palavras que o LifeLink leu",
  cannotProve:
    "Este resultado não pode provar que uma mensagem é verdadeira. Confirme pedidos inesperados por um contato que você já conhece.",
  checkDidNotFinish: "A verificação não foi concluída",
  checkingMessage: "Verificando sua mensagem…",
  compareWithPhoto: "Compare com sua foto",
  confidence: {
    high: "Vários detalhes apoiam esta avaliação. Mesmo assim, ela não pode verificar o remetente.",
    low: "Não há informações suficientes para ter certeza. Uma segunda opinião pode ajudar.",
    medium:
      "Alguns detalhes apoiam esta avaliação. Verifique o pedido por outro meio.",
  },
  couldNotRead: "O LifeLink não conseguiu ler esta foto com clareza",
  delete: "Excluir esta verificação",
  deleteConfirm:
    "Excluir esta verificação? Ela será removida das Verificações anteriores.",
  deleting: "Excluindo…",
  howChecked: "Como foi feita a verificação",
  imageUnverified:
    "Estas palavras foram lidas de uma foto e podem estar erradas ou incompletas. O LifeLink não conseguiu compará-las com o texto original. Confira na sua foto.",
  keep: "Manter esta verificação",
  kinds: {
    email: "Um e-mail",
    screenshot: "Uma foto ou captura de tela",
    text: "Uma mensagem",
  },
  localLanguageNotice:
    "Esta verificação local foi feita apenas para o inglês. Pode não reconhecer golpes em espanhol e em outros idiomas. A ausência de sinais de alerta não significa que uma mensagem seja segura.",
  method: {
    cloud:
      "Um serviço de IA na nuvem ajudou nesta verificação, com sua permissão.",
    cloudOld:
      "Um serviço de IA na nuvem ajudou nesta verificação anterior. Os detalhes da permissão não foram salvos neste registro.",
    rules:
      "O LifeLink usou regras para sinais de alerta comuns. A mensagem não foi enviada a um serviço de IA na nuvem para esta verificação.",
    rulesFallback:
      "O LifeLink usou regras para sinais de alerta comuns porque a IA na nuvem não estava disponível ou não terminou. O serviço pode já ter recebido este conteúdo.",
    rulesOld:
      "O LifeLink usou regras para sinais de alerta comuns. Este registro antigo não informa se um serviço de IA na nuvem também recebeu a mensagem.",
  },
  newPhoto: "Tirar uma nova foto",
  noFullWording:
    "O texto completo não foi salvo com esta verificação. As citações acima não são uma transcrição completa. Compare com sua foto ou digite as palavras para outra verificação.",
  noSigns:
    "Nenhum sinal de alerta claro foi encontrado. Isso não prova que a mensagem seja verdadeira.",
  noStepsHint:
    "Antes de atender a um pedido inesperado, confira com alguém que você conhece usando os dados de contato salvos.",
  originalEmail: "E-mail original",
  originalMessage: "Mensagem original",
  photo: {
    alt: "A foto usada nesta verificação",
    larger: "Ampliar a foto",
    noPreview: "A prévia da foto não está disponível para esta verificação. ",
    readSaved: "Você ainda pode ler o resultado salvo.",
    reopen: "Tente abrir a verificação novamente.",
    see: "Ver a foto",
    smaller: "Diminuir a foto",
    smallerAria: "Diminuir o tamanho da foto",
  },
  photoRetention: {
    old: "Esta verificação antiga não tem uma prévia de foto salva. Excluir a verificação remove o resultado; a foto antiga pode permanecer armazenada.",
    owned:
      "Sua foto fica guardada com esta verificação. Excluir a verificação também exclui a foto, a menos que ela ainda seja usada por outra verificação ou foto salva.",
  },
  readAloud: "Ler o resultado em voz alta",
  readingPhoto: "Lendo as palavras na sua foto…",
  recoveryMessage:
    "Tenha cuidado com a mensagem. Você pode fazer outra verificação ou pedir ajuda a alguém de confiança.",
  recoveryPhoto:
    "Tente uma foto mais nítida, com boa luz e todas as palavras visíveis, ou digite o texto. Esta verificação não pode dizer se a mensagem é verdadeira.",
  removedQuotes:
    "Algumas palavras apontadas pelo assistente não foram encontradas na mensagem e por isso não são mostradas.",
  savedWording: "O texto salvo com esta verificação",
  signCount: (count) =>
    `${count} ${count === 1 ? "sinal de alerta" : "sinais de alerta"}`,
  signsNoteMessage: "O que chamou atenção nesta mensagem",
  signsNotePhoto: "Com as palavras que o LifeLink leu na sua foto",
  step: "Passo",
  titles: {
    email: "A verificação do seu e-mail",
    screenshot: "A verificação da sua foto",
    text: "A verificação da sua mensagem",
  },
  typeWords: "Digitar as palavras",
  verdicts: {
    likely_safe: "Nenhum sinal de alerta claro",
    likely_scam: "Provavelmente é um golpe",
    suspicious: "Sinais de alerta encontrados",
    unsure: "Não verificado",
  },
  waitHint:
    "Geralmente leva poucos segundos. Mantenha esta página aberta. Até lá, não use links nem números de telefone da mensagem e não pague ninguém.",
  whatNow: "O que fazer agora",
};

export { scamResult };

import type { Messages } from "../en";

const landing: Messages["landing"] = {
  everydayHelp: {
    displaySettings: [
      { label: "Tamanho do texto", value: "Maior" },
      { label: "Ler respostas em voz alta", value: "Sim · mais devagar" },
      { label: "Menos movimento", value: "Sim" },
      { label: "Contraste", value: "Mais forte" },
      { label: "Legendas nas chamadas", value: "Sim" },
    ],
    intro:
      "Mensagens para a família, consultas e lembretes, com letra grande e leitura em voz alta em tudo. O que for ser enviado continua esperando por você.",
    messages: {
      description:
        "Escreva para a família por iMessage, e-mail, Discord ou Telegram. “Ajude-me a entender” explica uma mensagem recebida e sugere respostas para você escolher.",
      imageAlt:
        "Mary Cassatt, A carta: uma mulher de vestido azul estampado fecha uma carta em sua escrivaninha.",
      imageCaption: "Mary Cassatt, A carta, 1890–91.",
      title: "Mensagens para a família",
    },
    read: {
      description:
        "Letra maior, contraste mais forte, legendas e uma voz de leitura mais lenta. Fale em vez de digitar quando quiser. Suas configurações valem em todas as telas.",
      imageAlt:
        "Édouard Manet, Mulher lendo: uma mulher de casaco e chapéu escuros lê uma revista ilustrada ao ar livre.",
      imageCaption: "Édouard Manet, Mulher lendo, 1880–82.",
      title: "Leia, ouça ou fale",
    },
    reminder: {
      approve: "Aprovar lembrete",
      changeTime: "Mudar horário",
      title: "Novo lembrete",
      version: "Versão 1",
      what: "Ligar para a Ana",
      when: "Domingo, 1º de novembro · 11:00",
      youSaid: "Você disse: “Lembre-me de ligar para a Ana no domingo.”",
    },
    reminders: {
      description:
        "Hoje começa pelo que precisa de você primeiro, depois consultas e lembretes. Diga o que lembrar e o LifeLink anota para você aprovar.",
      title: "Consultas e lembretes",
    },
    tab: "Ajuda no dia a dia",
    thread: {
      helpMeUnderstand: "Ajude-me a entender",
      reply: "Claro! Às 9:45 na sua casa? Talvez eu leve o Max.",
      sent: "Enviado às 9:05 · versão 2",
      sentMessage:
        "Oi, Sam, você pode me levar ao Dr. Patel na terça, 27 de outubro?",
    },
    title: "No que o LifeLink ajuda",
    today: {
      comingUp: "Próximos",
      confirmPickup: "Confirmar que Sam busca você às 9:45",
      greeting: "Boa tarde, Ruth",
      review: "Revisar",
      rows: [
        {
          detail: "Lembrete · hoje",
          time: "20:00",
          title: "Remédios da noite",
        },
        {
          detail: "Ainda não confirmado",
          time: "9:45",
          title: "Sam vem buscar você",
        },
        { detail: "Terça, 27 out.", time: "10:30", title: "Dr. Patel" },
      ],
      waiting: "Esperando por você",
    },
  },
  features: {
    hint: "Exemplo. Role ou aponte para uma linha para ver aqui essa parte do LifeLink.",
    items: {
      circle: {
        name: "Círculo de confiança",
        summary:
          "Convide alguém com um código, escolha o que a pessoa pode ver e por quanto tempo, e pare de compartilhar quando quiser.",
      },
      connections: {
        name: "Conexões",
        summary:
          "Cada conta diz com clareza o que funciona, o que ainda não está pronto e o que ela não oferece.",
      },
      documents: {
        name: "Documentos",
        summary: "Seus arquivos do Google Drive, cada um com uma prévia.",
      },
      email: {
        name: "E-mail",
        summary:
          "Marca e-mails que parecem golpes e escreve rascunhos de resposta que nunca são enviados sozinhos.",
      },
      family: {
        name: "Visão da família",
        summary:
          "A página que sua família vê: só o que você compartilha, com fotos e um espaço para responder.",
      },
      groceries: {
        name: "Compras",
        summary:
          "Listas com orçamento e estimativa de preços, prontas para copiar ou imprimir para o mercado.",
      },
      help: {
        name: "Como prefiro ajuda",
        summary:
          "Respostas curtas ou detalhadas, um passo de cada vez, no idioma que você escolher.",
      },
      recap: {
        name: "Resumo de uma conversa",
        summary:
          "Separa o que foi combinado do que foi só oferecido e sugere os próximos passos.",
      },
      today: {
        name: "Hoje",
        summary:
          "O que precisa de você primeiro, depois consultas, o tempo e três manchetes escolhidas por você.",
      },
    },
    titleLine1: "Tudo o mais",
    titleLine2: "que ele faz",
  },
  footer: {
    credits: {
      afterLicense:
        ", Wikimedia Commons. Os exemplos de tela usam dados de exemplo.",
      byAuthor: "de RedKnight7,",
      morse:
        ". Manipulador e registrador Morse, 1876: domínio público, Wikimedia Commons.",
      paintings:
        "Mary Cassatt, A carta; Édouard Manet, Mulher lendo; Claude Monet, Passeio no penhasco em Pourville e Lago das ninfeias; Jean-Jacques de Boissieu, Velho com um menino lendo: domínio público (CC0),",
      telegram: "Telegrama da Western Union de 1959",
    },
    getStarted: "Começar",
    label: "Rodapé",
    links: {
      everydayHelp: "Ajuda no dia a dia",
      howItWorks: "Como funciona",
      language: "Idioma",
      ourPromise: "Nossa promessa",
      questions: "Perguntas",
      scamCheck: "Verificar golpes",
    },
    pictures: "Imagens",
    signIn: "Entrar",
    solitaire: "Paciência",
    tagline:
      "Ajuda com as mensagens do dia a dia. Nada é enviado até você dizer.",
  },
  hero: {
    getStarted: "Começar",
    imageAlt:
      "Claude Monet, Passeio no penhasco em Pourville: duas figuras num penhasco florido acima de um mar luminoso com veleiros.",
    imageCaption: "Claude Monet, Passeio no penhasco em Pourville, 1882.",
    intro:
      "O LifeLink ajuda você a escrever para a família, acompanhar suas consultas e verificar mensagens ou cartas que parecem suspeitas. Você lê cada mensagem inteira antes de aprovar.",
    seeHowItWorks: "Ver como funciona",
    titleLine1: "Nada é enviado",
    titleLine2: "até você dizer.",
  },
  howItWorks: {
    done: "Pronto",
    exampleTimes: "Horários de exemplo",
    imageAlt:
      "Gravura de um manipulador, um relé e um registrador Morse, com as legendas Indicador, Relé, Manipulador e Bateria de linha.",
    imageCaption:
      "Manipulador e registrador Morse, gravura para a Popular Science Monthly, 1876.",
    intro:
      "Aqui está um pedido de carona do começo ao fim. Cada passo tem um nome simples, para você sempre saber o que já aconteceu e o que não.",
    result: "Você aprovou duas vezes. Nada mais foi enviado.",
    slipTitle: "Uma carona até o Dr. Patel",
    timeline: [
      {
        heading: "Segunda de manhã",
        steps: [
          { label: "Você pede uma carona", time: "9:02" },
          { label: "O LifeLink escreve a mensagem", time: "9:02" },
          {
            decision: true,
            label: "Você muda uma palavra e aprova a versão 2",
            time: "9:05",
          },
          { label: "Enviado ao Sam por iMessage", time: "9:05" },
        ],
      },
      {
        heading: "Segunda à tarde",
        steps: [
          { label: "Sam responde: “Claro, 9:45?”", time: "13:40" },
          {
            decision: true,
            label: "Você confirma o horário",
            time: "13:52",
          },
        ],
      },
      {
        heading: "Terça, 27 de outubro",
        steps: [
          { label: "Lembrete: Sam chega às 9:45", time: "9:15" },
          { label: "Consulta com o Dr. Patel", time: "10:30" },
        ],
      },
    ],
    titleLine1: "O que acontece",
    titleLine2: "depois que você pede",
  },
  language: {
    intro:
      "Escolha o idioma desta página. Se você criar uma conta, o LifeLink mantém essa escolha. Se você já tem uma conta, ao entrar será usado o idioma escolhido nela.",
    title: "Idioma",
  },
  messageSlip: {
    approve: "Aprovar e enviar",
    message:
      "Oi, Sam, você pode me levar ao Dr. Patel na terça, 27 de outubro? Preciso estar lá às 10:30. Obrigada! Ruth",
    notSent: "Ainda não enviado",
    sent: "Enviado às 9:05. Nada mais foi enviado.",
    showAgain: "Mostrar de novo",
    to: "Para Sam Rivera · iMessage",
    version: "Versão 2",
  },
  nav: {
    howItWorks: "Como funciona",
    language: "Idioma",
    questions: "Perguntas",
    scamCheck: "Verificar golpes",
    signIn: "Entrar",
  },
  previews: {
    approveAndSend: "Aprovar e enviar",
    circle: {
      appointments: "Consultas",
      code: "Código de convite de uso único",
      notShared: "Não compartilhado",
      note: "Até 31 de dezembro",
      rides: "Caronas",
      scamAlerts: "Alertas de golpe",
      shared: "Compartilhado",
      stop: "Parar de compartilhar agora",
      title: "Compartilhado com Sam Rivera",
    },
    connections: {
      add: "Adicionar uma consulta aprovada",
      footnote: "Cada conexão mostra só o que ela realmente consegue fazer.",
      notReady: "Ainda não está pronto",
      note: "Conectado",
      see: "Ver seus próximos eventos",
      works: "Funciona",
    },
    documents: {
      files: [
        { date: "12 out.", name: "Resumo do Medicare.pdf" },
        { date: "30 set.", name: "Receita de sopa da Ana" },
        { date: "14 set.", name: "Fotos do jardim" },
      ],
      footnote:
        "Escolha um arquivo para ver a prévia. Altere ou compartilhe no Google Drive.",
      title: "Documentos",
    },
    email: {
      anaSubject: "Almoço no domingo? Traga o álbum de fotos!",
      draftBody:
        "Domingo está ótimo. Vou levar o álbum. Pode ser às 12:30? Beijos, Ruth",
      draftTitle: "Resposta para Ana · rascunho, não enviado",
      note: "3 novos",
      parcelSender: "Serviço de Entrega de Encomendas",
      parcelSubject: "Ação necessária: sua encomenda está retida",
      scamWarning: "Parece golpe: pede um pagamento por meio de um link.",
      title: "E-mail",
    },
    family: {
      footnote:
        "Sam pode ler e responder. Sam não pode enviar, aprovar nem gastar pela Ruth.",
      nextAppointment: "Próxima consulta",
      note: "O que Sam vê",
      photos: "2 fotos novas do jardim",
      replyLabel: "Responder à Ruth",
      replyText: "Até terça às 9:45!",
      title: "Novidades da Ruth",
      when: "Dr. Patel, terça às 10:30",
    },
    groceries: {
      copy: "Copiar lista",
      items: [
        { label: "Leite de aveia, 2", value: "$7.98" },
        { label: "Pão integral", value: "$4.49" },
        { label: "Maçãs, 6", value: "$5.20" },
        { label: "Ingredientes da sopa para a visita da Ana", value: "$18.40" },
      ],
      note: "$62 de um orçamento de $80",
      print: "Imprimir",
      title: "Compras da semana",
    },
    help: {
      answers: "Respostas",
      language: "Idioma da ajuda",
      noteLabel: "Nota particular",
      noteText: "Não escuto bem ao telefone. Sugira mandar mensagem primeiro.",
      on: "Sim",
      oneStep: "Um passo de cada vez",
      short: "Curtas",
      title: "Como prefiro ajuda",
    },
    recap: {
      agreed: "Combinado",
      agreedText: "Sam leva você na terça e busca às 9:45.",
      nextStep: "Próximo passo sugerido",
      nextStepText: "Me lembre na segunda à noite.",
      offered: "Só oferecido",
      offeredText: "Sam talvez leve o Max.",
      review: "Revisar lembrete",
      title: "Resumo",
    },
    today: {
      goodNews: "Boas notícias, escolhidas por você",
      headlines: [
        "Biblioteca amplia horário aos domingos",
        "Voluntários restauram o roseiral da cidade",
        "Balsa volta a funcionar no verão",
      ],
      note: "Segunda-feira",
      pickup: "Confirmar que Sam busca você às 9:45",
      title: "Bom dia, Ruth",
      waiting: "Esperando por você",
      weather: "Tempo",
      weatherValue: "58 °F, chuva fraca",
    },
  },
  promise: {
    howSharingWorks: "Como funciona o compartilhamento",
    leftImageAlt:
      "Água-forte de um senhor lendo um livro com um menino no colo, ao lado de uma mesinha.",
    leftImageCaption:
      "Jean-Jacques de Boissieu, Velho com um menino lendo, 1770.",
    promises: [
      "Nunca enviaremos nada que você não tenha lido e aprovado. Se uma mensagem mudar depois da sua aprovação, perguntamos de novo.",
      "Sua família pode estar por perto sem assumir o controle. Você escolhe o que uma pessoa de confiança pode ver, como consultas ou caronas, e por quanto tempo. Ela nunca pode enviar, aprovar ou gastar por você.",
      "Quando algo é só prática, nós avisamos. Quando algo dá errado, contamos o que aconteceu, que nada foi perdido e o que fazer em seguida.",
      "E nunca diremos que uma mensagem é segura. Mostramos os sinais de alerta e deixamos a decisão com você.",
    ],
    rightImageAlt:
      "Um telegrama da Western Union de 1959, datilografado em maiúsculas e carimbado com anotações à mão.",
    rightImageCaption:
      "Um telegrama da Western Union, 1959. Cada palavra contava, e alguém assinava ao receber.",
    sharing:
      "Altere ou pare de compartilhar quando quiser, no seu Círculo de confiança.",
    signature: "Ajuda no dia a dia. Decisão sua.",
    tab: "Nossa promessa",
    title: "O que o LifeLink nunca fará",
  },
  questions: {
    imageAlt:
      "Claude Monet, Lago das ninfeias: uma ponte verde se curva sobre um lago coberto de ninfeias.",
    imageCaption: "Claude Monet, Lago das ninfeias, 1900.",
    intro: "Respostas às perguntas mais comuns, todas nesta página.",
    items: [
      {
        answer:
          "Família, e-mails e uma consulta de exemplo, para você experimentar tudo. Nada real é enviado, e cada resultado vem marcado como Prática.",
        question: "O que é o modo Prática?",
      },
      {
        answer:
          "Sim. Diga o que precisa, e o LifeLink pode ler as respostas em voz alta na velocidade que você escolher.",
        question: "Posso falar em vez de digitar?",
      },
      {
        answer:
          "Não. Eles veem só o que você compartilha e nunca podem enviar, aprovar ou gastar por você.",
        question: "Minha família pode agir por mim?",
      },
      {
        answer:
          "Gmail, Outlook e Google Agenda, além de iMessage, Discord e Telegram. Cada um mostra com clareza o que funciona e o que ainda não.",
        question: "Quais contas posso conectar?",
      },
      {
        answer:
          "Não. Ele guarda suas listas, estima custos e um orçamento, e deixa você copiar ou imprimir a lista para fazer as compras.",
        question: "O LifeLink faz pedidos de mercado?",
      },
      {
        answer:
          "Ela vira uma nova versão, e o LifeLink pede que você a aprove antes de enviar qualquer coisa.",
        question: "E se eu mudar uma mensagem?",
      },
      {
        answer:
          "Não. Enviado, respondido e confirmado são etapas diferentes, e o LifeLink diz em palavras em qual você está.",
        question: "“Enviado” é o mesmo que “combinado”?",
      },
      {
        answer:
          "Ele aponta os sinais de alerta e um próximo passo mais seguro. Nunca promete que uma mensagem é segura.",
        question: "Ele pode dizer que uma mensagem é segura?",
      },
      {
        answer:
          "A paciência funciona, e seu jogo fica salvo neste aparelho. As mensagens precisam de conexão.",
        question: "Funciona sem internet?",
      },
      {
        answer:
          "Você verá o que aconteceu, que nada foi perdido e o que fazer em seguida.",
        question: "E se algo der errado?",
      },
    ],
    tab: "Perguntas",
    title: "Perguntas",
  },
  scamCheck: {
    beCareful: "Cuidado com esta mensagem.",
    checkMessage: "Verificar uma mensagem",
    example: "Exemplo",
    examples: {
      call: {
        label: "Uma ligação",
        nextStep:
          "Desligue e ligue para seu neto no número que você já tem dele.",
        received:
          "Alguém liga dizendo que seu neto está em apuros e precisa que mandem dinheiro hoje.",
        signs: [
          "Pede dinheiro com urgência.",
          "Pede que você mantenha a ligação em segredo.",
          "Quer pagamento com cartão-presente ou transferência.",
        ],
      },
      email: {
        label: "Um e-mail",
        nextStep:
          "Ligue para o seu banco no número impresso no cartão. Não responda a este e-mail.",
        received:
          "Sua conta bancária está bloqueada. Confirme seus dados hoje para evitar o encerramento.",
        signs: [
          "Ameaça encerrar sua conta.",
          "Pede que você confirme dados pessoais.",
          "O endereço do remetente não é o do seu banco.",
        ],
      },
      letter: {
        label: "Uma carta",
        nextStep:
          "Pesquise por conta própria a empresa do prêmio antes de pagar ou enviar qualquer coisa.",
        received:
          "Você ganhou $5,000. Envie uma taxa de $40 para receber seu prêmio.",
        signs: [
          "É preciso pagar antes de receber algo.",
          "Você não participou de nenhum sorteio.",
          "Não há como verificar quem enviou.",
        ],
      },
      text: {
        label: "Um SMS",
        nextStep:
          "Abra por conta própria o aplicativo ou o site da transportadora. Não use este link.",
        received:
          "Sua encomenda está aguardando. Pague $1.99 de taxa de reentrega em 30 minutos: parcel-redeliver.co/pay",
        signs: [
          "Apressa você: pague em 30 minutos.",
          "Pede um pagamento por meio de um link.",
          "O link não é o site de uma transportadora.",
        ],
      },
    },
    intro:
      "Cole um SMS, escolha um e-mail, fotografe uma carta ou verifique uma ligação no viva-voz. O LifeLink aponta os sinais de alerta e sugere um próximo passo seguro. Ele nunca diz que uma mensagem é segura.",
    kinds: "Tipos de mensagem para verificar",
    panelTitle: "Verificar golpes",
    saferStep: "Um próximo passo mais seguro",
    tab: "Verificar golpes",
    title: "Não tem certeza se uma mensagem é real?",
    whatItLooksFor: "O que ele procura",
  },
  solitaire: {
    boardDescription:
      "Uma partida de paciência Klondike em andamento. O oito de espadas vai para cima do nove de copas.",
    controls: ["Desfazer", "Dica", "Novo jogo"],
    intro:
      "Klondike com cartas grandes e nítidas. Toque numa carta para movê-la ou jogue pelo teclado. Desfazer e uma dica estão sempre a um toque, e seu jogo fica salvo neste aparelho, mesmo sem internet.",
    noAccount: "Não precisa de conta.",
    play: "Jogar paciência",
    saved: "Jogo salvo neste aparelho",
    titleLine1: "Uma partida tranquila",
    titleLine2: "de paciência",
  },
  start: {
    alreadyHaveOne: "Você vai criar uma conta. Já tem uma?",
    defaultRequest: "O Sam pode me levar à consulta na terça?",
    intro:
      "Diga ao LifeLink do que precisa e leia a mensagem inteira antes de qualquer envio. Quer dar uma olhada antes? Você pode experimentar com mensagens de exemplo.",
    myFamily: "Minha própria família",
    request: "Seu pedido",
    sampleFamily: "Família de exemplo",
    seeDraft: "Ver o rascunho",
    signIn: "Entrar",
    titleLine1: "Comece com",
    titleLine2: "um pedido",
    tryWith: "Experimentar com",
    whatHelp: "Com o que você gostaria de ajuda?",
  },
};

export { landing };

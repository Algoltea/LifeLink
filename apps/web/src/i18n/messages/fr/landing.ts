import type { Messages } from "../en";

const landing: Messages["landing"] = {
  everydayHelp: {
    displaySettings: [
      { label: "Taille du texte", value: "Plus grande" },
      { label: "Lire les réponses à voix haute", value: "Oui · plus lent" },
      { label: "Moins d’animations", value: "Oui" },
      { label: "Contraste", value: "Renforcé" },
      { label: "Sous-titres pendant les appels", value: "Oui" },
    ],
    intro:
      "Messages à la famille, rendez-vous et rappels, avec du texte en grand et la lecture à voix haute partout. Tout ce qui doit être envoyé vous attend toujours.",
    messages: {
      description:
        "Écrivez à votre famille par iMessage, e-mail, Discord ou Telegram. « Aidez-moi à comprendre » explique un message reçu et propose des réponses parmi lesquelles vous choisissez.",
      imageAlt:
        "Mary Cassatt, La Lettre : une femme en robe bleue à motifs cachette une lettre à son secrétaire.",
      imageCaption: "Mary Cassatt, La Lettre, 1890–91.",
      title: "Messages à la famille",
    },
    read: {
      description:
        "Texte plus grand, contraste renforcé, sous-titres et voix de lecture plus lente. Parlez au lieu d’écrire quand vous le souhaitez. Vos réglages vous suivent sur chaque écran.",
      imageAlt:
        "Édouard Manet, La Lecture de l’illustré : une femme en manteau et chapeau sombres lit un journal illustré en plein air.",
      imageCaption: "Édouard Manet, La Lecture de l’illustré, 1880–82.",
      title: "Lire, écouter ou parler",
    },
    reminder: {
      approve: "Approuver le rappel",
      changeTime: "Changer l’heure",
      title: "Nouveau rappel",
      version: "Version 1",
      what: "Appeler Ana",
      when: "Dimanche 1er novembre · 11 h 00",
      youSaid: "Vous avez dit : « Rappelle-moi d’appeler Ana dimanche. »",
    },
    reminders: {
      description:
        "Aujourd’hui commence par ce qui vous attend en premier, puis les rendez-vous et les rappels. Dites ce qu’il faut retenir et LifeLink le note pour que vous l’approuviez.",
      title: "Rendez-vous et rappels",
    },
    tab: "Aide au quotidien",
    thread: {
      helpMeUnderstand: "Aidez-moi à comprendre",
      reply: "Bien sûr ! 9 h 45 chez toi ? Je viendrai peut-être avec Max.",
      sent: "Envoyé à 9 h 05 · version 2",
      sentMessage:
        "Bonjour Sam, pourrais-tu me conduire chez le Dr Patel le mardi 27 octobre ?",
    },
    title: "Ce que LifeLink fait pour vous",
    today: {
      comingUp: "À venir",
      confirmPickup: "Confirmer que Sam passe à 9 h 45",
      greeting: "Bon après-midi, Ruth",
      review: "Vérifier",
      rows: [
        {
          detail: "Rappel · aujourd’hui",
          time: "20 h 00",
          title: "Comprimés du soir",
        },
        {
          detail: "Pas encore confirmé",
          time: "9 h 45",
          title: "Sam passe vous prendre",
        },
        { detail: "Mardi 27 oct.", time: "10 h 30", title: "Dr Patel" },
      ],
      waiting: "Vous attend",
    },
  },
  features: {
    hint: "Exemple. Faites défiler ou pointez une ligne pour voir cette partie de LifeLink ici.",
    items: {
      circle: {
        name: "Cercle de confiance",
        summary:
          "Invitez quelqu’un avec un code, choisissez ce qu’il peut voir et pendant combien de temps, et arrêtez le partage à tout moment.",
      },
      connections: {
        name: "Connexions",
        summary:
          "Chaque compte indique clairement ce qui fonctionne, ce qui n’est pas encore prêt et ce qu’il ne propose pas.",
      },
      documents: {
        name: "Documents",
        summary: "Vos fichiers Google Drive, chacun avec un aperçu.",
      },
      email: {
        name: "E-mail",
        summary:
          "Signale les e-mails qui ressemblent à des arnaques et rédige des réponses qui ne partent jamais toutes seules.",
      },
      family: {
        name: "Vue famille",
        summary:
          "La page que voit votre famille : seulement ce que vous partagez, avec des photos et un espace pour répondre.",
      },
      groceries: {
        name: "Courses",
        summary:
          "Des listes avec un budget et des estimations de prix, prêtes à copier ou à imprimer pour le magasin.",
      },
      help: {
        name: "Mon aide préférée",
        summary:
          "Des réponses courtes ou détaillées, une étape à la fois, dans la langue de votre choix.",
      },
      recap: {
        name: "Résumer une conversation",
        summary:
          "Sépare ce qui a été convenu de ce qui a seulement été proposé, et suggère les prochaines étapes.",
      },
      today: {
        name: "Aujourd’hui",
        summary:
          "Ce qui vous attend en premier, puis les rendez-vous, la météo et trois titres que vous choisissez.",
      },
    },
    titleLine1: "Tout ce qu’il",
    titleLine2: "fait d’autre",
  },
  footer: {
    credits: {
      afterLicense:
        ", Wikimedia Commons. Les exemples d’écran utilisent des données fictives.",
      byAuthor: "par RedKnight7,",
      morse:
        ". Manipulateur et enregistreur Morse, 1876 : domaine public, Wikimedia Commons.",
      paintings:
        "Mary Cassatt, La Lettre ; Édouard Manet, La Lecture de l’illustré ; Claude Monet, Promenade sur la falaise à Pourville et Le Bassin aux nymphéas ; Jean-Jacques de Boissieu, Vieillard lisant avec un enfant : domaine public (CC0),",
      telegram: "Télégramme Western Union de 1959",
    },
    getStarted: "Commencer",
    label: "Pied de page",
    links: {
      everydayHelp: "Aide au quotidien",
      howItWorks: "Comment ça marche",
      language: "Langue",
      ourPromise: "Notre promesse",
      questions: "Questions",
      scamCheck: "Vérifier une arnaque",
    },
    pictures: "Images",
    signIn: "Se connecter",
    solitaire: "Solitaire",
    tagline:
      "De l’aide pour les messages du quotidien. Rien n’est envoyé sans votre accord.",
  },
  hero: {
    getStarted: "Commencer",
    imageAlt:
      "Claude Monet, Promenade sur la falaise à Pourville : deux silhouettes sur une falaise fleurie au-dessus d’une mer lumineuse et de voiliers.",
    imageCaption: "Claude Monet, Promenade sur la falaise à Pourville, 1882.",
    intro:
      "LifeLink vous aide à écrire à votre famille, à suivre vos rendez-vous et à vérifier les messages ou les lettres qui semblent suspects. Vous lisez chaque message en entier avant de l’approuver.",
    seeHowItWorks: "Voir comment ça marche",
    titleLine1: "Rien n’est envoyé",
    titleLine2: "sans votre accord.",
  },
  howItWorks: {
    done: "Terminé",
    exampleTimes: "Heures données en exemple",
    imageAlt:
      "Gravure d’un manipulateur, d’un relais et d’un enregistreur Morse, légendés Indicateur, Relais, Manipulateur et Batterie de ligne.",
    imageCaption:
      "Manipulateur et enregistreur Morse, gravure pour Popular Science Monthly, 1876.",
    intro:
      "Voici une demande de trajet du début à la fin. Chaque étape est nommée en mots simples, pour que vous sachiez toujours ce qui s’est passé et ce qui ne s’est pas encore passé.",
    result: "Vous avez approuvé deux fois. Rien d’autre n’a été envoyé.",
    slipTitle: "Un trajet chez le Dr Patel",
    timeline: [
      {
        heading: "Lundi matin",
        steps: [
          { label: "Vous demandez qu’on vous conduise", time: "9 h 02" },
          { label: "LifeLink rédige le message", time: "9 h 02" },
          {
            decision: true,
            label: "Vous changez un mot et approuvez la version 2",
            time: "9 h 05",
          },
          { label: "Envoyé à Sam par iMessage", time: "9 h 05" },
        ],
      },
      {
        heading: "Lundi après-midi",
        steps: [
          { label: "Sam répond : « Bien sûr, 9 h 45 ? »", time: "13 h 40" },
          {
            decision: true,
            label: "Vous confirmez l’heure de passage",
            time: "13 h 52",
          },
        ],
      },
      {
        heading: "Mardi 27 octobre",
        steps: [
          { label: "Rappel : Sam arrive à 9 h 45", time: "9 h 15" },
          { label: "Rendez-vous chez le Dr Patel", time: "10 h 30" },
        ],
      },
    ],
    titleLine1: "Ce qui se passe",
    titleLine2: "après votre demande",
  },
  language: {
    intro:
      "Choisissez la langue de cette page. Si vous créez un compte, LifeLink la conserve. Si vous avez déjà un compte, la connexion utilise la langue que vous y avez choisie.",
    title: "Langue",
  },
  messageSlip: {
    approve: "Approuver et envoyer",
    message:
      "Bonjour Sam, pourrais-tu me conduire chez le Dr Patel le mardi 27 octobre ? Je dois y être à 10 h 30. Merci ! Ruth",
    notSent: "Pas encore envoyé",
    sent: "Envoyé à 9 h 05. Rien d’autre n’a été envoyé.",
    showAgain: "Afficher à nouveau",
    to: "À Sam Rivera · iMessage",
    version: "Version 2",
  },
  nav: {
    howItWorks: "Comment ça marche",
    language: "Langue",
    questions: "Questions",
    scamCheck: "Vérifier une arnaque",
    signIn: "Se connecter",
  },
  previews: {
    approveAndSend: "Approuver et envoyer",
    circle: {
      appointments: "Rendez-vous",
      code: "Code d’invitation à usage unique",
      notShared: "Non partagé",
      note: "Jusqu’au 31 décembre",
      rides: "Trajets",
      scamAlerts: "Alertes d’arnaque",
      shared: "Partagé",
      stop: "Arrêter le partage maintenant",
      title: "Partagé avec Sam Rivera",
    },
    connections: {
      add: "Ajouter un rendez-vous approuvé",
      footnote:
        "Chaque connexion n’indique que ce qu’elle peut vraiment faire.",
      notReady: "Pas encore prêt",
      note: "Connecté",
      see: "Voir vos prochains événements",
      works: "Fonctionne",
    },
    documents: {
      files: [
        { date: "12 oct.", name: "Récapitulatif Medicare.pdf" },
        { date: "30 sept.", name: "Recette de soupe d’Ana" },
        { date: "14 sept.", name: "Photos du jardin" },
      ],
      footnote:
        "Choisissez un fichier pour l’afficher. Modifiez-le ou partagez-le dans Google Drive.",
      title: "Documents",
    },
    email: {
      anaSubject: "Déjeuner dimanche ? Apporte l’album photo !",
      draftBody:
        "Dimanche, avec plaisir. J’apporterai l’album. 12 h 30, ça te va ? Bises, Ruth",
      draftTitle: "Réponse à Ana · brouillon, non envoyé",
      note: "3 nouveaux",
      parcelSender: "Service de livraison de colis",
      parcelSubject: "Action requise : votre colis est en attente",
      scamWarning:
        "Cela ressemble à une arnaque : on vous demande de payer par un lien.",
      title: "E-mail",
    },
    family: {
      footnote:
        "Sam peut lire et répondre. Sam ne peut ni envoyer, ni approuver, ni dépenser à la place de Ruth.",
      nextAppointment: "Prochain rendez-vous",
      note: "Ce que voit Sam",
      photos: "2 nouvelles photos du jardin",
      replyLabel: "Répondre à Ruth",
      replyText: "À mardi, 9 h 45 !",
      title: "Nouvelles de Ruth",
      when: "Dr Patel, mardi à 10 h 30",
    },
    groceries: {
      copy: "Copier la liste",
      items: [
        { label: "Lait d’avoine, 2", value: "$7.98" },
        { label: "Pain complet", value: "$4.49" },
        { label: "Pommes, 6", value: "$5.20" },
        { label: "Ingrédients de soupe pour la visite d’Ana", value: "$18.40" },
      ],
      note: "$62 sur un budget de $80",
      print: "Imprimer",
      title: "Courses de la semaine",
    },
    help: {
      answers: "Réponses",
      language: "Langue de l’aide",
      noteLabel: "Note privée",
      noteText:
        "J’entends mal au téléphone. Proposez d’abord un message écrit.",
      on: "Oui",
      oneStep: "Une étape à la fois",
      short: "Courtes",
      title: "Mon aide préférée",
    },
    recap: {
      agreed: "Convenu",
      agreedText: "Sam vous conduit mardi et passe vous prendre à 9 h 45.",
      nextStep: "Prochaine étape suggérée",
      nextStepText: "Me le rappeler lundi soir.",
      offered: "Seulement proposé",
      offeredText: "Sam viendra peut-être avec Max.",
      review: "Vérifier le rappel",
      title: "Résumé",
    },
    today: {
      goodNews: "Bonnes nouvelles, choisies par vous",
      headlines: [
        "La bibliothèque ouvre plus longtemps le dimanche",
        "Des bénévoles restaurent la roseraie de la ville",
        "Le ferry reprend du service pour l’été",
      ],
      note: "Lundi",
      pickup: "Confirmer que Sam passe à 9 h 45",
      title: "Bonjour, Ruth",
      waiting: "Vous attend",
      weather: "Météo",
      weatherValue: "58 °F, pluie légère",
    },
  },
  promise: {
    howSharingWorks: "Comment fonctionne le partage",
    leftImageAlt:
      "Eau-forte d’un vieil homme lisant un livre avec un jeune garçon sur les genoux, près d’une petite table.",
    leftImageCaption:
      "Jean-Jacques de Boissieu, Vieillard lisant avec un enfant, 1770.",
    promises: [
      "Nous n’enverrons jamais rien que vous n’ayez lu et approuvé. Si un message change après votre accord, nous vous redemandons.",
      "Votre famille peut être proche sans tout prendre en main. Vous choisissez ce qu’une personne de confiance peut voir, comme les rendez-vous ou les trajets, et pendant combien de temps. Elle ne peut jamais envoyer, approuver ou dépenser à votre place.",
      "Quand il ne s’agit que d’un essai, nous le disons. Quand quelque chose ne va pas, nous vous disons ce qui s’est passé, que rien n’a été perdu et quoi faire ensuite.",
      "Et nous ne vous dirons jamais qu’un message est sûr. Nous vous montrons les signes d’alerte et la décision vous revient.",
    ],
    rightImageAlt:
      "Un télégramme Western Union de 1959, tapé en majuscules et tamponné avec des notes manuscrites.",
    rightImageCaption:
      "Un télégramme Western Union, 1959. Chaque mot comptait, et quelqu’un signait à la réception.",
    sharing:
      "Modifiez ou arrêtez le partage à tout moment depuis votre Cercle de confiance.",
    signature: "Une aide au quotidien. Votre décision.",
    tab: "Notre promesse",
    title: "Ce que LifeLink ne fera jamais",
  },
  questions: {
    imageAlt:
      "Claude Monet, Le Bassin aux nymphéas : une passerelle verte enjambe un bassin couvert de nymphéas.",
    imageCaption: "Claude Monet, Le Bassin aux nymphéas, 1900.",
    intro:
      "Les réponses aux questions les plus fréquentes, toutes sur cette page.",
    items: [
      {
        answer:
          "Une famille, des e-mails et un rendez-vous fictifs, pour tout essayer. Rien de réel n’est envoyé et chaque résultat porte la mention Entraînement.",
        question: "Qu’est-ce que le mode Entraînement ?",
      },
      {
        answer:
          "Oui. Dites ce dont vous avez besoin, et LifeLink peut lire les réponses à voix haute à la vitesse de votre choix.",
        question: "Puis-je parler au lieu d’écrire ?",
      },
      {
        answer:
          "Non. Ils ne voient que ce que vous partagez et ne peuvent jamais envoyer, approuver ou dépenser à votre place.",
        question: "Ma famille peut-elle agir à ma place ?",
      },
      {
        answer:
          "Gmail, Outlook et Google Agenda, ainsi qu’iMessage, Discord et Telegram. Chacun indique clairement ce qui fonctionne et ce qui ne fonctionne pas encore.",
        question: "Quels comptes puis-je connecter ?",
      },
      {
        answer:
          "Non. Il garde vos listes, estime les prix et un budget, puis vous permet de copier ou d’imprimer la liste pour faire vos courses vous-même.",
        question: "LifeLink commande-t-il les courses ?",
      },
      {
        answer:
          "Il devient une nouvelle version, et LifeLink vous demande de l’approuver avant que quoi que ce soit ne soit envoyé.",
        question: "Et si je modifie un message ?",
      },
      {
        answer:
          "Non. Envoyé, répondu et confirmé sont des étapes distinctes, et LifeLink vous dit en toutes lettres où vous en êtes.",
        question: "« Envoyé » veut-il dire « convenu » ?",
      },
      {
        answer:
          "Il nomme les signes d’alerte et une prochaine étape plus sûre. Il ne promet jamais qu’un message est sûr.",
        question: "Peut-il me dire qu’un message est sûr ?",
      },
      {
        answer:
          "Le solitaire, oui, et votre partie est enregistrée sur cet appareil. Les messages ont besoin d’une connexion.",
        question: "Est-ce que ça marche sans internet ?",
      },
      {
        answer:
          "Vous verrez ce qui s’est passé, que rien n’a été perdu et quoi faire ensuite.",
        question: "Et si quelque chose ne va pas ?",
      },
    ],
    tab: "Questions",
    title: "Questions",
  },
  scamCheck: {
    beCareful: "Méfiez-vous de ce message.",
    checkMessage: "Vérifier un message",
    example: "Exemple",
    examples: {
      call: {
        label: "Un appel",
        nextStep:
          "Raccrochez et appelez votre petit-fils au numéro que vous avez déjà.",
        received:
          "Un correspondant dit que votre petit-fils a des ennuis et qu’il faut lui envoyer de l’argent aujourd’hui.",
        signs: [
          "On vous demande de l’argent en urgence.",
          "On vous demande de garder l’appel secret.",
          "On veut un paiement par carte cadeau ou virement.",
        ],
      },
      email: {
        label: "Un e-mail",
        nextStep:
          "Appelez votre banque au numéro imprimé sur votre carte. Ne répondez pas à cet e-mail.",
        received:
          "Votre compte bancaire est bloqué. Confirmez vos informations aujourd’hui pour éviter sa fermeture.",
        signs: [
          "On menace de fermer votre compte.",
          "On vous demande de confirmer des informations privées.",
          "L’adresse de l’expéditeur ne correspond pas à votre banque.",
        ],
      },
      letter: {
        label: "Une lettre",
        nextStep:
          "Renseignez-vous vous-même sur la société avant de payer ou d’envoyer quoi que ce soit.",
        received:
          "Vous avez gagné $5,000. Envoyez $40 de frais de dossier pour recevoir votre prix.",
        signs: [
          "Vous devez payer avant de recevoir quoi que ce soit.",
          "Vous n’avez participé à aucun concours.",
          "Impossible de vérifier qui l’a envoyée.",
        ],
      },
      text: {
        label: "Un SMS",
        nextStep:
          "Ouvrez vous-même l’application ou le site de votre transporteur. N’utilisez pas ce lien.",
        received:
          "Votre colis vous attend. Payez $1.99 de frais de nouvelle livraison sous 30 minutes : parcel-redeliver.co/pay",
        signs: [
          "On vous presse : payer sous 30 minutes.",
          "On vous demande de payer par un lien.",
          "Le lien n’est pas le site d’un transporteur.",
        ],
      },
    },
    intro:
      "Collez un SMS, choisissez un e-mail, photographiez une lettre ou vérifiez un appel sur haut-parleur. LifeLink repère les signes d’alerte et propose une prochaine étape sûre. Il ne vous dit jamais qu’un message est sûr.",
    kinds: "Types de message à vérifier",
    panelTitle: "Vérifier une arnaque",
    saferStep: "Une prochaine étape plus sûre",
    tab: "Vérifier une arnaque",
    title: "Vous doutez d’un message ?",
    whatItLooksFor: "Ce qu’il recherche",
  },
  solitaire: {
    boardDescription:
      "Une partie de solitaire Klondike en cours. Le huit de pique passe sur le neuf de cœur.",
    controls: ["Annuler", "Indice", "Nouvelle partie"],
    intro:
      "Le Klondike avec de grandes cartes bien lisibles. Touchez une carte pour la déplacer, ou jouez au clavier. Annuler et un indice sont toujours à portée de main, et votre partie est enregistrée sur cet appareil, même sans internet.",
    noAccount: "Aucun compte nécessaire.",
    play: "Jouer au solitaire",
    saved: "Partie enregistrée sur cet appareil",
    titleLine1: "Une partie tranquille",
    titleLine2: "de solitaire",
  },
  start: {
    alreadyHaveOne: "Vous allez créer un compte. Vous en avez déjà un ?",
    defaultRequest: "Sam peut-il me conduire à mon rendez-vous mardi ?",
    intro:
      "Dites à LifeLink ce dont vous avez besoin, puis lisez le message en entier avant tout envoi. Envie de jeter un œil d’abord ? Vous pouvez essayer avec des messages fictifs.",
    myFamily: "Ma propre famille",
    request: "Votre demande",
    sampleFamily: "Famille fictive",
    seeDraft: "Voir le brouillon",
    signIn: "Se connecter",
    titleLine1: "Commencez par",
    titleLine2: "une demande",
    tryWith: "Essayer avec",
    whatHelp: "Pour quoi souhaitez-vous de l’aide ?",
  },
};

export { landing };

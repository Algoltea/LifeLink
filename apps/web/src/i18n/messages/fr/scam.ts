import type { Messages } from "../en";

const scam: Messages["scam"] = {
  addNote: "Quelque chose à ajouter ? (facultatif)",
  addNotePlaceholder: "Par exemple, de qui le message prétend provenir",
  ask: "Demander à une personne de confiance",
  callCheckTitle: "Vérification d’un appel suspect",
  checkSomethingElse: "Vérifier autre chose",
  checking: "Vérification",
  checkingMessage: "Vérification du message…",
  chooseEmail: "Choisir un courriel",
  chooseRecent: "Choisir parmi vos courriels récents",
  cloudNote:
    "Un service d’IA lit ce contenu pour le vérifier. N’y incluez pas de mots de passe ni de numéros de carte.",
  didNotFinish: "Vérification inachevée",
  earlier: "Vérifications précédentes",
  earlierEmpty:
    "Vos vérifications de messages, de photos et d’appels apparaîtront ici.",
  emailMissing:
    "Ce courriel ne figure pas dans les messages récents. Choisissez un autre courriel ou saisissez son texte ci-dessous.",
  from: (sender) => `De ${sender}`,
  guidance: {
    ai: "Un service d’IA aide à vérifier les messages et les photos. Les photos sont conservées avec votre vérification jusqu’à sa suppression. Les vérifications d’entraînement n’utilisent jamais l’IA.",
    intro:
      "Une vérification recherche des signaux d’alerte courants. Elle ne peut pas confirmer qui a envoyé un message ni si son contenu est vrai.",
    next: "Lisez le résultat, suivez les indications « Que faire maintenant » ou demandez un second avis à une personne de confiance. Vous choisissez la suite.",
    title: "Que peut m’apprendre une vérification d’arnaque ?",
  },
  howToShow: "Comment souhaitez-vous montrer le message ?",
  loadingEarlier: "Chargement des vérifications précédentes",
  loadingEmail: "Chargement du courriel",
  loadingEmails: "Chargement de vos courriels",
  localNote:
    "Les vérifications par IA sont indisponibles pour le moment. LifeLink recherche à la place des signaux d’alerte courants.",
  messageWords: "Le texte du message",
  messageWordsPlaceholder: "Collez ou saisissez le texte ici",
  noLongerAvailable:
    "Cette vérification n’est plus disponible. Vous pouvez en commencer une nouvelle.",
  noRecentEmails: "Aucun courriel récent à choisir. ",
  noRecentEmailsRest: ", ou saisissez le texte du message à la place.",
  noSubject: "(Sans objet)",
  openEmail: "Ouvrir les courriels",
  opening: "Ouverture de votre vérification",
  photo: {
    availabilityChecking:
      "Vérification de la disponibilité de l’analyse des photos…",
    practice:
      "Le mode entraînement est activé. Les photos ne sont ni vérifiées ni envoyées à un service d’IA.",
    unavailable:
      "Les vérifications de photos sont indisponibles pour le moment. Votre photo ne sera pas transmise.",
    unavailableType:
      "Les vérifications de photos sont indisponibles. Saisissez le texte à la place.",
  },
  practiceEmailNote:
    "Ceci est un courriel d’entraînement. Il est vérifié sur cet appareil, sans IA dans le nuage.",
  practiceNote:
    "Les vérifications d’entraînement utilisent des signaux d’alerte courants. Rien n’est envoyé à un service d’IA.",
  practiceSuffix: " · Entraînement",
  preparing: "Préparation de votre vérification…",
  review: "Vérifier",
  sources: { email: "Courriel", screenshot: "Photo", text: "Texte" },
  startNew: "Commencer une nouvelle vérification",
  subline:
    "Un message ou un appel vous semble suspect ? LifeLink recherche les signaux d’alerte avant que vous agissiez.",
  submit: {
    email: "Vérifier ce courriel",
    screenshot: "Vérifier cette photo",
    text: "Vérifier ce message",
  },
  title: "Vérifier une possible arnaque",
  uploading: "Transmission de votre photo…",
  uploadingNote:
    "Transmission de votre photo. Gardez cette page ouverte ; la lecture du texte suivra.",
};

export { scam };

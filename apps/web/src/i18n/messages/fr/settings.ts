import type { Messages } from "../en";

const settings: Messages["settings"] = {
  accountsAndPermissions: "Comptes et autorisations",
  accountsLink: "Comptes que LifeLink peut utiliser",
  aiEmailChecks: "Vérifier les nouveaux courriels avec l’IA",
  aiEmailChecksDescription:
    "À l’arrivée d’un nouveau courriel, un service d’IA dans le nuage recherche des signes d’arnaque. Les anciens courriels et les courriels d’entraînement ne sont jamais envoyés.",
  captions: "Sous-titres pendant la conversation vocale",
  captionsDescription: "Affiche les mots lorsque vous parlez avec LifeLink.",
  characterCount: (count, maximum) => `${count} caractères sur ${maximum}`,
  choicesNotSaved: (error) =>
    `Vos choix n’ont pas été enregistrés dans votre compte. ${error} Réessayez ci-dessous.`,
  contrast: "Contraste",
  contrastDescription:
    "Un contraste plus fort rend le texte plus foncé et les bordures plus visibles.",
  contrastMore: "Contraste renforcé",
  contrastStandard: "Standard",
  defaultVoice: "Voix par défaut de LifeLink",
  demoAllowedHint: "Ce réglage s’enregistre automatiquement.",
  demoBetweenModes:
    "Tout ce qui a été préparé dans un mode doit être vérifié à nouveau avant d’être exécuté dans l’autre.",
  demoDescription:
    "En mode entraînement, rien de réel n’est envoyé, enregistré ailleurs ou acheté. Tout ce qui se passerait est simulé et porte la mention « Entraînement ». Des exemples de personnes et de messages sont ajoutés pour vous permettre d’essayer en toute tranquillité.",
  demoFailed: (error) =>
    `Le mode entraînement n’a pas pu être modifié. ${error} Réessayez avec l’interrupteur.`,
  demoOff:
    "Le mode entraînement est désactivé. Tout ce que vous approuvez maintenant se produit réellement.",
  demoOn: "Le mode entraînement est activé.",
  demoTitle: "Mode entraînement",
  demoTurnedOff: "Le mode entraînement a été désactivé pour cette application.",
  demoUse: "Utiliser le mode entraînement",
  detailDetailed: "Détaillées",
  detailShort: "Courtes",
  explanations: "Explications",
  explanationsDescription:
    "Les explications courtes donnent l’essentiel. Les explications détaillées en disent un peu plus.",
  fullName: "Nom complet",
  groceriesLink: "Listes de courses et budgets",
  hearSample: "Écouter un exemple",
  helpDescription:
    "Ces préférences servent lorsque LifeLink explique un message, une vérification d’arnaque, un récapitulatif de conversation ou votre point du matin. Vous seul voyez ces explications. Les choix ci-dessous s’enregistrent à chaque modification ; les notes ont leur propre bouton Enregistrer les notes.",
  helpTitle: "L’aide comme je l’aime",
  language: "Langue",
  languageDescription:
    "Choisissez la langue des écrans de LifeLink et de l’aide dans le nuage. Les écrans principaux sont disponibles dans les dix langues proposées. L’aide dans le nuage peut utiliser la langue choisie lorsqu’elle est disponible. Les vérifications d’arnaques et de courriels fondées sur des règles locales couvrent uniquement l’anglais et peuvent manquer des arnaques dans d’autres langues. Les citations et les messages gardent leurs mots d’origine.",
  lessMovement: "Moins de mouvement",
  lessMovementDescription: "Désactive les glissements et les fondus.",
  loading: "Chargement des paramètres",
  newsOnToday: "Actualités sur Aujourd’hui",
  newsOnTodayDescription:
    "Affiche trois titres sur Aujourd’hui. Vous y choisissez les bonnes nouvelles ou les principales actualités.",
  notes: "Notes sur l’aide que je préfère",
  notesHint:
    "Par exemple : « Donnez-moi une étape à la fois. » Ces notes servent uniquement aux explications de LifeLink qui vous sont destinées. Elles ne sont jamais montrées à votre famille ni ajoutées à un message. Si vous autorisez une explication dans le nuage, elles sont envoyées au fournisseur d’IA avec le message.",
  notesNotSaved: (error) =>
    `Vos notes n’ont pas été enregistrées. ${error} Votre texte est toujours ici. Choisissez Enregistrer les notes pour réessayer.`,
  notesSaveHint:
    "Choisissez Enregistrer les notes pour conserver les modifications de ce texte.",
  notesSaved: "Vos notes sont enregistrées.",
  oneStep: "Une étape à la fois",
  oneStepDescription:
    "Affiche les explications et les prochaines étapes une à une, avec un bouton Suivant.",
  permissionsLink: "Qui peut voir quoi",
  postalCode: "Code postal",
  preferredName: "Le nom que LifeLink utilise pour vous",
  profileNotSaved: (error) =>
    `Votre profil n’a pas été enregistré. ${error} Vos saisies sont toujours ici. Choisissez Enregistrer le profil pour réessayer.`,
  profileSaveHint:
    "Choisissez Enregistrer le profil pour conserver les modifications de cette section.",
  profileTitle: "À propos de vous",
  readAloudAuto: "Lire automatiquement à voix haute",
  readAloudAutoDescription:
    "LifeLink lit à voix haute les nouveaux points du jour et les nouvelles réponses.",
  readAloudVoice: "Voix de lecture",
  readAloudVoiceDescription:
    "Choisissez la voix qui vous fait la lecture. Le choix par défaut de LifeLink utilise la voix standard.",
  saveNotes: "Enregistrer les notes",
  saveProfile: "Enregistrer le profil",
  saved: "Enregistré.",
  savesAsYouChange: "Ces préférences s’enregistrent à chaque modification.",
  seeingAndHearing: "Voir et entendre",
  signOff: "Votre signature dans les messages",
  signOffPlaceholder: "Par exemple, Maman",
  speakingSpeed: "Vitesse de parole",
  speakingSpeedDescription:
    "La vitesse à laquelle LifeLink parle pendant la lecture à voix haute.",
  speechQuicker: "Plus rapide",
  speechSample: "Voici la voix de LifeLink lorsque je vous fais la lecture.",
  speechSlower: "Plus lente",
  speechUsual: "Habituelle",
  subline: "Adaptez LifeLink pour le lire et l’écouter confortablement.",
  textSize: "Taille du texte",
  textSizeDescription:
    "S’applique à toutes les pages. Votre choix est mémorisé sur cet appareil.",
  textSizeLarge: "Grande",
  textSizeLarger: "Très grande",
  textSizeLargest: "La plus grande",
  textSizeStandard: "Standard",
  theme: "Clair ou sombre",
  themeDark: "Sombre",
  themeLight: "Clair",
  themeSystem: "Comme mon appareil",
  timeZone: "Fuseau horaire",
  title: "Paramètres",
  trySavingAgain: "Réessayer l’enregistrement",
};

export { settings };

import type { Messages } from "../en";

const ask: Messages["ask"] = {
  closeHistory: "Fermer l’historique des conversations",
  composerLabel: "Écrivez ou parlez à LifeLink",
  conversationLabel: "Conversation avec LifeLink",
  copied: "Copié",
  copy: "Copier",
  copyUnavailable:
    "La copie n’est pas disponible ici. Vous pouvez sélectionner le texte à la place.",
  emailSummary: {
    cloud: "Résumé dans le nuage",
    cloudConsent:
      "Utiliser l’IA dans le nuage pour un résumé plus complet. Le texte disponible et les résumés enregistrés de mes 15 derniers courriels importés seront envoyés au fournisseur d’IA. Laissez cette case décochée pour résumer dans LifeLink.",
    count: (count) =>
      `${count} ${count > 1 ? "courriels récents importés" : "courriel récent importé"} · `,
    empty:
      "Aucun courriel importé pour le moment. Recherchez les nouveaux courriels sur la page Courriels, puis demandez à nouveau un résumé.",
    emptyGroup: "Aucun courriel dans cette catégorie.",
    groups: {
      check_first: "Vérifier avant d’agir",
      low_priority: "Moins prioritaire",
      reply: "Une réponse peut être nécessaire",
      review: "À consulter",
    },
    howMade: "Comment ce résumé a été réalisé",
    local: "Résumé LifeLink",
    noSubject: "(Sans objet)",
    offline: "Connectez-vous à Internet pour résumer vos courriels importés.",
    openEmail: "Ouvrir les courriels",
    options: "Options du résumé",
    practicePrefix: "Entraînement · ",
    suggestionsOnly:
      "Il s’agit uniquement de suggestions. Consultez les messages originaux avant d’agir. Rien n’a été envoyé ni modifié dans votre boîte courriel.",
    summarize: "Résumer les courriels",
    summarizing: "Résumé des courriels en cours…",
    title: "Résumé des courriels récents",
    working: "Ajout du résumé des courriels à cette conversation…",
  },
  failed: "Cette réponse n’a pas pu être terminée. Veuillez redemander.",
  history: "Historique",
  historyDescription: "Reprenez là où vous en étiez.",
  historyEmpty:
    "Aucune conversation pour le moment. Votre première conversation sera enregistrée ici.",
  historyGroups: { earlier: "Plus tôt", thisWeek: "Cette semaine" },
  historyTitle: "Historique des conversations",
  lifeLinkSaid: "LifeLink a dit : ",
  loadEarlier: "Afficher les messages précédents",
  loadEarlierConversations: "Afficher les conversations précédentes",
  loadingConversation: "Chargement de votre conversation",
  loadingConversations: "Chargement des conversations…",
  loadingEarlier: "Chargement des messages précédents…",
  loadingHistory: "Chargement de votre historique",
  newChat: "Nouvelle conversation",
  openNow: ", ouverte actuellement",
  opening: "Ouverture de votre conversation",
  quickActions: "Actions rapides",
  suggestions: {
    reminder: { label: "Créer un rappel", prompt: "Rappelez-moi de " },
    ride: {
      label: "Demander un trajet",
      prompt:
        "Demandez à ma famille si quelqu’un peut m’accompagner à mon rendez-vous le ",
    },
    write: {
      label: "Écrire à la famille",
      prompt: "Aidez-moi à écrire un message à ",
    },
  },
  thinking: "Réflexion en cours…",
  title: "Demander à LifeLink",
  titlePrefix: "Demander à LifeLink : ",
  waitingConnection: "En attente d’une connexion. Rien n’a été envoyé.",
  waitingForConnection: "Messages en attente d’une connexion",
  whatCanIHelp: "Comment puis-je vous aider aujourd’hui ?",
  youSaid: "Vous avez dit : ",
  yourConversation: "Votre conversation",
};

export { ask };

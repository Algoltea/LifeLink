import type { Messages } from "../en";

const connections: Messages["connections"] = {
  account: (label) => `Compte : ${label}`,
  allowProvider: (label) => `Choisissez Autoriser sur la page de ${label}.`,
  appAccount:
    "Ce service utilise le compte de l’application ; vous n’avez donc pas de compte auquel vous connecter.",
  callback: {
    back: "Retour aux connexions",
    checking: (label) => `Vérification de la connexion à ${label}`,
    connected: (label) => `${label} est connecté.`,
    connectedTitle: (label) => `${label} connecté`,
    declined: (label) =>
      `La connexion à ${label} n’a pas abouti. Rien n’a été modifié. Vous pouvez réessayer.`,
    missing:
      "Cette page a été ouverte sans connexion à terminer. Veuillez recommencer depuis Connexions.",
    practice:
      "Le mode entraînement est activé. Désactivez-le dans les paramètres avant de terminer une connexion réelle.",
    service: "Le service",
    subline:
      "Retournez à Connexions pour consulter vos services ou recommencer.",
    title: "État de la connexion",
    unavailable:
      "Ce service n’a pas de connexion disponible dans LifeLink. Retournez à Connexions pour consulter ses limites.",
  },
  canDo: "Possibilités",
  cancel: "Annuler",
  cardLabel: (label, status, permissions, action) =>
    `${label}. ${status}. ${permissions}. ${action}.`,
  close: "Fermer",
  comingLater: "Prévu plus tard",
  connect: "Connecter",
  connectProvider: (label) => `Connecter ${label}`,
  connectionState: (status) => `La connexion est ${status}.`,
  connectionStates: {
    active: "active",
    deleted: "supprimée",
    expired: "expirée",
    failed: "en échec",
    inactive: "inactive",
    initiated: "démarrée",
    pending: "en attente",
    revoked: "révoquée",
  },
  detailLabel: (label, summary) => `${label}. ${summary} Détails.`,
  details: "Détails",
  developerSetupAfter: (label) => ` et choisir ${label}.`,
  developerSetupBefore: "Pour la personne qui gère LifeLink : exécuter ",
  disconnect: (label) => `Déconnecter ${label}`,
  disconnectPractice: "Déconnecter le compte d’entraînement",
  disconnectTip: (label) =>
    `Conseil : cette personne peut déconnecter ${label} depuis cette fenêtre à tout moment.`,
  disconnected: (label) => `${label} est déconnecté. Il ne sera plus utilisé.`,
  discordSetup: (practice) =>
    `${practice ? "Lorsque vous utiliserez le vrai Discord, ajoutez" : "Ajoutez"} l’identifiant utilisateur Discord de chaque personne dans le Cercle de confiance.`,
  empty: "Aucun service répertorié.",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "Les connexions ne sont pas encore configurées pour cette application. Exécutez bun run dev:setup.",
    "Please sign in again.": "Veuillez vous reconnecter.",
    "Practice connections are only available in practice mode.":
      "Les connexions d’entraînement sont disponibles uniquement en mode entraînement.",
    "That account could not be found.": "Ce compte est introuvable.",
    "That connection could not be found.": "Cette connexion est introuvable.",
    "The connection did not finish. You can try again.":
      "La connexion n’a pas abouti. Vous pouvez réessayer.",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "Cette connexion a changé pendant le traitement de la demande. Retournez à Connexions pour vérifier son état.",
    "This connection was not started from your account. Please try connecting again.":
      "Cette connexion n’a pas été démarrée depuis votre compte. Veuillez réessayer de vous connecter.",
    "This service does not use a personal sign-in.":
      "Ce service n’utilise pas de connexion à un compte personnel.",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "Désactivez le mode entraînement dans les paramètres avant de connecter ou de modifier un compte réel.",
    "We could not confirm the connection.":
      "Nous n’avons pas pu confirmer la connexion.",
  },
  groups: {
    appointments: "Gérer les rendez-vous",
    email: "Lire et écrire des courriels",
    messages: "Écrire à la famille et aux amis",
  },
  helperTitle: "Vous configurez ceci pour quelqu’un ?",
  imessageIntro:
    "Liez chaque personne du Cercle de confiance à son contact Photon existant. LifeLink n’inscrit pas de nouveaux contacts.",
  imessageSteps: [
    "Enregistrez le numéro de téléphone exact ou l’adresse courriel d’identifiant Apple d’où cette personne envoie ses iMessages. Un numéro de téléphone et une adresse courriel sont des identités distinctes, même pour une seule personne.",
    "Vérifiez que cette adresse exacte est déjà enregistrée dans le tableau de bord Photon. Si elle manque, ajoutez-y d’abord le contact. Choisissez ensuite Lier iMessage dans le Cercle de confiance et utilisez le numéro attribué affiché pour ce contact.",
    "Demandez à cette personne d’envoyer le premier iMessage à son numéro attribué depuis cette adresse exacte enregistrée. LifeLink pourra lui écrire après l’arrivée de son premier message.",
  ],
  intro: (label) =>
    `Voici ce que LifeLink peut faire avec ${label}. Rien n’est envoyé sans votre approbation.`,
  limitTags: { not_offered: "Impossible", not_wired: "Prévu plus tard" },
  limitsCount: (count) => `Ce que LifeLink ne peut pas encore faire (${count})`,
  limitsTitle: "Ce que LifeLink ne peut pas encore faire",
  loading: "Chargement des connexions",
  manage: "Gérer",
  notSetUp:
    "Ce service n’est pas encore activé. Demandez à la personne qui a configuré LifeLink de l’activer.",
  openCircle: "Ouvrir le Cercle de confiance",
  permissions: {
    add: "Ajouter",
    calendar: "Trouver des dates",
    draft: "Brouillon",
    message: "Message",
    money: "Argent",
    notice: "Alertes",
    post: "Publier",
    read: "Lire",
    replies: "Réponses",
    send: "Envoyer",
    unavailable: "Rien pour le moment",
  },
  practiceAccount: "Utiliser un compte d’entraînement",
  practiceBlocked: (label) =>
    `Votre connexion réelle à ${label} est enregistrée. Un compte d’entraînement ne peut pas la remplacer. Désactivez le mode entraînement dans les paramètres pour la gérer.`,
  practiceConnected: (label) =>
    `Un compte d’entraînement ${label} est connecté. Il ne contacte jamais le service réel.`,
  practiceDisconnected: (label) =>
    `Le compte d’entraînement ${label} est déconnecté.`,
  practiceMessages: (imessage) =>
    imessage
      ? "Les iMessages d’entraînement sont simulés. Aucun message ne parvient à vos contacts."
      : "Les messages Discord d’entraînement sont simulés. Aucun message ne parvient à vos contacts.",
  practiceNeverConnects:
    "Ce compte d’entraînement ne se connecte jamais au service réel.",
  pressConnect: (label) => `Appuyez sur ${label} ci-dessous.`,
  providers: {
    discord: {
      accountRequirement:
        "Le membre de la famille partage un serveur avec le bot de l’application, ou lui a déjà envoyé un message.",
      capabilities: {
        "discord.receive": {
          label: "Recevoir des réponses",
          note: "Les réponses arrivent lorsque le bot Discord de LifeLink est en ligne.",
        },
        "discord.send": {
          label: "Envoyer un message privé après votre approbation",
        },
      },
      summary: "Messages privés avec la famille sur Discord.",
    },
    ebay: {
      accountRequirement:
        "Les comptes eBay personnels ne peuvent pas être connectés ici.",
      capabilities: {
        "ebay.search": { label: "Rechercher des annonces eBay" },
        "ebay.selling": { label: "Vos annonces, commandes ou achats" },
      },
      summary:
        "La recherche est prévue plus tard. LifeLink n’achète ni ne vend jamais.",
    },
    facebook: {
      accountRequirement:
        "Fonctionnalités des Pages Facebook uniquement. Les profils personnels ne sont pas pris en charge.",
      capabilities: {
        "facebook.page_inbox": {
          label: "Lire les messages de votre Page et y répondre",
        },
        "facebook.page_post": {
          label: "Publier sur une Page après votre approbation",
        },
        "facebook.personal": {
          label: "Fil personnel et messages d’amis",
          note: "Facebook ne permet pas aux applications de lire ou d’envoyer des conversations Messenger personnelles.",
        },
      },
      summary: "Pages professionnelles uniquement. Prévu plus tard.",
    },
    gmail: {
      accountRequirement: "Un compte Google.",
      capabilities: {
        "email.appointments": {
          label: "Repérer les rendez-vous dans les courriels",
        },
        "email.draft": { label: "Rédiger un brouillon à vérifier" },
        "email.new_message_event": {
          label:
            "Repérer les nouveaux courriels (vérification environ chaque minute)",
        },
        "email.read_selected": {
          label: "Lire les courriels que vous choisissez pour les résumer",
        },
        "email.send": { label: "Envoyer un courriel après votre approbation" },
      },
      summary:
        "Lire, rédiger et envoyer des courriels. Repérer les rendez-vous dans votre courrier.",
    },
    google_calendar: {
      accountRequirement: "Un compte Google.",
      capabilities: {
        "calendar.create": { label: "Ajouter un rendez-vous approuvé" },
        "calendar.read": { label: "Voir vos événements à venir" },
      },
      summary:
        "Ajouter des rendez-vous à votre calendrier après votre approbation.",
    },
    google_drive: {
      accountRequirement: "Un compte Google.",
      capabilities: {
        "drive.create": {
          label:
            "Enregistrer des notes de rendez-vous dans un document après votre approbation",
        },
        "drive.read": {
          label: "Trouver les fichiers déjà conservés dans Drive",
          note: "LifeLink voit les noms et les liens des fichiers, pas leur contenu.",
        },
      },
      summary: "Trouver vos fichiers et enregistrer des notes de rendez-vous.",
    },
    imessage: {
      accountRequirement:
        "Vos contacts n’ont besoin ni d’invitation, ni de compte LifeLink, ni d’accès au tableau de bord Photon.",
      capabilities: {
        "imessage.delivery": {
          label: "Suivi de remise des messages",
          note: "LifeLink sait que votre message a été envoyé, mais pas s’il est arrivé ou a été lu.",
        },
        "imessage.first_contact": {
          label: "Commencer une conversation avec une nouvelle personne",
          note: "Chaque personne doit envoyer le premier message.",
        },
        "imessage.receive": { label: "Recevoir des réponses" },
        "imessage.send": {
          label: "Envoyer un texte ou une photo après votre approbation",
          note: "Fonctionne après l’envoi de son premier message.",
        },
      },
      summary:
        "Échanger des messages avec la famille et les amis. Chaque personne envoie le premier message.",
    },
    instacart: {
      accountRequirement: "Les achats via LifeLink ne sont plus disponibles.",
      capabilities: {},
      summary: "Les achats via LifeLink ne sont plus disponibles.",
    },
    instagram: {
      accountRequirement: "Un compte Instagram professionnel ou créateur.",
      capabilities: {
        "instagram.messages": { label: "Répondre aux messages privés" },
        "instagram.personal": { label: "Comptes personnels" },
        "instagram.post": {
          label: "Partager une publication photo après votre approbation",
        },
      },
      summary:
        "Comptes professionnels et créateurs uniquement. Prévu plus tard.",
    },
    outlook: {
      accountRequirement:
        "Un compte Microsoft. Certains comptes professionnels nécessitent l’accord d’un administrateur.",
      capabilities: {
        "calendar.create": {
          label: "Ajouter un rendez-vous approuvé à votre calendrier Outlook",
        },
        "email.draft": { label: "Rédiger un brouillon à vérifier" },
        "email.new_message_event": {
          label: "Repérer les nouveaux courriels dès leur arrivée",
        },
        "email.read_selected": {
          label: "Lire les courriels que vous choisissez pour les résumer",
        },
        "email.send": { label: "Envoyer un courriel après votre approbation" },
      },
      summary: "Courriels et calendrier Outlook en une seule connexion.",
    },
    paypal: {
      accountRequirement:
        "Les comptes PayPal personnels ne peuvent pas être connectés ici.",
      capabilities: {
        "paypal.invoices": { label: "Consulter des factures" },
        "paypal.send_money": {
          label: "Envoyer de l’argent à une personne",
          note: "LifeLink n’envoie jamais d’argent.",
        },
      },
      summary:
        "Les factures sont prévues plus tard. LifeLink n’envoie jamais d’argent.",
    },
    telegram: {
      accountRequirement:
        "Le membre de la famille ouvre le lien créé pour lui par LifeLink et appuie sur Démarrer dans Telegram.",
      capabilities: {
        "telegram.first_contact": {
          label: "Commencer une conversation avec une nouvelle personne",
          note: "Chaque personne doit d’abord appuyer sur Démarrer dans le bot.",
        },
        "telegram.receive": { label: "Recevoir des réponses" },
        "telegram.send": {
          label: "Envoyer un message ou des photos après votre approbation",
        },
      },
      summary: "Messages avec la famille sur Telegram.",
    },
  },
  realImessage: "Pour utiliser de vrais iMessages, suivez ces étapes.",
  requirements: "Ce dont vous avez besoin",
  retry: "Réessayer la connexion",
  returnConnected: "Vous revenez ici et l’état indique Connecté.",
  setup: "Configurer",
  signInProvider: (label) =>
    `Vous vous connecterez sur la page de ${label}. LifeLink ne voit jamais votre mot de passe.`,
  signInTheirAccount:
    "Connectez-vous avec le compte de cette personne, pas le vôtre.",
  status: {
    connected: "Connecté",
    disconnected: "Non connecté",
    error: "Connexion non aboutie",
    notOn: "Non activé",
    pending: "Inachevé",
    practice: "Entraînement",
    practiceAccount: "Compte d’entraînement",
    ready: "Prêt",
    realSaved: "Compte réel enregistré",
  },
  subline:
    "Connectez les services que vous utilisez déjà. Ouvrez-en un pour voir ce que LifeLink peut faire avec.",
  telegramSetup: (practice) =>
    `${practice ? "Lorsque vous utiliserez le vrai Telegram, ouvrez" : "Ouvrez"} la fiche de chaque personne dans le Cercle de confiance, choisissez Lier Telegram et envoyez-lui son lien. Cette personne appuie une fois sur Démarrer.`,
  title: "Connexions",
  unavailableFeatures: (label) =>
    `${label} ne propose encore aucune fonctionnalité dans LifeLink. Vous n’avez pas besoin de connecter un compte.`,
  unavailableIntro: (label) =>
    `LifeLink ne peut encore rien faire avec ${label}.`,
};

export { connections };

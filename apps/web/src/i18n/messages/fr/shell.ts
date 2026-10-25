import type { Messages } from "../en";

const shell: Messages["shell"] = {
  accountMenuFor: "Menu du compte de ",
  closeMenu: "Fermer le menu",
  dismissNotice: "Masquer l’avis",
  familyMember: "Membre de la famille",
  groupGames: "Jeux",
  groupHelpWith: "De l’aide pour",
  groupSetup: "Vos réglages",
  mainNavigation: "Navigation principale",
  menu: "Menu",
  nav: {
    ask: "Demander à LifeLink",
    circle: "Cercle de confiance",
    connections: "Connexions",
    documents: "Documents",
    email: "Courriels",
    family: "Famille",
    groceries: "Courses",
    mahjong: "Mahjong",
    messages: "Messages",
    scam: "Vérifier une possible arnaque",
    settings: "Paramètres",
    solitaire: "Solitaire",
    today: "Aujourd’hui",
  },
  needsReview: (label) => `${label} nécessite votre vérification.`,
  notTriedAgain: "Aucune nouvelle tentative ne sera faite automatiquement.",
  offline:
    "Vous êtes hors ligne. Vous pouvez continuer à écrire ; tout ce que vous approuvez sera vérifié à nouveau et envoyé lorsque vous serez reconnecté.",
  offlineReview: "Le travail hors ligne nécessite votre vérification",
  offlineWaiting: (count) => ` ${count} en attente.`,
  openAsk: "Ouvrir Demander à LifeLink",
  openMenu: "Ouvrir le menu",
  originalRequest: "Votre demande d’origine",
  playAccount:
    "Vos parties sont enregistrées sur cet appareil et fonctionnent hors ligne.",
  practiceBannerOn: "Le mode entraînement est activé.",
  practiceBannerRest: "Aucun vrai message n’est envoyé.",
  practiceMode: "Mode entraînement",
  reviewOnToday: "Vérifier sur Aujourd’hui",
  signOut: "Se déconnecter",
  skipToMain: "Aller au contenu principal",
  turnOffPractice: "Désactiver le mode entraînement",
  yourOfflineRequest: "Votre demande hors ligne",
};

export { shell };

import type { Messages } from "../en";

const today: Messages["today"] = {
  addPostalCode: "Ajouter votre code postal",
  allEmail: "Tous les courriels",
  allMessages: "Tous les messages",
  appointment: "Rendez-vous",
  check: "Vérifier",
  checkPostalCode: "Vérifier votre code postal",
  connect: "Connecter",
  connectMailbox:
    "Connectez Gmail ou Outlook pour voir vos nouveaux courriels ici.",
  couldNotFindTown: "Nous n’avons pas trouvé votre ville",
  dismissFailed: (error) => `${error} Appuyez sur Terminé pour réessayer.`,
  fromFamily: "De la famille et des amis",
  gettingStarted: "Premiers pas",
  gettingStartedHint:
    "Chaque étape est marquée comme terminée lorsque vous l’avez accomplie.",
  hideSteps: "Masquer ces étapes",
  latestEmail: "Derniers courriels",
  loadingBriefing: "Chargement de votre point du jour",
  loadingToday: "Chargement d’Aujourd’hui",
  messages: "Messages",
  messagesFrom: (names) =>
    `Vous avez reçu des messages de ${names} au cours des deux derniers jours.`,
  newMessage: "Nouveau message",
  news: "Actualités",
  newsGood: "Bonnes nouvelles",
  newsMoreFrom: (source) => `En savoir plus avec ${source}`,
  newsOpensNewTab: ", s’ouvre dans un nouvel onglet",
  newsSourceFrom: ", source : ",
  newsTop: "Principales actualités",
  newsType: "Type d’actualités",
  newsUnavailable:
    "Les actualités sont indisponibles pour le moment. Veuillez réessayer plus tard.",
  nextAppointment: (title, when, time) =>
    `Votre prochain rendez-vous : ${title}, ${when} à ${time}.`,
  noAppointments: "Vous n’avez aucun rendez-vous prévu cette semaine.",
  noEmail: "Aucun nouveau courriel.",
  noMessages: "Aucun nouveau message au cours des deux derniers jours.",
  noSubject: "Sans objet",
  nothingBooked: "Rien de prévu cette semaine.",
  onDay: (day) => `le ${day}`,
  openForDetails: "Ouvrir pour voir les détails",
  possibleScam: "Arnaque possible",
  readMyDay: "Lire ma journée à voix haute",
  reminder: "Rappel",
  remindersDue: (count) =>
    `${count} ${count > 1 ? "rappels à consulter" : "rappel à consulter"}.`,
  rideConfirmed: (name) => `Trajet avec ${name}, confirmé`,
  seeWeather: "Voir la météo pour vos rendez-vous",
  steps: {
    askAction: "Demander à LifeLink",
    askDescription:
      "Essayez « Rappelez-moi d’arroser les plantes à cinq heures. » Vous vérifierez toute action avant qu’elle ait lieu.",
    askTitle: "Demander un coup de main",
    emailAction: "Connecter une boîte courriel",
    emailDescription:
      "LifeLink lit les courriels avec vous et signale ce qui ressemble à une arnaque.",
    emailTitle: "Connecter votre boîte courriel",
    locationAction: "Ajouter le code postal",
    locationDescription:
      "LifeLink affiche la météo sur Aujourd’hui et à côté de chaque rendez-vous.",
    locationTitle: "Ajouter votre code postal",
    trustedAction: "Ajouter une personne",
    trustedDescription:
      "Choisissez qui peut vous aider pour les trajets et ce que ces personnes peuvent voir. Vous gardez la main.",
    trustedTitle: "Ajouter une personne de confiance",
  },
  title: "Aujourd’hui",
  titlePrefix: "Aujourd’hui : ",
  todayLower: "aujourd’hui",
  tomorrowLower: "demain",
  weatherHigh: ", maximum ",
  weatherPrefix: ", météo : ",
  yourWeek: "Votre semaine",
};

export { today };

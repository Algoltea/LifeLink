import type { Messages } from "../en";

const actionDetails: Messages["actionDetails"] = {
  and: " et ",
  budget: (amount) => ` Budget : ${amount}.`,
  by: (channel) => `Par ${channel}`,
  calendar: "Calendrier",
  confirming: "Vous confirmez",
  document: "Document",
  draftSavedIn: (provider) =>
    `Enregistré comme brouillon dans votre ${provider}. Il ne sera envoyé que lorsque vous l’enverrez depuis ce service.`,
  driveNoteHint:
    "Cette note est enregistrée comme nouveau document dans votre Google Drive. Vous seul pouvez la voir, sauf si vous la partagez depuis Drive.",
  estimate: (amount) => `Votre estimation : ${amount}.`,
  event: "Événement",
  itemCount: (name, count) =>
    `${name} : ${count} ${count > 1 ? "articles" : "article"}`,
  noEstimate: "Pas encore d’estimation.",
  noJustYou: "Non, seulement vous",
  notGiven: "Non précisé",
  onlyGrantees: (names, scope) =>
    `Seules ces personnes verront ceci : ${names}, car vous partagez avec elles les informations suivantes : ${scope}.`,
  peopleYouAllowed: "les personnes que vous avez autorisées",
  readEmail: "Lire le courriel à voix haute",
  readMessage: "Lire le message à voix haute",
  readNote: "Lire la note à voix haute",
  readUpdate: "Lire les nouvelles à voix haute",
  reminder: "Rappel",
  sharedWithCircle: "Partagé avec votre cercle de confiance",
  shoppingRecord:
    "Ceci est la trace d’une ancienne demande de courses. Les achats via LifeLink ne sont plus disponibles.",
  spoken: {
    calendar: (title, when, location) =>
      `${title}. ${when}${location ? `, à ${location}` : ""}.`,
    confirm: (summary) => `Vous confirmez : ${summary}`,
    driveNote: (title, body) =>
      `Une note dans votre Google Drive intitulée ${title}. Elle dit : ${body}`,
    email: (to, subject, body) =>
      `Courriel à ${to}. Objet : ${subject}. Il dit : ${body}`,
    emailAloud: (subject, body) => `Objet : ${subject}. ${body}`,
    message: (name, channel, route, body) =>
      `À ${name}, par ${channel}${route}. Le message dit : ${body}`,
    reminder: (title, when, shared) =>
      `Rappel : ${title}. ${when}. ${shared ? "Partagé avec votre cercle de confiance." : "Seulement pour vous."}`,
    update: (text) => `Voici les nouvelles : ${text}`,
  },
  starts: "Début",
  subject: "Objet",
  thisScope: "ces informations",
  to: "À",
  toAddress: (address) => ` à ${address}`,
  toName: (name) => `À ${name}`,
  when: "Quand",
  where: "Où",
  withPhotos: (count) => `Avec ${count} ${count > 1 ? "photos" : "photo"}.`,
  yesShared: "Oui",
};

export { actionDetails };

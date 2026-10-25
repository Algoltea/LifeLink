import type { Messages } from "../en";

const circle: Messages["circle"] = {
  addPerson: "Aggiungi una persona",
  contactFallback: "Contatto",
  edit: "Modifica",
  editPerson: (name) => `Modifica ${name}`,
  empty:
    "Aggiunga una persona di fiducia. Potrà scriverle e scegliere cosa può vedere in LifeLink. Aggiungere una persona non condivide nulla.",
  keep: "Mantieni",
  loadingPeople: "Caricamento delle persone",
  message: "Messaggio",
  people: "Persone",
  peopleCount: (count) => `${count} ${count === 1 ? "persona" : "persone"}`,
  permissions: "Permessi",
  permissionsFor: (name) => ` per ${name}`,
  practiceContact: "Contatto di prova",
  reachNone: "Nessun recapito disponibile",
  reachTelegramWaiting: "Telegram: in attesa che prema Avvia",
  reachWhatsappSaved:
    "WhatsApp salvato. Non è ancora possibile inviare messaggi",
  reachedBy: {
    discord: "Contattabile su Discord",
    email: "Contattabile via email",
    imessage: "Contattabile su iMessage",
    in_app: "Contattabile in LifeLink",
    telegram: "Contattabile su Telegram",
  },
  removeConfirm: (firstName) => `Rimuovi ${firstName}`,
  removeDescription: (name) =>
    `${name} verrà rimosso dalla cerchia e ogni condivisione con questa persona terminerà subito.`,
  removeFailed: (error) =>
    `Non è stato possibile rimuovere la persona. ${error} Prema di nuovo Rimuovi.`,
  removeFallback: "Rimuovi",
  removeNamed: (firstName) => `Rimuovi ${firstName}…`,
  removePerson: "Rimuovi questa persona…",
  removeStopsSharing: (firstName) =>
    `Rimuovendo ${firstName}, terminerà anche ogni condivisione con questa persona.`,
  removeTitle: (name) => `Rimuovere ${name}?`,
  removed: (name) => `${name}: rimozione completata.`,
  removing: "Rimozione…",
  subline:
    "Le persone di cui si fida, come contattarle e cosa può vedere ciascuna.",
  title: "Cerchia di fiducia",
  trusted: "Di fiducia",
};

export { circle };

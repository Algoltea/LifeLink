import type { Messages } from "../en";

const circle: Messages["circle"] = {
  addPerson: "Person hinzufügen",
  contactFallback: "Kontakt",
  edit: "Bearbeiten",
  editPerson: (name) => `${name} bearbeiten`,
  empty:
    "Fügen Sie eine Person hinzu, der Sie vertrauen. Sie können ihr schreiben und festlegen, was sie in LifeLink sehen darf. Allein durch das Hinzufügen wird nichts geteilt.",
  keep: "Behalten",
  loadingPeople: "Personen werden geladen",
  message: "Nachricht",
  people: "Personen",
  peopleCount: (count) => `${count} ${count === 1 ? "Person" : "Personen"}`,
  permissions: "Berechtigungen",
  permissionsFor: (name) => ` für ${name}`,
  practiceContact: "Übungskontakt",
  reachNone: "Noch keine Kontaktmöglichkeit",
  reachTelegramWaiting:
    "Telegram: wartet darauf, dass die Person auf Start tippt",
  reachWhatsappSaved: "WhatsApp gespeichert. Nachrichten noch nicht möglich",
  reachedBy: {
    discord: "Über Discord erreichbar",
    email: "Per E-Mail erreichbar",
    imessage: "Über iMessage erreichbar",
    in_app: "In LifeLink erreichbar",
    telegram: "Über Telegram erreichbar",
  },
  removeConfirm: (firstName) => `${firstName} entfernen`,
  removeDescription: (name) =>
    `${name} wird entfernt. Alles, was Sie mit dieser Person teilen, wird sofort nicht mehr geteilt.`,
  removeFailed: (error) =>
    `Die Person konnte nicht entfernt werden. ${error} Wählen Sie erneut „Entfernen“.`,
  removeFallback: "Entfernen",
  removeNamed: (firstName) => `${firstName} entfernen…`,
  removePerson: "Diese Person entfernen…",
  removeStopsSharing: (firstName) =>
    `Wenn Sie ${firstName} entfernen, wird auch nichts mehr mit dieser Person geteilt.`,
  removeTitle: (name) => `${name} entfernen?`,
  removed: (name) => `${name} wurde entfernt.`,
  removing: "Wird entfernt…",
  subline:
    "Die Menschen, denen Sie vertrauen, ihre Kontaktmöglichkeiten und genau das, was sie jeweils sehen können.",
  title: "Vertrauenskreis",
  trusted: "Vertraut",
};

export { circle };

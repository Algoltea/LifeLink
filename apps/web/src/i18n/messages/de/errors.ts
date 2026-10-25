import type { Messages } from "../en";

const errors: Messages["errors"] = {
  goToToday: "Zu Heute",
  notFoundBody:
    "Der Link ist vielleicht veraltet oder die Adresse enthält einen Tippfehler. Es wurde nichts geändert.",
  notFoundTitle: "Hier gibt es keine Seite",
  pageBody:
    "Es wurde nichts gesendet oder geändert. Meist ist es ein kurzes Verbindungsproblem. Ein erneuter Versuch hilft oft.",
  pageTitle: "Diese Seite wurde nicht geladen",
};

export { errors };

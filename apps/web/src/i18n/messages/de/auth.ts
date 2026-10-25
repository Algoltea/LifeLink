import type { Messages } from "../en";

const auth: Messages["auth"] = {
  busy: "Einen Moment bitte…",
  connectionFailed:
    "Die Verbindung konnte nicht hergestellt werden. Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.",
  createAccount: "Konto erstellen",
  createFailed:
    "Das Konto konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
  createTitle: "Erstellen Sie Ihr Konto",
  credentialsMismatch:
    "E-Mail-Adresse und Passwort stimmen nicht überein. Bitte prüfen Sie beides und versuchen Sie es erneut.",
  email: "E-Mail",
  friend: "Freundin oder Freund",
  fullName: "Ihr vollständiger Name",
  hide: "Ausblenden",
  hidePassword: "Passwort ausblenden",
  intro:
    "LifeLink hilft Ihnen, mit Ihrer Familie in Kontakt zu bleiben und Ihren Tag im Blick zu behalten. Ohne Ihre Zustimmung wird nichts gesendet.",
  minimumPassword: (count) =>
    `Bitte wählen Sie ein Passwort mit mindestens ${count} Zeichen.`,
  modeLabel: "Anmelden oder Konto erstellen",
  password: "Passwort",
  passwordHint: (count) => `Mindestens ${count} Zeichen.`,
  playGuest: "Solitaire ohne Anmeldung spielen",
  show: "Anzeigen",
  showPassword: "Passwort anzeigen",
  signIn: "Anmelden",
  signUp: "Ein Konto erstellen",
  takingBreak: "Machen Sie gerade eine Pause?",
  welcome: "Willkommen zurück",
};

export { auth };

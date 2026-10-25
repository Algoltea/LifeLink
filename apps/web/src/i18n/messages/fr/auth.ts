import type { Messages } from "../en";

const auth: Messages["auth"] = {
  busy: "Un instant…",
  connectionFailed:
    "La connexion n’a pas abouti. Vérifiez votre connexion Internet et réessayez.",
  createAccount: "Créer un compte",
  createFailed: "Nous n’avons pas pu créer le compte. Veuillez réessayer.",
  createTitle: "Créez votre compte",
  credentialsMismatch:
    "Cette adresse courriel et ce mot de passe ne correspondent pas. Veuillez les vérifier et réessayer.",
  email: "Adresse courriel",
  friend: "Ami",
  fullName: "Votre nom complet",
  hide: "Masquer",
  hidePassword: "Masquer le mot de passe",
  intro:
    "LifeLink vous aide à garder le contact avec votre famille et à organiser votre journée. Rien n’est envoyé sans votre accord.",
  minimumPassword: (count) =>
    `Veuillez choisir un mot de passe d’au moins ${count} caractères.`,
  modeLabel: "Se connecter ou créer un compte",
  password: "Mot de passe",
  passwordHint: (count) => `Au moins ${count} caractères.`,
  playGuest: "Jouer au Solitaire sans se connecter",
  show: "Afficher",
  showPassword: "Afficher le mot de passe",
  signIn: "Se connecter",
  signUp: "Créer un compte",
  takingBreak: "Envie d’une petite pause ?",
  welcome: "Heureux de vous retrouver",
};

export { auth };

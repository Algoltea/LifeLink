import type { Messages } from "../en";

const auth: Messages["auth"] = {
  busy: "Un momento…",
  connectionFailed:
    "Non è stato possibile collegarsi. Controlli la connessione a Internet e riprovi.",
  createAccount: "Crea account",
  createFailed: "Non è stato possibile creare l’account. Riprovi.",
  createTitle: "Crei il Suo account",
  credentialsMismatch:
    "L’indirizzo email e la password non corrispondono. Li controlli e riprovi.",
  email: "Email",
  friend: "Persona amica",
  fullName: "Il Suo nome completo",
  hide: "Nascondi",
  hidePassword: "Nascondi password",
  intro:
    "LifeLink La aiuta a restare in contatto con la famiglia e a organizzare la giornata. Nulla viene inviato senza il Suo consenso.",
  minimumPassword: (count) =>
    `Scelga una password di almeno ${count} caratteri.`,
  modeLabel: "Accedi o crea un account",
  password: "Password",
  passwordHint: (count) => `Almeno ${count} caratteri.`,
  playGuest: "Gioca a Solitario senza accedere",
  show: "Mostra",
  showPassword: "Mostra password",
  signIn: "Accedi",
  signUp: "Crea un account",
  takingBreak: "Si concede una pausa?",
  welcome: "È un piacere ritrovarLa",
};

export { auth };

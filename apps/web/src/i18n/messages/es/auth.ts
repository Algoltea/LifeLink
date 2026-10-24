import type { auth as english } from "../en/auth";

const auth: typeof english = {
  busy: "Un momento…",
  connectionFailed:
    "No pudimos conectarnos. Revise su conexión a internet e inténtelo de nuevo.",
  createAccount: "Crear cuenta",
  createFailed: "No pudimos crear la cuenta. Inténtelo de nuevo.",
  createTitle: "Cree su cuenta",
  credentialsMismatch:
    "El correo y la contraseña no coinciden. Revíselos e inténtelo de nuevo.",
  email: "Correo electrónico",
  friend: "Amigo",
  fullName: "Su nombre completo",
  hide: "Ocultar",
  hidePassword: "Ocultar contraseña",
  intro:
    "LifeLink le ayuda a mantenerse en contacto con su familia y a organizar su día. No se envía nada sin su permiso.",
  minimumPassword: (count: number) =>
    `Elija una contraseña de al menos ${count} caracteres.`,
  modeLabel: "Iniciar sesión o crear una cuenta",
  password: "Contraseña",
  passwordHint: (count: number) => `Al menos ${count} caracteres.`,
  playGuest: "Jugar al solitario sin iniciar sesión",
  show: "Mostrar",
  showPassword: "Mostrar contraseña",
  signIn: "Iniciar sesión",
  signUp: "Crear una cuenta",
  takingBreak: "¿Solo quiere descansar un rato?",
  welcome: "Le damos la bienvenida de nuevo",
};

export { auth };

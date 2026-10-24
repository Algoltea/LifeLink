import type { auth as english } from "../en/auth";

const auth: typeof english = {
  busy: "Un momento…",
  connectionFailed:
    "No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.",
  createAccount: "Crear cuenta",
  createFailed: "No pudimos crear la cuenta. Inténtalo de nuevo.",
  createTitle: "Crea tu cuenta",
  credentialsMismatch:
    "El correo y la contraseña no coinciden. Revísalos e inténtalo de nuevo.",
  email: "Correo electrónico",
  friend: "Amigo",
  fullName: "Tu nombre completo",
  hide: "Ocultar",
  hidePassword: "Ocultar contraseña",
  intro:
    "LifeLink te ayuda a mantenerte en contacto con tu familia y a organizar tu día. No se envía nada sin tu permiso.",
  minimumPassword: (count: number) =>
    `Elige una contraseña de al menos ${count} caracteres.`,
  modeLabel: "Iniciar sesión o crear una cuenta",
  password: "Contraseña",
  passwordHint: (count: number) => `Al menos ${count} caracteres.`,
  playGuest: "Jugar al solitario sin iniciar sesión",
  show: "Mostrar",
  showPassword: "Mostrar contraseña",
  signIn: "Iniciar sesión",
  signUp: "Crear una cuenta",
  takingBreak: "¿Solo quieres descansar un rato?",
  welcome: "Te damos la bienvenida de nuevo",
};

export { auth };

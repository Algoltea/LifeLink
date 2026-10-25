import type { Messages } from "../en";

const auth: Messages["auth"] = {
  busy: "Um momento…",
  connectionFailed:
    "Não foi possível conectar. Verifique sua conexão com a internet e tente novamente.",
  createAccount: "Criar conta",
  createFailed: "Não foi possível criar a conta. Tente novamente.",
  createTitle: "Crie sua conta",
  credentialsMismatch:
    "O e-mail e a senha não correspondem. Confira os dados e tente novamente.",
  email: "E-mail",
  friend: "Pessoa amiga",
  fullName: "Seu nome completo",
  hide: "Ocultar",
  hidePassword: "Ocultar senha",
  intro:
    "O LifeLink ajuda você a manter contato com a família e a organizar seu dia. Nada é enviado sem sua autorização.",
  minimumPassword: (count) =>
    `Escolha uma senha com pelo menos ${count} caracteres.`,
  modeLabel: "Entrar ou criar uma conta",
  password: "Senha",
  passwordHint: (count) => `Pelo menos ${count} caracteres.`,
  playGuest: "Jogar Paciência sem entrar",
  show: "Mostrar",
  showPassword: "Mostrar senha",
  signIn: "Entrar",
  signUp: "Criar uma conta",
  takingBreak: "Quer fazer uma pausa?",
  welcome: "Que bom ter você de volta",
};

export { auth };

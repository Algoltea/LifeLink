import type { Messages } from "../en";

const auth: Messages["auth"] = {
  busy: "Sandali lang po…",
  connectionFailed:
    "Hindi po makakonekta. Pakitingnan ang inyong internet at subukan ulit.",
  createAccount: "Gumawa ng account",
  createFailed: "Hindi po nagawa ang account. Pakisubukan ulit.",
  createTitle: "Gumawa ng inyong account",
  credentialsMismatch:
    "Hindi nagtugma ang email at password. Pakitingnan po at subukan ulit.",
  email: "Email",
  friend: "Kaibigan",
  fullName: "Buong pangalan ninyo",
  hide: "Itago",
  hidePassword: "Itago ang password",
  intro:
    "Tinutulungan kayo ng LifeLink na makaugnayan ang pamilya at masubaybayan ang inyong araw. Wala pong ipinapadala nang walang pahintulot ninyo.",
  minimumPassword: (count) =>
    `Pumili po ng password na may hindi bababa sa ${count} character.`,
  modeLabel: "Mag-sign in o gumawa ng account",
  password: "Password",
  passwordHint: (count) => `Hindi bababa sa ${count} character.`,
  playGuest: "Maglaro ng Solitaire nang hindi nagsa-sign in",
  show: "Ipakita",
  showPassword: "Ipakita ang password",
  signIn: "Mag-sign in",
  signUp: "Gumawa ng account",
  takingBreak: "Nagpapahinga lang po ba kayo?",
  welcome: "Maligayang pagbabalik",
};

export { auth };

const auth = {
  busy: "One moment…",
  connectionFailed:
    "We couldn’t connect. Check your internet connection and try again.",
  createAccount: "Create account",
  createFailed: "We could not create the account. Please try again.",
  createTitle: "Create your account",
  credentialsMismatch:
    "That email and password did not match. Please check them and try again.",
  email: "Email",
  friend: "Friend",
  fullName: "Your full name",
  hide: "Hide",
  hidePassword: "Hide password",
  intro:
    "LifeLink helps you keep in touch with family and keep track of your day. Nothing is sent without your say-so.",
  minimumPassword: (count: number) =>
    `Please choose a password of at least ${count} characters.`,
  modeLabel: "Sign in or create an account",
  password: "Password",
  passwordHint: (count: number) => `At least ${count} characters.`,
  playGuest: "Play Solitaire without signing in",
  show: "Show",
  showPassword: "Show password",
  signIn: "Sign in",
  signUp: "Create an account",
  takingBreak: "Just taking a break?",
  welcome: "Welcome back",
};

export { auth };

import type { Messages } from "../en";

const appExtras: Messages["appExtras"] = {
  approvalRecorded: (label) => `Naitala ang pag-apruba: ${label}`,
  loading: {
    addPerson: "Magdagdag ng tao",
    addPhoto: "Magdagdag ng larawan",
    app: "Nilo-load ang LifeLink",
    beforeSending: "bago ipadala",
    call: "Tawag",
    checkPhoto: "Suriin ang larawang ito",
    checks: "Nilo-load ang inyong mga pagsusuri",
    chooseFile: "Pumili ng file para makita ang paunang pagtingin dito.",
    choosePhoto: "Pumili ng larawan",
    circle: "Nilo-load ang inyong mga pinagkakatiwalaan",
    circleBody:
      "Ang mga taong pinagkakatiwalaan ninyo, paano sila makauugnayan, at kung ano mismo ang makikita ng bawat isa.",
    circleTitle: "Mga pinagkakatiwalaan",
    connectEmail: "Ikonekta ang Gmail o Outlook",
    connections: "Nilo-load ang mga koneksyon",
    connectionsBody:
      "Piliin kung saan ninyo kailangan ng tulong. Buksan ang card para makita ang lahat ng magagawa nito bago ikonekta.",
    connectionsTitle: "Mga koneksyon",
    conversation: "Nilo-load ang usapan",
    conversations: "Nilo-load ang mga usapan",
    conversationsTitle: "Mga usapan",
    documentsTitle: "Mga dokumento",
    drive: "Nilo-load ang inyong mga file sa Drive",
    driveNotice:
      "Drive para sa pagsasanay na may mga halimbawang file at mga talang sine-save ninyo sa mode ng pagsasanay. Walang galing sa totoong Google account dito.",
    earlierChecks: "Mga naunang pagsusuri",
    edit: "Baguhin",
    email: "Nilo-load ang email",
    emailTitle: "Email",
    emails: "Nilo-load ang mga email",
    familyBody:
      "Makita lang ang piniling ibahagi ng bawat tao. Maaari kayong tumingin, pero hindi kailanman magpadala, mag-apruba, o gumastos para sa kanila.",
    familyTitle: "Pamilya",
    groceriesBody:
      "Magtago ng listahan ng bibilhin, planuhin ang badyet, at kopyahin o i-print ang kailangan ninyo.",
    groceriesTitle: "Mga bibilhin",
    helpUnderstand: "Tulungan akong maunawaan",
    inbox: "Inbox",
    listenCall: "Makinig sa tawag",
    lists: "Nilo-load ang inyong mga listahan",
    message: "Magpadala ng mensahe",
    messagesBody:
      "Sumulat sa inyong mga pinagkakatiwalaan. Makikita ninyo ang bawat mensahe bago ito ipadala.",
    messagesTitle: "Mga mensahe",
    notSharing: "Wala kayong ibinabahagi kaninuman.",
    page: "Nilo-load ang inyong pahina",
    permissions: "Mga pahintulot",
    photo: "Larawan",
    practiceCall: "Subukan ang tawag para sa pagsasanay",
    practiceMessage: "Pagsasanay: walang ipapadala sa kanila.",
    readAloud: "Basahin nang malakas",
    readDay: "Basahin nang malakas ang aking araw",
    recap: "Buod",
    recapBody:
      "Maaaring ibuod ng LifeLink ang napagkasunduan ninyo ng pamilya, ang inalok lamang, at ang mga hindi pa napagpapasyahan.",
    recapConversation: "Ibuod ang usapang ito",
    recapPractice:
      "Sa mode ng pagsasanay, LifeLink mismo ang gumagawa ng buod. Hindi kailanman ipinapadala ang mga mensahe sa pagsasanay sa tagapagbigay ng AI.",
    review: "Suriin",
    scamBody:
      "Hindi po sigurado sa mensahe o tawag? Hinahanap ng LifeLink ang mga babala bago kayo kumilos.",
    scamTitle: "Suriin kung may panloloko",
    settings: "Nilo-load ang mga setting",
    settingsBody:
      "Gawing komportable sa inyo ang pagbasa at pakikinig sa LifeLink.",
    settingsTitle: "Mga setting",
    shared: "Nilo-load ang ibinahaging impormasyon",
    startListening: "Simulang makinig",
    takePhoto: "Kumuha ng larawan",
    task: "Nilo-load ang detalye ng gawain",
    text: "Teksto",
    thisConversation: "usapang ito",
    today: "Nilo-load ang Ngayon",
    yourFiles: "Inyong mga file",
  },
  openingFamily: "Binubuksan ang inyong tanaw ng pamilya",
  phone: {
    allCountries: "Lahat ng bansa",
    common: "Karaniwan",
    countryCode: "Country code",
    other: "Iba: ilagay mismo ang + code",
  },
  signIn: {
    backHome: "Bumalik sa home",
    body: "Mag-sign in para makita ang mga mensahe at appointment ngayon. Wala pong ipinapadala hanggang pumayag kayo.",
    breakPrompt: "Nagpapahinga lang po ba kayo?",
    busy: "Sandali lang po…",
    connectionError:
      "Hindi po makakonekta. Pakitingnan ang inyong internet at subukan ulit.",
    createAccount: "Gumawa ng account",
    createBody:
      "Mga isang minuto lang ito. Maaari ninyong idagdag ang pamilya pagkatapos.",
    createError: "Hindi po nagawa ang account. Pakisubukan ulit.",
    createOption: "Gumawa ng account",
    createTitle: "Magsimula.",
    email: "Email",
    friend: "Kaibigan",
    hide: "Itago",
    hidePassword: "Itago ang password",
    mismatch:
      "Hindi nagtugma ang email at password. Pakitingnan po at subukan ulit.",
    modeLabel: "Mag-sign in o gumawa ng account",
    name: "Buong pangalan ninyo",
    or: ", o ",
    paintingAlt: {
      "sign-in":
        "Claude Monet, Woman with a Parasol: isang babaeng may berdeng payong sa mahanging burol sa ilalim ng maliwanag na langit, kasama ang batang anak na lalaki sa damuhan malapit sa kanya.",
      "sign-up":
        "Georges Seurat, A Sunday Afternoon on the Island of La Grande Jatte: mga taong nagpapahinga sa maaraw na damuhan sa tabing-ilog; may magkaparehang nakapayong sa tabi ng maliit na aso at alagang unggoy.",
    },
    password: "Password",
    passwordHint: (count) => `Hindi bababa sa ${count} character.`,
    passwordMinimum: (count) =>
      `Pumili po ng password na may hindi bababa sa ${count} character.`,
    play: "Maglaro ng Solitaire nang hindi nagsa-sign in",
    playMahjong: "maglaro ng Mahjong",
    show: "Ipakita",
    showPassword: "Ipakita ang password",
    signIn: "Mag-sign in",
    welcome: "Maligayang pagbabalik.",
  },
  timeZone: {
    all: "Lahat ng sona ng oras",
    common: "Karaniwan",
  },
};

export { appExtras };

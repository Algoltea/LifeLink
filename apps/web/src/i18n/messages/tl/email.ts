import type { Messages } from "../en";

const email: Messages["email"] = {
  aboutChecks: "Tungkol sa pagsusuri sa panloloko",
  appointmentAdded: "Naidagdag na ito sa Inyong linggo sa pahina ng Ngayon.",
  appointmentFound: "May nahanap na appointment",
  backToInbox: "Bumalik sa inbox",
  checkAnother: "Suriin ang ibang mensahe",
  checkCouldNotFinish: (error) =>
    `Hindi natapos ang pagsusuri sa panloloko. ${error}`,
  checkFirst: "Suriin ang mga karaniwang babala bago kumilos.",
  checkForNew: "Tingnan kung may bagong email",
  checkManually: " Maaari po ninyo itong suriin sa ibaba.",
  checkThis: "Suriin ang email na ito",
  checked: (when) => `Nasuri noong ${when}`,
  checkedAt: (when) => ` Nasuri noong ${when}.`,
  checking: "Sinusuri…",
  checksAutomatic:
    "Kapag naka-on ang pagsusuri ng email gamit ang AI sa Mga setting, maaaring ipadala ang mga bagong totoong email sa tagapagbigay ng AI sa cloud. Nananatili sa LifeLink ang email sa pagsasanay. Ginagamit ang mga lokal na tuntuning para lamang sa Ingles kapag naka-off, hindi available, o hindi natapos ang AI sa cloud. Kahit nabigo ang kahilingan sa cloud, maaaring naipadala na ang email sa tagapagbigay. Hindi mapapatunayan ng alinmang paraan ang nagpadala o na ligtas ang email.",
  checksIntro:
    "Sinusuri sa LifeLink ang bagong email para sa mga karaniwang palatandaan ng panloloko. Pumili ng mensahe para basahin at makita ang mga napansin.",
  checksTitle: "Paano gumagana ang pagsusuri ng email",
  chooseEmail:
    "Pumili ng email para basahin at makita ang pagsusuri sa panloloko.",
  cloudCheckNotice:
    "Tumulong ang AI sa cloud sa pagsusuri ng email na ito. Maaari itong magkamali at hindi nito mapapatunayan ang nagpadala. Hindi nangangahulugang ligtas ang email kapag walang babala.",
  cloudConsent:
    "Ipadala ang email na ito sa serbisyo ng AI sa cloud para ibuod at makita kung may appointment. Huwag lagyan ng tsek para sa maikling paunang pagtingin na ginawa sa LifeLink.",
  concern:
    "May nakababahala sa email na ito. Suriin ang kahilingan bago kumilos.",
  connectMailbox: "Ikonekta ang Gmail o Outlook",
  connected: (list) => `Nakakonekta: ${list}.`,
  countEmails: (count) => `${count} email`,
  empty:
    "Wala pang email dito. Ikonekta ang mailbox, saka piliin ang “Tingnan kung may bagong email” para i-import ang mga kamakailang mensahe.",
  from: "Mula kay ",
  helpMeUnderstand: "Tulungan akong maunawaan",
  inbox: "Inbox",
  linksNotOpened:
    "Hindi binubuksan ng LifeLink ang mga link sa email. Kung humihingi ito ng pera o pribadong detalye, suriin muna.",
  loadingEmail: "Nilo-load ang email",
  loadingEmails: "Nilo-load ang mga email",
  localLanguageNotice:
    "Gumamit ang pagsusuring ito ng mga lokal na tuntuning para lamang sa Ingles. Maaaring hindi nito mapansin ang panloloko sa Espanyol at ibang wika. Hindi nangangahulugang ligtas ang email kapag walang babala.",
  lowerPriority: "Hindi gaanong prayoridad",
  mailboxes: "Inyong mga mailbox",
  mayNeedReply: "Maaaring kailangan ng tugon",
  needsAttention: (label, error) =>
    `Kailangang tingnan ang ${label}${error ? `: ${error}` : "."}`,
  newEmails: (count) =>
    count === 0 ? "Walang bagong email." : `May ${count} bagong email.`,
  noMailbox: "Walang nakakonektang mailbox.",
  noSigns: "Walang nakitang babala. Hindi pa kumpirmado ang nagpadala.",
  noSubject: "(Walang paksa)",
  noSubjectSpoken: "Walang paksa",
  noText: "Walang teksto ang email na ito.",
  notChecked: "Hindi pa nasusuri",
  notCheckedEmail: "Hindi pa nasusuri ang email na ito.",
  notCheckedNote: "Hindi pa nasusuri",
  nowTheEmail: "Ngayon, ang email.",
  openManualCheck: "Buksan ang mano-manong pagsusuri sa panloloko",
  opened: (subject) => `Nabuksan: ${subject}`,
  paging: {
    loadOlder: "I-load ang mga mas lumang email",
    loading: "Naglo-load…",
    newer: "Mas bago",
    noMoreImported:
      "Walang karagdagang email na na-import. Subukan ang susunod na pangkat kung may mas lumang email pa.",
    noOlder: "Wala nang mas lumang email.",
    older: "Mga mas lumang email",
    page: (page) => `Pahina ${page} · Hanggang 15 email bawat pagkakataon`,
  },
  preview: "Ipakita ang maikling paunang pagtingin",
  readSummary: "Basahin nang malakas ang buod",
  readingNow: "Binabasa na…",
  readyToRead: "Handa nang basahin",
  reconnect: "Ikonekta ulit",
  reply: "Tumugon",
  replyAdded:
    "Naidagdag ang tugon sa inyong burador. Maaari ninyo itong baguhin bago suriin.",
  replyComposer: {
    nothingSent: (provider) =>
      `Wala pong ipinapadala. Susuriin muna ninyo ito, saka ise-save bilang burador sa inyong ${provider}.`,
    placeholder: "Isulat ang inyong tugon…",
    replyTo: (to) => `Tumugon kay ${to}`,
    review: "Suriin ang burador",
    speak: "Magsalita",
    stopListening: "Ihinto ang pakikinig",
  },
  ride: {
    asked: "Humiling na kayo ng maghahatid.",
    confirmed: "Kumpirmado na ang inyong masasakyan.",
    declined: "Tinanggihan ang hiling na maghatid.",
  },
  sampleEmails:
    " Mga halimbawang email po ito para ligtas kayong makapagsanay.",
  scamCheck: "Suriin kung may panloloko",
  scamCheckNotDone: "Hindi pa nasusuri kung may panloloko",
  scamSigns:
    "May mga palatandaan ito ng panloloko. Pakisuri po bago gawin ang anumang hinihiling nito.",
  spokenFrom: (subject, from, body) => `${subject}. Mula kay ${from}. ${body}`,
  summarizeCloud: "Ibuod gamit ang AI sa cloud",
  summary: "Buod",
  summaryNote:
    "Kumuha ng maikling paunang pagtingin sa LifeLink, o piliin ang AI sa cloud",
  summarySpoken: "Buod ng email.",
  theEmail: "Ang email",
  title: "Email",
  unknownCheckNotice:
    "Hindi nakasaad sa naka-save na pagsusuring ito kung gumamit ng AI sa cloud o mga lokal na tuntunin. Ingles lang ang saklaw ng mga lokal na tuntunin, kaya maaaring hindi mapansin ang panloloko sa ibang wika. Hindi nangangahulugang ligtas ang email kapag walang babala.",
  warning: {
    concern:
      "May nakababahala sa email na ito. Suriin ang kahilingan bago kumilos.",
    intro: (reason) =>
      `Posibleng panloloko. ${reason} Kung hindi kayo sigurado, magtanong po sa taong pinagkakatiwalaan bago tumugon, magbukas ng link, magpadala ng pera, o magbahagi ng personal na detalye.`,
    signs: (signs) => `Mga babala: ${signs}.`,
  },
  warningSigns: "Mga babala",
  warningSignsFound: "May nakitang mga babala",
  whatShouldIDo: "Ano ang dapat kong gawin?",
};

export { email };

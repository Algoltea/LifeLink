import type { Messages } from "../en";

const scam: Messages["scam"] = {
  addNote: "May idaragdag po ba? (opsyonal)",
  addNotePlaceholder: "Halimbawa, kung sino raw ang nagpadala",
  ask: "Magtanong sa taong pinagkakatiwalaan",
  callCheckTitle: "Pagsusuri sa tawag kung may panloloko",
  checkSomethingElse: "Suriin ang iba",
  checking: "Sinusuri",
  checkingMessage: "Sinusuri ang mensahe…",
  chooseEmail: "Pumili ng email",
  chooseRecent: "Pumili mula sa inyong mga kamakailang email",
  cloudNote:
    "Babasahin ito ng serbisyo ng AI para suriin. Huwag isama ang mga password at numero ng card.",
  didNotFinish: "Hindi natapos",
  earlier: "Mga naunang pagsusuri",
  earlierEmpty:
    "Dito lalabas ang mga pagsusuri sa inyong mensahe, larawan, at tawag.",
  emailMissing:
    "Wala ang email na ito sa kamakailang inbox. Pumili ng ibang email o i-type ang mga salita nito sa ibaba.",
  from: (sender) => `Mula kay ${sender}`,
  guidance: {
    ai: "Tumutulong ang serbisyo ng AI sa pagsusuri ng mensahe at larawan. Nakatabi ang larawan kasama ng pagsusuri hanggang burahin ninyo ito. Hindi gumagamit ng AI ang pagsusuri sa pagsasanay.",
    intro:
      "Hinahanap ng pagsusuri ang mga karaniwang babala. Hindi nito makukumpirma kung sino ang nagpadala o kung totoo ang mensahe.",
    next: "Basahin ang resulta, sundin ang “Ang gagawin ngayon”, o humingi ng opinyon sa taong pinagkakatiwalaan. Kayo po ang magpapasya sa susunod na mangyayari.",
    title: "Ano ang masasabi sa akin ng pagsusuri sa panloloko?",
  },
  howToShow: "Paano ninyo gustong ipakita ang mensahe?",
  loadingEarlier: "Nilo-load ang mga naunang pagsusuri",
  loadingEmail: "Nilo-load ang email na ito",
  loadingEmails: "Nilo-load ang inyong mga email",
  localNote:
    "Hindi available ngayon ang pagsusuri ng AI. Ginagamit ng LifeLink ang mga karaniwang babala.",
  messageWords: "Mga salita ng mensahe",
  messageWordsPlaceholder: "Idikit o i-type ang mga salita rito",
  noLongerAvailable:
    "Hindi na available ang pagsusuring ito. Maaari kayong magsimula ng bago.",
  noRecentEmails: "Walang kamakailang email na mapipili. ",
  noRecentEmailsRest: ", o i-type na lang ang mga salita ng mensahe.",
  noSubject: "(Walang paksa)",
  openEmail: "Buksan ang Email",
  opening: "Binubuksan ang inyong pagsusuri",
  photo: {
    availabilityChecking:
      "Tinitingnan kung available ang pagsusuri ng larawan…",
    practice:
      "Naka-on ang mode ng pagsasanay. Hindi sinusuri o ipinapadala sa serbisyo ng AI ang mga larawan.",
    unavailable:
      "Hindi available ngayon ang pagsusuri ng larawan. Hindi ia-upload ang inyong larawan.",
    unavailableType:
      "Hindi available ang pagsusuri ng larawan. I-type na lang ang mga salita.",
  },
  practiceEmailNote:
    "Email ito para sa pagsasanay. Sinusuri ito sa device na ito nang walang AI sa cloud.",
  practiceNote:
    "Ginagamit ng pagsusuri sa pagsasanay ang mga karaniwang babala. Walang ipinapadala sa serbisyo ng AI.",
  practiceSuffix: " · Pagsasanay",
  preparing: "Inihahanda ang inyong pagsusuri…",
  review: "Suriin",
  sources: {
    email: "Email",
    screenshot: "Larawan",
    text: "Teksto",
  },
  startNew: "Magsimula ng bagong pagsusuri",
  subline:
    "Hindi po sigurado sa mensahe o tawag? Hinahanap ng LifeLink ang mga babala bago kayo kumilos.",
  submit: {
    email: "Suriin ang email na ito",
    screenshot: "Suriin ang larawang ito",
    text: "Suriin ang mensaheng ito",
  },
  title: "Suriin kung may panloloko",
  uploading: "Ina-upload ang inyong larawan…",
  uploadingNote:
    "Ina-upload ang larawan. Panatilihing bukas ang pahina; susunod na babasahin ang mga salita.",
};

export { scam };

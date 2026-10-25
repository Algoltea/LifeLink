import type { Messages } from "../en";

const scamResult: Messages["scamResult"] = {
  aboutCheck: "Tungkol sa pagsusuring ito",
  adviceNote:
    "Mula mismo sa mensahe ang payong ito, kaya hindi ito binibilang na babala",
  adviceTitle: "Payo sa mismong mensahe",
  allWords: "Lahat ng salitang nabasa ng LifeLink",
  cannotProve:
    "Hindi mapapatunayan ng resultang ito na tunay ang mensahe. Kumpirmahin ang mga di-inaasahang kahilingan sa pamamagitan ng kontak na kilala na ninyo.",
  checkDidNotFinish: "Hindi natapos ang pagsusuri",
  checkingMessage: "Sinusuri ang inyong mensahe…",
  compareWithPhoto: "Ihambing sa inyong larawan",
  confidence: {
    high: "May ilang detalyeng sumusuporta sa pagtatayang ito. Hindi pa rin nito mapapatunayan ang nagpadala.",
    low: "Kulang ang impormasyon para makasiguro. Maaaring makatulong ang opinyon ng iba.",
    medium:
      "May ilang detalyeng sumusuporta sa pagtatayang ito. Tiyakin ang kahilingan sa ibang mapagkakatiwalaang paraan.",
  },
  couldNotRead: "Hindi malinaw na mabasa ng LifeLink ang larawang ito",
  delete: "Burahin ang pagsusuring ito",
  deleteConfirm:
    "Burahin ang pagsusuring ito? Aalisin ito sa Mga naunang pagsusuri.",
  deleting: "Binubura…",
  howChecked: "Paano ito sinuri",
  imageUnverified:
    "Binasa mula sa larawan ang mga salitang ito at maaaring mali o kulang. Hindi ito maihambing ng LifeLink sa orihinal na teksto. Pakitingnan sa inyong larawan.",
  keep: "Panatilihin ang pagsusuring ito",
  kinds: {
    email: "Isang email",
    screenshot: "Larawan o screenshot",
    text: "Isang mensahe",
  },
  localLanguageNotice:
    "Para lamang sa Ingles ang lokal na pagsusuring ito. Maaaring hindi nito mapansin ang panloloko sa Espanyol at ibang wika. Hindi nangangahulugang ligtas ang mensahe kapag walang babala.",
  method: {
    cloud:
      "Tumulong ang serbisyo ng AI sa cloud sa pagsusuring ito, nang may pahintulot ninyo.",
    cloudOld:
      "Tumulong ang serbisyo ng AI sa cloud sa naunang pagsusuring ito. Hindi naka-save ang detalye ng pahintulot sa talang ito.",
    rules:
      "Gumamit ang LifeLink ng mga karaniwang tuntunin sa babala. Hindi ipinadala ang mensahe sa serbisyo ng AI sa cloud para sa pagsusuring ito.",
    rulesFallback:
      "Gumamit ang LifeLink ng mga karaniwang tuntunin sa babala dahil hindi available o hindi natapos ang AI sa cloud. Maaaring natanggap na ng serbisyo ang nilalamang ito.",
    rulesOld:
      "Gumamit ang LifeLink ng mga karaniwang tuntunin sa babala. Hindi nakasaad sa lumang talang ito kung natanggap din ng serbisyo ng AI sa cloud ang mensahe.",
  },
  newPhoto: "Kumuha ng bagong larawan",
  noFullWording:
    "Hindi naka-save ang buong pananalita sa pagsusuring ito. Hindi buong pagkakasulat ang mga sipi sa itaas. Ihambing sa larawan, o i-type ang mga salita para sa panibagong pagsusuri.",
  noSigns:
    "Walang nakitang malinaw na babala. Hindi nito pinatutunayang tunay ang mensaheng ito.",
  noStepsHint:
    "Bago gawin ang di-inaasahang kahilingan, magtanong sa taong kilala ninyo gamit ang naka-save nilang detalye ng pakikipag-ugnayan.",
  originalEmail: "Orihinal na email",
  originalMessage: "Orihinal na mensahe",
  photo: {
    alt: "Larawang ginamit sa pagsusuring ito",
    larger: "Palakihin ang larawan",
    noPreview: "Walang paunang pagtingin sa larawan para sa pagsusuring ito. ",
    readSaved: "Mababasa pa rin ninyo ang naka-save na resulta.",
    reopen: "Subukang buksan ulit ang pagsusuri.",
    see: "Tingnan ang larawan",
    smaller: "Paliitin ang larawan",
    smallerAria: "Paliitin ang larawan",
  },
  photoRetention: {
    old: "Walang naka-save na paunang pagtingin sa larawan ang lumang pagsusuring ito. Kapag binura ang pagsusuri, mawawala ang resulta; maaaring manatili sa imbakan ang lumang larawan.",
    owned:
      "Nakatabi ang inyong larawan kasama ng pagsusuring ito. Mabubura rin ang larawan kapag binura ang pagsusuri, maliban kung ginagamit pa ito ng ibang naka-save na pagsusuri o larawan.",
  },
  readAloud: "Basahin nang malakas ang resulta",
  readingPhoto: "Binabasa ang mga salita sa inyong larawan…",
  recoveryMessage:
    "Mag-ingat po sa mensaheng ito. Maaari kayong magpasuri ulit o magtanong sa taong pinagkakatiwalaan.",
  recoveryPhoto:
    "Subukan ang mas malinaw na larawan na maliwanag at kita ang lahat ng salita, o i-type ang mga salita. Hindi masasabi ng pagsusuring ito kung tunay ang mensahe.",
  removedQuotes:
    "Hindi natagpuan sa mensahe ang ilang salitang itinuro ng katulong, kaya hindi ipinapakita ang mga ito.",
  savedWording: "Pananalitang naka-save sa pagsusuring ito",
  signCount: (count) => `${count} babala`,
  signsNoteMessage: "Mga napansin sa mensaheng ito",
  signsNotePhoto:
    "Kasama ang mga salitang nabasa ng LifeLink mula sa inyong larawan",
  step: "Hakbang",
  titles: {
    email: "Pagsusuri sa inyong email",
    screenshot: "Pagsusuri sa inyong larawan",
    text: "Pagsusuri sa inyong mensahe",
  },
  typeWords: "I-type na lang ang mga salita",
  verdicts: {
    likely_safe: "Walang malinaw na babala",
    likely_scam: "Malamang na panloloko",
    suspicious: "May nakitang mga babala",
    unsure: "Hindi pa natiyak",
  },
  waitHint:
    "Karaniwan ay ilang segundo lang ito. Panatilihing bukas ang pahina. Habang naghihintay, huwag gamitin ang mga link o numero sa mensahe, at huwag magbayad kaninuman.",
  whatNow: "Ang gagawin ngayon",
};

export { scamResult };

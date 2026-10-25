import type { Messages } from "../en";

const callScreening: Messages["callScreening"] = {
  alertOff: "Naka-off ang tunog ng babala",
  alertPlayed: "Naipatugtog na ang babala",
  alertPlaying: "Ipinapatugtog ang babala",
  alertReady: "Handa na ang babala",
  alertUnavailable:
    "Hindi maipatugtog ang tunog. Basahin ang babala sa screen.",
  askTrusted: "Magtanong sa taong pinagkakatiwalaan",
  bigger: "Mas malaking teksto",
  callCaptions: "Narinig sa tawag",
  callTime: "mula sa simula ng tawag",
  callback:
    "Kung may kakaiba, ibaba ang tawag at tawagan ang tao o kumpanya sa numerong pinagkakatiwalaan na ninyo.",
  callbackAdvice:
    "Kung may kakaiba, ibaba ang tawag at tumawag ulit sa numerong pinagkakatiwalaan ninyo.",
  caller: "Tumatawag",
  cannotConfirm: "Hindi nito makukumpirma kung sino ang tumawag.",
  captionSize: "Laki ng caption",
  captionSource: "Ginawa mula sa mga caption na maaaring may mali.",
  captions: "Mga caption",
  captionsEmpty: "Dito lalabas ang mga salita sa tawag.",
  captionsNotSaved:
    "Ipinapakita hanggang umalis kayo sa pahinang ito. Hindi sine-save.",
  checkMessage: "Suriin ang mensahe",
  checkingLastPart: "Sinusuri ang huling bahagi ng tawag para sa mga babala…",
  checksUnavailable:
    "Hindi available ngayon ang pagsusuri sa mga babala. Lalabas pa rin sa ibaba ang mga salita sa tawag.",
  clearTitle: "Walang narinig na babala",
  close: "Isara",
  codes: "mga paghingi ng code, password, o personal na detalye",
  connectionError:
    "Huminto ang koneksyon sa pakikinig. Nandito pa ang mga caption. Pindutin ang Magsimula ulit para makinig, o Tapusin para i-save ang buod.",
  consent:
    "Nauunawaan kong ipapadala ang tunog at mga salita ng tawag sa mga serbisyo ng AI sa cloud habang naka-on ang pagsusuring ito.",
  credentialsReason: "Paghingi ng verification code o password.",
  delete: "Burahin ang buod",
  deleteError: "Hindi mabura ang buod. Pakisubukan ulit.",
  deleteNotice:
    "Hindi mabubura ang mga mensaheng inihanda o ipinadala ninyo kapag binura ang buod na ito.",
  deleting: "Binubura…",
  discard: "Itapon ang buod",
  earlierAria: "Mga naunang pagsusuri sa tawag",
  finish: "Tapusin",
  finishSave: "Tapusin at i-save ang buod",
  flagged: "Mga babalang napansin ng LifeLink",
  flaggedAdvice:
    "Huwag magbahagi ng code o magpadala ng pera. Ibaba ang tawag at tumawag ulit sa numerong pinagkakatiwalaan na ninyo.",
  flaggedBody:
    "Humiling ang tumatawag ng mga bagay na karaniwang hinihingi ng manloloko.",
  flaggedTitle: (count) => `May ${count} narinig na babala`,
  gettingReady: "Naghahanda…",
  guideCaution:
    "Maaaring may hindi mapansing babala. Kung may kakaiba sa tawag, ibaba ito at tumawag ulit sa numerong pinagkakatiwalaan na ninyo.",
  guideTitle: "Maaaring magbabala nang malakas ang LifeLink tungkol sa:",
  hangUpFirst:
    "Maaari po ninyong sabihing “Tatawag na lang ako ulit” at ibaba muna ang tawag.",
  heard: "Ang narinig ng LifeLink",
  heardText: (heardWords) =>
    heardWords === undefined
      ? "Walang narinig ang LifeLink na tumugma sa mga karaniwang hinihiling ng manloloko."
      : `Nakarinig ang LifeLink ng ${heardWords === 1 ? "1 salita" : `humigit-kumulang ${heardWords} salita`}. Wala sa mga ito ang tumugma sa mga karaniwang hinihiling ng manloloko.`,
  help: "May natanggap akong tawag na hindi ako sigurado. Matutulungan mo ba akong tiyaking tunay ito bago ako magbahagi ng anuman o magpadala ng pera?",
  interrupted:
    "Huminto ang koneksyon habang sinusuri. Ang mga bahaging narinig lamang ng LifeLink ang nasuri.",
  intro:
    "Ipinapakita ng LifeLink ang mga salita sa tawag, ipinapasuri sa AI kung may babala ng panloloko, at nagbababala nang malakas kapag may nakita.",
  languageLimit:
    "Gumagamit ng AI sa cloud ang mga live na tawag. Nakasalalay pa rin sa mga pattern sa Ingles ang lokal na pagsusuri ng teksto; hindi lumalawak ang saklaw nito dahil sa pagsasalin ng interface. Nasa Ingles ang iskrip ng pagsasanay at pasalitang babala. Nananatili sa orihinal na wika ang mga caption at sipi.",
  listenTitle: "Makinig sa tawag",
  listening: "Nakikinig ang LifeLink",
  liveCall: "Live na tawag",
  messageReview: "Mensaheng susuriin",
  mixedVoices:
    "Magkahalo sa mga caption ang dalawang boses at maaaring may mali.",
  money: "mga paghingi ng pera o gift card",
  moneyReason: "Kahilingang magpadala ng pera o magbayad gamit ang gift card.",
  mute: "Patahimikin ang babala",
  noWarnings: "Walang napansing babala",
  noWarningsYet: " · Wala pang napansing babala",
  notConfigured:
    "Hindi pa naka-set up ang pagsusuri ng live na tawag. Maaari ninyong subukan ang tawag para sa pagsasanay o i-type ang sinabi ng tumatawag.",
  notSafe:
    "Hindi ibig sabihin nito na ligtas ang tawag. Maaaring may hindi mapansing babala ang LifeLink at hindi nito mapapatunayan kung sino ang tumawag.",
  openStep: "Panatilihing bukas ang screen na ito habang nakikipag-usap.",
  otherDevice:
    "Kung hindi magamit ng telepono ang mikropono habang tumatawag, buksan ang LifeLink sa ibang device.",
  outcomeLabels: {
    clear: "Walang napansing babala",
    flagged: "May napansing mga babala",
    silent: "Walang narinig",
    unchecked: "Hindi lubos na nasuri",
  },
  partlyChecked:
    "Hindi nasuri ang isang bahagi ng tawag, kaya maaaring may iba pang babala.",
  paused:
    "Humihinto muna ang pakikinig habang tumutunog ang babala para hindi nito marinig ang sarili nitong babala.",
  permissionDenied:
    "Hindi pinayagan ang mikropono. Payagan ito sa mga setting ng site sa browser, saka subukan ulit. Maaari rin ninyong subukan ang tawag para sa pagsasanay.",
  phoneCall: "Tawag sa telepono",
  potentialScam: "Posibleng panloloko.",
  practice: "Pagsasanay",
  practiceCall: "Tawag para sa pagsasanay",
  practiceCaptionSource:
    "Ito ang mga salita sa iskrip ng tawag para sa pagsasanay.",
  practiceCaptions: "Ang sinasabi",
  practiceExplanation:
    "Gawa-gawang tawag ito. Walang ginagamit na mikropono o AI sa cloud.",
  practiceFlaggedBody:
    "Humiling ang tumatawag sa pagsasanay ng mga karaniwang hinihingi ng manloloko.",
  practiceHeard: "Sinabi sa tawag para sa pagsasanay",
  practiceHelp:
    "Sinubukan ko ang tawag para sa pagsasanay ng LifeLink tungkol sa panloloko. Maaari ba nating pag-usapan kung ano ang gagawin kapag may ganoong tawag?",
  practiceMode:
    "Naka-on ang mode ng pagsasanay. Subukan ang gawa-gawang tawag sa ibaba nang walang mikropono.",
  practicePlaying: "Pinapatugtog ang tawag para sa pagsasanay",
  practicePrivacy:
    "Walang ginagamit na mikropono o AI sa cloud. May maikling buod na sine-save sa Mga naunang pagsusuri.",
  practiceSaved:
    "Walang ginagamit na mikropono o AI sa cloud ang tawag para sa pagsasanay. Naka-save ang maikling buod sa Mga naunang pagsusuri.",
  practiceSilentBody:
    "Natapos ang tawag para sa pagsasanay bago may salitang naipatugtog, kaya walang masuri.",
  practiceSilentTitle: "Maagang huminto ang pagsasanay",
  practiceSource: "Ginawa mula sa iskrip ng pagsasanay.",
  practiceSummary: "Buod ng tawag para sa pagsasanay",
  practiceTime: "mula sa simula",
  practiceVoices:
    "May pangalan ang mga boses sa pagsasanay. Magkahalo at walang pangalan ang dalawang boses sa caption ng totoong tawag.",
  privacy:
    "Hindi nagre-record ng tawag ang LifeLink. Napupunta ang tunog ng mikropono sa Gemini ng Google para gumawa ng caption, at ang mga caption sa AI na sumusuri ng mga babala. Kapag huminto kayo, maikling buod lang ng mga babala ang sine-save ng LifeLink, hindi ang mga caption.",
  protect:
    "Huwag magbigay ng code, password, o pera. Magtanong po sa taong pinagkakatiwalaan.",
  quoteNotice:
    "Maaaring may mali ang mga sipi. Nakatago ang mahahabang numero.",
  readResult: "Basahin nang malakas ang resulta",
  remote: "mga kahilingang kontrolin ang inyong computer o telepono",
  remoteReason: "Kahilingang payagan ang malayuang access sa device.",
  retrySave: "Subukang i-save ulit",
  retrySteps: [
    "Ilagay sa speakerphone ang tawag.",
    "Ilapit ang telepono sa device na ito.",
    "Simulan ulit ang pagsusuri ng tawag bago sumagot.",
  ],
  retryTitle: "Para subukan ulit",
  review: "Suriin",
  saveError:
    "Hindi ma-save ang buod. Panatilihing bukas ang pahina at subukan ulit.",
  saving: "Sine-save ang inyong buod…",
  scamWarning: "Mukhang panloloko ito.",
  screenAnotherCall: "Suriin ang ibang tawag",
  secrecyReason: "Kahilingang ilihim habang pinipilit kayong kumilos agad.",
  silentBody:
    "Walang pananalitang nakarating sa LifeLink, kaya hindi nito nasuri ang mga babala sa tawag.",
  silentTitle: "Hindi narinig ng LifeLink ang tawag",
  smaller: "Mas maliit na teksto",
  soundUnavailable:
    "Hindi available ang tunog. Lalabas pa rin sa screen ang mga babala.",
  speakerStep: "Ilagay ang tawag sa speaker malapit sa device na ito.",
  start: "Simulang makinig",
  startAgain: "Magsimula ulit",
  startError:
    "Hindi makapagsimulang makinig ang LifeLink. Subukan ulit o subukan ang tawag para sa pagsasanay.",
  startStep: "Pindutin ang Simulang makinig at payagan ang mikropono.",
  stop: "Ihinto",
  stopListening: "Ihinto ang pakikinig",
  stopPractice: "Ihinto ang tawag para sa pagsasanay",
  stopped: "Huminto na ang pakikinig",
  summary: "Buod ng tawag",
  summaryNoWarnings: "Walang napansing babala.",
  summarySaved:
    "Na-save bilang maikling buod sa Mga naunang pagsusuri. Walang itinatabing audio o caption.",
  summaryStorage:
    "Maikling buod lang ang sine-save sa Mga naunang pagsusuri. Walang itinatabing audio o caption.",
  summaryWarnings: "May mga babala ang tawag na ito.",
  tellTrusted: "Sabihin sa taong pinagkakatiwalaan",
  timeLimit:
    "Huminto ang pagsusuri pagkalipas ng 30 minuto. Narito ang buod hanggang ngayon.",
  times:
    "Ang oras ay minuto at segundo mula sa simula ng pagsusuri. Nakatago ang mahahabang numero.",
  tryPractice: "Subukan ang tawag para sa pagsasanay",
  uncheckedBody:
    "Hindi nasuri ang ilan sa mga sinabi para sa babala, kaya maaaring kulang ang buod na ito.",
  uncheckedTitle: "Hindi lubos na nasuri ng LifeLink ang tawag na ito",
  unmute: "Ibalik ang tunog ng babala",
  urgency: "mga banta, o pamimilit na magmadali at maglihim",
  warningReasons: {
    codes_or_passwords: "Paghingi ng verification code o password.",
    gift_cards:
      "Kahilingang magbayad gamit ang gift card o ibahagi ang mga code nito.",
    money: "Kahilingang magpadala ng pera o ilipat ang inyong ipon.",
    personal_details: "Paghingi ng personal na detalye o detalye ng bangko.",
    remote_access: "Kahilingang payagan ang malayuang access sa device.",
    secrecy_or_pressure: "Kahilingang maglihim o pamimilit na kumilos agad.",
    threats: "Banta ng pag-aresto, multa, o pagsasara ng account.",
  },
  warningSign: "Babala",
  warnings: "May napansing mga babala",
  you: "Kayo",
};

export { callScreening };

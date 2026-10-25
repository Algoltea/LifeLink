import type { Messages } from "../en";

const voice: Messages["voice"] = {
  connecting: "Kumokonekta…",
  connectionProblem: "Nagkaproblema ang koneksyon sa boses.",
  dictationStopped:
    "Huminto ang pag-type gamit ang boses. Pakisubukan ulit o mag-type na lang.",
  emptyRequest: "Walang inihanda dahil walang laman ang kahilingan.",
  inputLabel: "Ano po ang gusto ninyong tulong?",
  listening: "Nakikinig…",
  microphoneBusy:
    "May ibang app na gumagamit ng mikropono. Isara ito at subukan ulit, o mag-type na lang.",
  microphoneDenied:
    "Hindi pinapayagang gumamit ng mikropono ang LifeLink. Payagan ito sa mga setting ng browser para sa site na ito, o mag-type na lang.",
  microphoneFailed:
    "Hindi nagsimula ang mikropono. Pakisubukan ulit o mag-type na lang.",
  microphoneMissing:
    "Walang nakitang mikropono. Tiyaking may nakakonekta, o mag-type na lang.",
  offlineFailed:
    "Hindi ma-save ang kahilingang ito habang walang koneksyon. Nandito pa ang mga salita ninyo. Pakisubukan kapag nakakonekta na.",
  opening: "Binubuksan ang lugar para sa inyong mensahe",
  placeholder: "Magtanong sa LifeLink…",
  prepareFailed:
    "Hindi ito maihanda. Hilingin po sa kanila na subukan ulit o i-type ito.",
  prepared:
    "Handa na. Nasa screen na ito; walang mangyayari hanggang aprubahan doon.",
  preparing: "Inihahanda ang iyong kahilingan…",
  readAloudUnavailable:
    "Hindi available ang pagbabasa nang malakas. Pakisubukan po ulit.",
  retry:
    "Nasa kahon pa ang mga salita ninyo. Pindutin ang Ipadala para subukan ulit.",
  savedOffline:
    "Na-save. Titingnan ito ng LifeLink kapag may internet na kayo.",
  screeningConnectionProblem:
    "Nagkaproblema ang koneksyon sa pagsusuri ng tawag.",
  screeningDisconnected: "Nadiskonekta ang pagsusuri ng tawag.",
  screeningLost: "Nawalan ng koneksyon ang pagsusuri ng tawag.",
  screeningMicrophoneStopped:
    "Huminto ang mikropono. Simulan ulit ang pagsusuri ng tawag para kumonekta.",
  screeningResumeFailed:
    "Hindi maipagpatuloy ang pagsusuri ng tawag pagkatapos ng babala. Simulan ulit.",
  screeningStopped: "Itinigil ang pagsusuri ng tawag.",
  send: "Ipadala",
  sending: "Ipinapadala",
  speak: "Magsalita",
  speakHint:
    "Pindutin ang Magsalita para magsalita sa halip na mag-type. Walang ipinapadala hanggang aprubahan ninyo.",
  speaking: "Nagsasalita ang LifeLink…",
  startFailed: (error) =>
    `Hindi nagsimula ang boses: ${error} Maaari kayong mag-type na lang.`,
  stop: "Ihinto",
  unavailable:
    "Hindi available ang boses ngayon, kaya paki-type po. Walang ipinapadala hanggang aprubahan ninyo.",
  voiceStopped: "Itinigil ang boses.",
};

export { voice };

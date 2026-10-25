import type { Messages } from "../en";

const today: Messages["today"] = {
  addPostalCode: "Idagdag ang inyong postal code",
  allEmail: "Lahat ng email",
  allMessages: "Lahat ng mensahe",
  appointment: "Appointment",
  check: "Suriin",
  checkPostalCode: "Suriin ang inyong postal code",
  connect: "Ikonekta",
  connectMailbox:
    "Ikonekta ang Gmail o Outlook para makita rito ang bagong email.",
  couldNotFindTown: "Hindi namin makita ang inyong bayan",
  dismissFailed: (error) => `${error} Pindutin ang Tapos na para subukan ulit.`,
  fromFamily: "Mula sa pamilya at mga kaibigan",
  gettingStarted: "Pagsisimula",
  gettingStartedHint:
    "Mamarkahang tapos ang bawat hakbang kapag natapos ninyo.",
  hideSteps: "Itago ang mga hakbang na ito",
  latestEmail: "Pinakabagong email",
  loadingBriefing: "Nilo-load ang buod ng inyong araw",
  loadingToday: "Nilo-load ang Ngayon",
  messages: "Mga mensahe",
  messagesFrom: (names) =>
    `May mga mensahe kayo mula kay ${names} nitong nakaraang dalawang araw.`,
  newMessage: "Bagong mensahe",
  news: "Balita",
  newsFullStory: (source) => `Buong balita sa ${source}`,
  newsGood: "Mabubuting balita",
  newsMoreFrom: (source) => `Higit pa mula sa ${source}`,
  newsOpensNewTab: ", bubukas sa bagong tab",
  newsOpinion: "Opinyon",
  newsSourceFrom: ", mula sa ",
  newsSponsored: "May sponsor",
  newsSummarizing: "Binubuod…",
  newsSummaryUnavailable:
    "Walang buod para sa balitang ito. Maaari mong basahin ang buong balita.",
  newsTop: "Pangunahing balita",
  newsType: "Uri ng balita",
  newsUnavailable: "Hindi available ngayon ang balita. Pakisubukan po mamaya.",
  nextAppointment: (title, when, time) =>
    `Ang susunod ninyong appointment ay ${title} ${when}, ${time}.`,
  noAppointments: "Wala kayong nakatakdang appointment ngayong linggo.",
  noEmail: "Walang bagong email.",
  noMessages: "Walang bagong mensahe nitong nakaraang dalawang araw.",
  noSubject: "Walang paksa",
  nothingBooked: "Walang nakatakda ngayong linggo.",
  onDay: (day) => `sa ${day}`,
  openForDetails: "Buksan para sa detalye",
  possibleScam: "Posibleng panloloko",
  readMyDay: "Basahin nang malakas ang aking araw",
  reminder: "Paalala",
  remindersDue: (count) => `May ${count} paalalang nakatakda na.`,
  rideConfirmed: (name) => `Pagpapahatid kay ${name}, kumpirmado`,
  seeWeather: "Tingnan ang panahon para sa inyong mga appointment",
  steps: {
    askAction: "Magtanong sa LifeLink",
    askDescription:
      "Subukan ang “Paalalahanan akong diligan ang mga halaman nang alas singko.” Susuriin muna ninyo ang lahat bago ito mangyari.",
    askTitle: "Humingi ng tulong",
    emailAction: "Ikonekta ang email",
    emailDescription:
      "Binabasa ito ng LifeLink kasama ninyo at ipinapakita ang anumang mukhang panloloko.",
    emailTitle: "Ikonekta ang inyong email",
    locationAction: "Magdagdag ng postal code",
    locationDescription:
      "Ipinapakita ng LifeLink ang lagay ng panahon sa Ngayon at sa tabi ng bawat appointment.",
    locationTitle: "Idagdag ang inyong postal code",
    trustedAction: "Magdagdag ng tao",
    trustedDescription:
      "Piliin kung sino ang makatutulong sa pagpapahatid at ano ang makikita nila. Kayo pa rin ang nagpapasya.",
    trustedTitle: "Magdagdag ng taong pinagkakatiwalaan",
  },
  title: "Ngayon",
  titlePrefix: "Ngayon: ",
  todayLower: "ngayon",
  tomorrowLower: "bukas",
  weatherHigh: ", pinakamataas ",
  weatherPrefix: ", lagay ng panahon: ",
  yourWeek: "Inyong linggo",
};

export { today };

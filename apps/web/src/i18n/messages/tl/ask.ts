import type { Messages } from "../en";

const ask: Messages["ask"] = {
  closeHistory: "Isara ang kasaysayan ng usapan",
  composerLabel: "Sumulat o magsalita sa LifeLink",
  conversationLabel: "Usapan sa LifeLink",
  copied: "Nakopya na",
  copy: "Kopyahin",
  copyUnavailable:
    "Hindi available ang pagkopya rito. Maaari po ninyong piliin ang teksto.",
  emailSummary: {
    cloud: "Buod sa cloud",
    cloudConsent:
      "Gumamit ng AI sa cloud para sa mas buong buod. Ipapadala nito ang available na teksto at mga naka-save na buod ng aking 15 pinakabagong na-import na email sa tagapagbigay ng AI. Huwag lagyan ng tsek para sa LifeLink gawin ang buod.",
    count: (count) => `${count} kamakailang na-import na email · `,
    empty:
      "Wala pang na-import na email. Tingnan kung may bagong email sa pahina ng Email, saka gumawa ulit ng buod.",
    emptyGroup: "Walang email sa kategoryang ito.",
    groups: {
      check_first: "Suriin bago kumilos",
      low_priority: "Hindi gaanong prayoridad",
      reply: "Maaaring kailangan ng tugon",
      review: "Mabuting tingnan",
    },
    howMade: "Paano ginawa ang buod na ito",
    local: "Buod ng LifeLink",
    noSubject: "(Walang paksa)",
    offline: "Kumonekta para ibuod ang mga na-import ninyong email.",
    openEmail: "Buksan ang Email",
    options: "Mga opsyon sa buod",
    practicePrefix: "Pagsasanay · ",
    suggestionsOnly:
      "Mga mungkahi lamang. Suriin ang mga orihinal na mensahe bago kumilos. Wala pong ipinadala o binago sa inyong mailbox.",
    summarize: "Ibuod ang mga email",
    summarizing: "Ibinubuod ang mga email…",
    title: "Buod ng mga kamakailang email",
    working: "Idinaragdag ang buod ng email sa usapang ito…",
  },
  failed: "Hindi natapos ang tugon. Pakitanong po ulit.",
  history: "Kasaysayan",
  historyDescription: "Ipagpatuloy kung saan kayo huminto.",
  historyEmpty: "Wala pang usapan. Dito ise-save ang una ninyong usapan.",
  historyGroups: {
    earlier: "Mas maaga",
    thisWeek: "Ngayong linggo",
  },
  historyTitle: "Kasaysayan ng usapan",
  lifeLinkSaid: "Sabi ng LifeLink: ",
  loadEarlier: "Ipakita ang mga naunang mensahe",
  loadEarlierConversations: "Ipakita ang mga naunang usapan",
  loadingConversation: "Nilo-load ang inyong usapan",
  loadingConversations: "Nilo-load ang mga usapan…",
  loadingEarlier: "Nilo-load ang mga naunang mensahe…",
  loadingHistory: "Nilo-load ang kasaysayan ng inyong usapan",
  newChat: "Bagong usapan",
  openNow: ", bukas ngayon",
  opening: "Binubuksan ang inyong usapan",
  quickActions: "Mga mabilis na gawain",
  suggestions: {
    reminder: {
      label: "Magtakda ng paalala",
      prompt: "Paalalahanan akong ",
    },
    ride: {
      label: "Humiling ng masasakyan",
      prompt:
        "Itanong sa pamilya ko kung may makapaghahatid sa akin sa appointment sa ",
    },
    write: {
      label: "Sumulat sa pamilya",
      prompt: "Tulungan akong sumulat ng mensahe para kay ",
    },
  },
  thinking: "Nag-iisip…",
  title: "Magtanong sa LifeLink",
  titlePrefix: "Magtanong sa LifeLink: ",
  waitingConnection: "Naghihintay ng koneksyon. Wala pang naipadala.",
  waitingForConnection: "Mga mensaheng naghihintay ng koneksyon",
  whatCanIHelp: "Ano po ang maitutulong ko ngayon?",
  youSaid: "Sabi ninyo: ",
  yourConversation: "Inyong usapan",
};

export { ask };

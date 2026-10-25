import type { Messages } from "../en";

const shell: Messages["shell"] = {
  accountMenuFor: "Menu ng account ni ",
  closeMenu: "Isara ang menu",
  dismissNotice: "Isara ang abiso",
  familyMember: "Kapamilya",
  groupGames: "Mga laro",
  groupHelpWith: "Tulong sa",
  groupSetup: "Inyong mga setting",
  mainNavigation: "Pangunahing nabigasyon",
  menu: "Menu",
  nav: {
    ask: "Magtanong sa LifeLink",
    circle: "Mga pinagkakatiwalaan",
    connections: "Mga koneksyon",
    documents: "Mga dokumento",
    email: "Email",
    family: "Pamilya",
    groceries: "Mga bibilhin",
    mahjong: "Mahjong",
    messages: "Mga mensahe",
    scam: "Suriin kung may panloloko",
    settings: "Mga setting",
    solitaire: "Solitaire",
    today: "Ngayon",
  },
  needsReview: (label) => `Kailangan po ninyong suriin ang ${label}.`,
  notTriedAgain: "Hindi ito awtomatikong susubukan ulit.",
  offline:
    "Wala kayong koneksyon. Maaari pa rin kayong magsulat; susuriin ulit at ipapadala ang anumang aprubahan ninyo kapag may internet na.",
  offlineReview: "Kailangang suriin ang ginawa habang walang koneksyon",
  offlineWaiting: (count) => ` ${count} ang naghihintay.`,
  openAsk: "Buksan ang Magtanong",
  openMenu: "Buksan ang menu",
  originalRequest: "Orihinal ninyong kahilingan",
  playAccount:
    "Naka-save sa device na ito ang mga laro ninyo at gumagana kahit walang internet.",
  practiceBannerOn: "Naka-on ang mode ng pagsasanay.",
  practiceBannerRest: "Walang totoong mensaheng ipinapadala.",
  practiceMode: "Mode ng pagsasanay",
  reviewOnToday: "Suriin sa Ngayon",
  signOut: "Mag-sign out",
  skipToMain: "Lumaktaw sa pangunahing nilalaman",
  turnOffPractice: "I-off ang mode ng pagsasanay",
  yourOfflineRequest: "Kahilingan ninyo habang walang koneksyon",
};

export { shell };

import type { Messages } from "../en";

const connections: Messages["connections"] = {
  account: (label) => `Account: ${label}`,
  allowProvider: (label) => `Piliin ang Payagan sa pahina ng ${label}.`,
  appAccount:
    "Gumagana ito sa sariling account ng app, kaya wala kayong kailangang i-sign in.",
  callback: {
    back: "Bumalik sa Mga koneksyon",
    checking: (label) => `Sinusuri ang koneksyon sa ${label}`,
    connected: (label) => `Nakakonekta na ang ${label}.`,
    connectedTitle: (label) => `Nakakonekta ang ${label}`,
    declined: (label) =>
      `Hindi natapos ang pagkonekta sa ${label}. Walang nabago. Maaari ninyong subukan ulit.`,
    missing:
      "Nabuksan ang pahinang ito nang walang koneksyong tatapusin. Magsimula po ulit sa Mga koneksyon.",
    practice:
      "Naka-on ang mode ng pagsasanay. I-off ito sa Mga setting bago tapusin ang totoong koneksyon.",
    service: "Ang serbisyo",
    subline:
      "Bumalik sa Mga koneksyon para suriin ang mga serbisyo o magsimula ulit.",
    title: "Kalagayan ng koneksyon",
    unavailable:
      "Walang available na koneksyon sa LifeLink para sa serbisyong ito. Bumalik sa Mga koneksyon para suriin ang mga limitasyon.",
  },
  canDo: "Mga magagawa",
  cancel: "Kanselahin",
  cardLabel: (label, status, permissions, action) =>
    `${label}. ${status}. ${permissions}. ${action}.`,
  close: "Isara",
  comingLater: "Darating pa",
  connect: "Ikonekta",
  connectProvider: (label) => `Ikonekta ang ${label}`,
  connectionState: (status) => `Ang koneksyon ay ${status}.`,
  connectionStates: {
    active: "aktibo",
    deleted: "nabura",
    expired: "nag-expire",
    failed: "nabigo",
    inactive: "hindi aktibo",
    initiated: "nasimulan",
    pending: "nakabinbin",
    revoked: "binawi",
  },
  detailLabel: (label, summary) => `${label}. ${summary} Mga detalye.`,
  details: "Mga detalye",
  developerSetupAfter: (label) => ` at piliin ang ${label}.`,
  developerSetupBefore: "Para sa namamahala sa LifeLink: patakbuhin ang ",
  disconnect: (label) => `Idiskonekta ang ${label}`,
  disconnectPractice: "Idiskonekta ang account sa pagsasanay",
  disconnectTip: (label) =>
    `Payo: maaari nilang idiskonekta ang ${label} mula sa window na ito anumang oras.`,
  disconnected: (label) =>
    `Nadiskonekta ang ${label}. Wala nang gagamit nito mula ngayon.`,
  discordSetup: (practice) =>
    `${practice ? "Kapag gumamit ng totoong Discord, idagdag" : "Idagdag"} ang Discord user ID ng bawat tao sa Mga pinagkakatiwalaan.`,
  empty: "Walang nakalistang serbisyo.",
  errors: {
    "Connections are not set up for this app yet. Run bun run dev:setup.":
      "Hindi pa naka-set up ang mga koneksyon para sa app na ito. Patakbuhin ang bun run dev:setup.",
    "Please sign in again.": "Mag-sign in po ulit.",
    "Practice connections are only available in practice mode.":
      "Sa mode ng pagsasanay lang available ang mga koneksyon sa pagsasanay.",
    "That account could not be found.": "Hindi makita ang account na iyon.",
    "That connection could not be found.": "Hindi makita ang koneksyong iyon.",
    "The connection did not finish. You can try again.":
      "Hindi natapos ang koneksyon. Maaari ninyong subukan ulit.",
    "This connection changed while the request was running. Return to Connections to check its status.":
      "Nagbago ang koneksyong ito habang tumatakbo ang kahilingan. Bumalik sa Mga koneksyon para tingnan ang kalagayan.",
    "This connection was not started from your account. Please try connecting again.":
      "Hindi nagsimula sa inyong account ang koneksyong ito. Pakisubukang kumonekta ulit.",
    "This service does not use a personal sign-in.":
      "Hindi gumagamit ng personal na pag-sign in ang serbisyong ito.",
    "Turn off Practice mode in Settings before connecting or changing a real account.":
      "I-off ang mode ng pagsasanay sa Mga setting bago ikonekta o baguhin ang totoong account.",
    "We could not confirm the connection.":
      "Hindi namin makumpirma ang koneksyon.",
  },
  groups: {
    appointments: "Pamahalaan ang mga appointment",
    email: "Bumasa at sumulat ng email",
    messages: "Magmensahe sa pamilya at mga kaibigan",
  },
  helperTitle: "Inihahanda po ba ninyo ito para sa ibang tao?",
  imessageIntro:
    "I-link ang bawat tao sa Mga pinagkakatiwalaan sa kanilang kasalukuyang kontak sa Photon. Hindi nagrerehistro ng bagong kontak ang LifeLink.",
  imessageSteps: [
    "I-save ang eksaktong numero o Apple ID email na ginagamit nila sa pagpapadala ng iMessage. Magkaibang pagkakakilanlan ang numero at email kahit sa iisang tao.",
    "Tiyaking nakarehistro na ang eksaktong address sa dashboard ng Photon. Kung wala, idagdag muna ang kontak doon. Saka piliin ang I-link ang iMessage sa Mga pinagkakatiwalaan at gamitin ang itinalagang numerong ipinapakita para sa kontak.",
    "Hilinging ipadala nila ang unang iMessage sa itinalagang numero mula sa eksaktong naka-save na address. Makapagmemensahe ang LifeLink pagkatapos dumating ang una nilang mensahe.",
  ],
  intro: (label) =>
    `Magagawa ng LifeLink ang mga ito sa ${label}. Walang ipinapadala hanggang aprubahan ninyo.`,
  limitTags: {
    not_offered: "Hindi posible",
    not_wired: "Darating pa",
  },
  limitsCount: (count) => `Mga hindi pa magagawa ng LifeLink (${count})`,
  limitsTitle: "Mga hindi pa magagawa ng LifeLink",
  loading: "Nilo-load ang mga koneksyon",
  manage: "Pamahalaan",
  notSetUp:
    "Hindi pa ito naka-on. Hilingin sa nag-set up ng LifeLink na i-on ito.",
  openCircle: "Buksan ang Mga pinagkakatiwalaan",
  permissions: {
    add: "Magdagdag",
    calendar: "Maghanap ng petsa",
    draft: "Gumawa ng burador",
    message: "Magpadala ng mensahe",
    money: "Pera",
    notice: "Mga abiso",
    post: "Mag-post",
    read: "Basahin",
    replies: "Mga tugon",
    send: "Ipadala",
    unavailable: "Wala pa",
  },
  practiceAccount: "Gumamit ng account sa pagsasanay",
  practiceBlocked: (label) =>
    `Naka-save ang tunay ninyong koneksyon sa ${label}. Hindi ito mapapalitan ng account sa pagsasanay. I-off ang mode ng pagsasanay sa Mga setting para pamahalaan ito.`,
  practiceConnected: (label) =>
    `Nakakonekta ang account sa pagsasanay ng ${label}. Hindi ito kumokonekta sa totoong serbisyo.`,
  practiceDisconnected: (label) =>
    `Nadiskonekta ang account sa pagsasanay ng ${label}.`,
  practiceMessages: (imessage) =>
    `Ginagaya lang ang mga mensahe sa ${imessage ? "iMessage" : "Discord"} para sa pagsasanay. Walang mensaheng nakararating sa inyong mga kontak.`,
  practiceNeverConnects:
    "Hindi kailanman kumokonekta sa totoong serbisyo ang account na ito sa pagsasanay.",
  pressConnect: (label) => `Pindutin ang ${label} sa ibaba.`,
  providers: {
    discord: {
      accountRequirement:
        "Kasama ng kapamilya sa isang server ang bot ng app, o nauna na silang magmensahe sa bot.",
      capabilities: {
        "discord.receive": {
          label: "Tumanggap ng mga tugon",
          note: "Darating ang mga tugon habang online ang bot ng LifeLink sa Discord.",
        },
        "discord.send": {
          label: "Magpadala ng direktang mensahe pagkatapos ninyong aprubahan",
        },
      },
      summary: "Mga direktang mensahe sa mga kapamilya sa Discord.",
    },
    ebay: {
      accountRequirement:
        "Hindi maaaring ikonekta rito ang personal na eBay account.",
      capabilities: {
        "ebay.search": {
          label: "Maghanap ng mga listing sa eBay",
        },
        "ebay.selling": {
          label: "Mga listing, order, o binili ninyo",
        },
      },
      summary:
        "Darating pa ang paghahanap. Hindi kailanman bumibili o nagbebenta ang LifeLink.",
    },
    facebook: {
      accountRequirement:
        "Mga feature ng Facebook Page lamang. Hindi suportado ang personal na profile.",
      capabilities: {
        "facebook.page_inbox": {
          label: "Basahin at sagutin ang mga mensahe ng inyong Page",
        },
        "facebook.page_post": {
          label: "Mag-post sa Page pagkatapos ninyong aprubahan",
        },
        "facebook.personal": {
          label: "Personal na timeline at mga mensahe ng kaibigan",
          note: "Hindi pinapayagan ng Facebook ang mga app na bumasa o magpadala ng personal na usapan sa Messenger.",
        },
      },
      summary: "Mga business Page lamang. Darating pa.",
    },
    gmail: {
      accountRequirement: "Isang Google account.",
      capabilities: {
        "email.appointments": {
          label: "Maghanap ng appointment sa mga email",
        },
        "email.draft": {
          label: "Sumulat ng burador para suriin ninyo",
        },
        "email.new_message_event": {
          label: "Mapansin ang bagong email (sinusuri halos bawat minuto)",
        },
        "email.read_selected": {
          label: "Basahin ang mga email na pinili ninyo para ibuod",
        },
        "email.send": {
          label: "Magpadala ng email pagkatapos ninyong aprubahan",
        },
      },
      summary:
        "Bumasa, sumulat, at magpadala ng email. Hanapin ang mga appointment sa inyong email.",
    },
    google_calendar: {
      accountRequirement: "Isang Google account.",
      capabilities: {
        "calendar.create": {
          label: "Magdagdag ng inaprubahang appointment",
        },
        "calendar.read": {
          label: "Tingnan ang inyong mga paparating na kaganapan",
        },
      },
      summary:
        "Idagdag ang mga appointment sa kalendaryo pagkatapos ninyong aprubahan.",
    },
    google_drive: {
      accountRequirement: "Isang Google account.",
      capabilities: {
        "drive.create": {
          label:
            "I-save bilang dokumento ang mga tala ng appointment pagkatapos ninyong aprubahan",
        },
        "drive.read": {
          label: "Hanapin ang mga file na nakatabi na sa Drive",
          note: "Pangalan at link lang ng file ang nakikita ng LifeLink, hindi ang nilalaman.",
        },
      },
      summary:
        "Hanapin ang inyong mga file at i-save ang mga tala ng appointment.",
    },
    imessage: {
      accountRequirement:
        "Hindi kailangan ng inyong mga kontak ng imbitasyon, LifeLink account, o access sa dashboard ng Photon.",
      capabilities: {
        "imessage.delivery": {
          label: "Mga balita sa paghahatid",
          note: "Alam ng LifeLink na naipadala ang mensahe, pero hindi kung dumating o nabasa na ito.",
        },
        "imessage.first_contact": {
          label: "Magsimula ng usapan sa bagong tao",
          note: "Bawat tao ang dapat magpadala ng unang mensahe.",
        },
        "imessage.receive": {
          label: "Tumanggap ng mga tugon",
        },
        "imessage.send": {
          label: "Magpadala ng text o larawan pagkatapos ninyong aprubahan",
          note: "Gumagana pagkatapos nilang magpadala ng unang mensahe.",
        },
      },
      summary:
        "Mag-text sa pamilya at mga kaibigan. Bawat tao ang magpapadala ng unang mensahe.",
    },
    instacart: {
      accountRequirement: "Hindi na available ang pamimili sa LifeLink.",
      capabilities: {},
      summary: "Hindi na available ang pamimili sa LifeLink.",
    },
    instagram: {
      accountRequirement: "Isang Instagram Business o Creator account.",
      capabilities: {
        "instagram.messages": {
          label: "Sagutin ang mga direktang mensahe",
        },
        "instagram.personal": {
          label: "Mga personal na account",
        },
        "instagram.post": {
          label: "Magbahagi ng post na larawan pagkatapos ninyong aprubahan",
        },
      },
      summary: "Mga Business at Creator account lamang. Darating pa.",
    },
    outlook: {
      accountRequirement:
        "Isang Microsoft account. Kailangan ng pahintulot ng administrator sa ilang account sa trabaho.",
      capabilities: {
        "calendar.create": {
          label:
            "Magdagdag ng inaprubahang appointment sa kalendaryo ng Outlook",
        },
        "email.draft": {
          label: "Sumulat ng burador para suriin ninyo",
        },
        "email.new_message_event": {
          label: "Mapansin ang bagong email pagdating nito",
        },
        "email.read_selected": {
          label: "Basahin ang mga email na pinili ninyo para ibuod",
        },
        "email.send": {
          label: "Magpadala ng email pagkatapos ninyong aprubahan",
        },
      },
      summary: "Email at kalendaryo ng Outlook sa isang koneksyon.",
    },
    paypal: {
      accountRequirement:
        "Hindi maaaring ikonekta rito ang personal na PayPal account.",
      capabilities: {
        "paypal.invoices": {
          label: "Maghanap ng invoice",
        },
        "paypal.send_money": {
          label: "Magpadala ng pera sa tao",
          note: "Hindi kailanman nagpapadala ng pera ang LifeLink.",
        },
      },
      summary:
        "Darating pa ang mga invoice. Hindi kailanman nagpapadala ng pera ang LifeLink.",
    },
    telegram: {
      accountRequirement:
        "Bubuksan ng kapamilya ang link na ginawa ng LifeLink at pipindutin ang Start sa Telegram.",
      capabilities: {
        "telegram.first_contact": {
          label: "Magsimula ng usapan sa bagong tao",
          note: "Dapat munang pindutin ng bawat tao ang Start sa bot.",
        },
        "telegram.receive": {
          label: "Tumanggap ng mga tugon",
        },
        "telegram.send": {
          label:
            "Magpadala ng mensahe o mga larawan pagkatapos ninyong aprubahan",
        },
      },
      summary: "Mga mensahe sa mga kapamilya sa Telegram.",
    },
  },
  realImessage:
    "Kapag gumamit ng totoong iMessage, sundin ang mga hakbang na ito.",
  requirements: "Mga kailangan ninyo",
  retry: "Subukang kumonekta ulit",
  returnConnected: "Babalik kayo rito at makikita ang Nakakonekta.",
  setup: "I-set up",
  signInProvider: (label) =>
    `Mag-sign in kayo sa sariling pahina ng ${label}. Hindi kailanman makikita ng LifeLink ang inyong password.`,
  signInTheirAccount: "Mag-sign in gamit ang account nila, hindi sa inyo.",
  status: {
    connected: "Nakakonekta",
    disconnected: "Hindi nakakonekta",
    error: "Hindi nakakonekta",
    notOn: "Hindi naka-on",
    pending: "Hindi natapos",
    practice: "Pagsasanay",
    practiceAccount: "Account sa pagsasanay",
    ready: "Handa na",
    realSaved: "Na-save ang totoong account",
  },
  subline:
    "Ikonekta ang mga serbisyong ginagamit na ninyo. Buksan ang isa para makita ang magagawa ng LifeLink dito.",
  telegramSetup: (practice) =>
    `${practice ? "Kapag gumamit ng totoong Telegram, buksan" : "Buksan"} ang bawat tao sa Mga pinagkakatiwalaan, piliin ang I-link ang Telegram, at ipadala sa kanila ang link. Pipindutin nila ang Start nang isang beses.`,
  title: "Mga koneksyon",
  unavailableFeatures: (label) =>
    `Wala pang available na feature ang ${label} sa LifeLink. Hindi ninyo kailangang magkonekta ng account.`,
  unavailableIntro: (label) => `Wala pang magagawa ang LifeLink sa ${label}.`,
};

export { connections };

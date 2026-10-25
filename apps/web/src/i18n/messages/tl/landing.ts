import type { Messages } from "../en";

const landing: Messages["landing"] = {
  everydayHelp: {
    displaySettings: [
      { label: "Laki ng teksto", value: "Mas malaki" },
      {
        label: "Basahin nang malakas ang mga sagot",
        value: "Naka-on · mas mabagal",
      },
      { label: "Mas kaunting galaw", value: "Naka-on" },
      { label: "Contrast", value: "Mas malakas" },
      { label: "Caption sa mga tawag", value: "Naka-on" },
    ],
    intro:
      "Mga mensahe sa pamilya, appointment at paalala, na may malalaking letra at pagbasa nang malakas saanman. Anumang ipapadala ay naghihintay pa rin sa inyo.",
    messages: {
      description:
        "Sumulat sa pamilya sa iMessage, email, Discord o Telegram. Ipinapaliwanag ng “Tulungan akong maunawaan” ang natanggap ninyong mensahe at nagmumungkahi ng mga sagot na mapagpipilian ninyo.",
      imageAlt:
        "Mary Cassatt, The Letter: isang babaeng naka-asul na may disenyong damit ang nagsasara ng sulat sa kanyang mesa.",
      imageCaption: "Mary Cassatt, The Letter, 1890–91.",
      title: "Mga mensahe sa pamilya",
    },
    read: {
      description:
        "Mas malalaking letra, mas malakas na contrast, caption at mas mabagal na boses sa pagbasa. Magsalita sa halip na mag-type kahit kailan. Sumusunod ang inyong mga setting sa bawat screen.",
      imageAlt:
        "Édouard Manet, Woman Reading: isang babaeng naka-madilim na coat at sumbrero ang nagbabasa ng may larawang magasin sa labas.",
      imageCaption: "Édouard Manet, Woman Reading, 1880–82.",
      title: "Magbasa, makinig o magsalita",
    },
    reminder: {
      approve: "Aprubahan ang paalala",
      changeTime: "Palitan ang oras",
      title: "Bagong paalala",
      version: "Bersyon 1",
      what: "Tawagan si Ana",
      when: "Linggo, Nobyembre 1 · 11:00 AM",
      youSaid: "Sabi ninyo: “Paalalahanan mo akong tawagan si Ana sa Linggo.”",
    },
    reminders: {
      description:
        "Nagsisimula ang Ngayon sa kailangan muna ninyong asikasuhin, pagkatapos ay mga appointment at paalala. Sabihin ang dapat tandaan at isusulat ito ng LifeLink para aprubahan ninyo.",
      title: "Mga appointment at paalala",
    },
    tab: "Tulong araw-araw",
    thread: {
      helpMeUnderstand: "Tulungan akong maunawaan",
      reply: "Oo naman! 9:45 sa inyo? Baka isama ko si Max.",
      sent: "Naipadala 9:05 AM · bersyon 2",
      sentMessage:
        "Hi Sam, puwede mo ba akong ihatid kay Dr. Patel sa Martes, Oktubre 27?",
    },
    title: "Mga naitutulong ng LifeLink",
    today: {
      comingUp: "Paparating",
      confirmPickup: "Kumpirmahin ang sundo ni Sam nang 9:45",
      greeting: "Magandang hapon, Ruth",
      review: "Suriin",
      rows: [
        { detail: "Paalala · ngayon", time: "8:00 PM", title: "Gamot sa gabi" },
        {
          detail: "Hindi pa kumpirmado",
          time: "9:45 AM",
          title: "Susunduin kayo ni Sam",
        },
        { detail: "Martes, Okt 27", time: "10:30 AM", title: "Dr. Patel" },
      ],
      waiting: "Naghihintay sa inyo",
    },
  },
  features: {
    hint: "Halimbawa. Mag-scroll o ituro ang isang hanay para makita rito ang bahaging iyon ng LifeLink.",
    items: {
      circle: {
        name: "Mga pinagkakatiwalaan",
        summary:
          "Mag-imbita gamit ang code, piliin kung ano ang makikita nila at gaano katagal, at itigil ang pagbabahagi kahit kailan.",
      },
      connections: {
        name: "Mga koneksyon",
        summary:
          "Malinaw na sinasabi ng bawat account kung ano ang gumagana, ano ang hindi pa handa, at ano ang wala.",
      },
      documents: {
        name: "Mga dokumento",
        summary: "Ang inyong mga file sa Google Drive, bawat isa may preview.",
      },
      email: {
        name: "Email",
        summary:
          "Minamarkahan ang mga email na mukhang scam, at gumagawa ng draft na sagot na hindi kusang naipapadala.",
      },
      family: {
        name: "Tanaw ng pamilya",
        summary:
          "Ang pahinang nakikita ng pamilya: tanging ibinahagi ninyo, may mga larawan at lugar para sumagot.",
      },
      groceries: {
        name: "Pamimili",
        summary:
          "Mga listahan na may budget at tantiyang presyo, handang kopyahin o i-print para sa tindahan.",
      },
      help: {
        name: "Paano ko gustong matulungan",
        summary:
          "Maikli o detalyadong sagot, isang hakbang sa bawat pagkakataon, sa wikang pipiliin ninyo.",
      },
      recap: {
        name: "Buod ng usapan",
        summary:
          "Pinaghihiwalay ang napagkasunduan sa inalok lamang, at nagmumungkahi ng susunod na hakbang.",
      },
      today: {
        name: "Ngayon",
        summary:
          "Ang kailangan muna ninyong asikasuhin, pagkatapos ay mga appointment, panahon at tatlong balitang pinili ninyo.",
      },
    },
    titleLine1: "Lahat ng iba pang",
    titleLine2: "kaya nitong gawin",
  },
  footer: {
    credits: {
      afterLicense:
        ", Wikimedia Commons. Gumagamit ng sample na datos ang mga halimbawa ng screen.",
      byAuthor: "ni RedKnight7,",
      morse: ". Morse key at register, 1876: public domain, Wikimedia Commons.",
      paintings:
        "Mary Cassatt, The Letter; Édouard Manet, Woman Reading; Claude Monet, Cliff Walk at Pourville at Water Lily Pond; Jean-Jacques de Boissieu, Old Man with a Boy Reading: public domain (CC0),",
      telegram: "Telegrama ng Western Union noong 1959",
    },
    getStarted: "Magsimula",
    label: "Footer",
    links: {
      everydayHelp: "Tulong araw-araw",
      howItWorks: "Paano ito gumagana",
      language: "Wika",
      ourPromise: "Ang aming pangako",
      questions: "Mga tanong",
      scamCheck: "Suriin kung scam",
    },
    pictures: "Mga larawan",
    signIn: "Mag-sign in",
    solitaire: "Solitaire",
    tagline:
      "Tulong sa mga mensahe araw-araw. Walang ipinapadala hangga’t hindi ninyo sinasabi.",
  },
  hero: {
    getStarted: "Magsimula",
    imageAlt:
      "Claude Monet, Cliff Walk at Pourville: dalawang tao sa mabulaklak na bangin sa itaas ng maliwanag na dagat na may mga bangkang may layag.",
    imageCaption: "Claude Monet, Cliff Walk at Pourville, 1882.",
    intro:
      "Tinutulungan kayo ng LifeLink na sumulat sa pamilya, subaybayan ang mga appointment, at suriin ang mga text o sulat na kahina-hinala. Binabasa ninyo nang buo ang bawat mensahe bago ito aprubahan.",
    seeHowItWorks: "Tingnan kung paano ito gumagana",
    titleLine1: "Walang ipinapadala",
    titleLine2: "hangga’t hindi ninyo sinasabi.",
  },
  howItWorks: {
    done: "Tapos",
    exampleTimes: "Halimbawang oras",
    imageAlt:
      "Ukit ng Morse key, relay at register, na may tatak na Indicator, Relay, Key at Line Battery.",
    imageCaption:
      "Morse key at register, inukit para sa Popular Science Monthly, 1876.",
    intro:
      "Narito ang isang pakiusap na magpahatid mula simula hanggang dulo. May simpleng pangalan ang bawat hakbang, kaya lagi ninyong alam kung ano ang nangyari at ano ang hindi pa.",
    result: "Dalawang beses kayong nag-apruba. Wala nang ibang naipadala.",
    slipTitle: "Hatid papunta kay Dr. Patel",
    timeline: [
      {
        heading: "Lunes ng umaga",
        steps: [
          { label: "Nakiusap kayong magpahatid", time: "9:02 AM" },
          { label: "Isinulat ng LifeLink ang mensahe", time: "9:02 AM" },
          {
            decision: true,
            label: "Binago ninyo ang isang salita at inaprubahan ang bersyon 2",
            time: "9:05 AM",
          },
          { label: "Naipadala kay Sam sa iMessage", time: "9:05 AM" },
        ],
      },
      {
        heading: "Lunes ng hapon",
        steps: [
          { label: "Sagot ni Sam: “Oo naman, 9:45?”", time: "1:40 PM" },
          {
            decision: true,
            label: "Kinumpirma ninyo ang oras ng sundo",
            time: "1:52 PM",
          },
        ],
      },
      {
        heading: "Martes, Oktubre 27",
        steps: [
          { label: "Paalala: darating si Sam nang 9:45", time: "9:15 AM" },
          { label: "Appointment kay Dr. Patel", time: "10:30 AM" },
        ],
      },
    ],
    titleLine1: "Ano ang nangyayari",
    titleLine2: "pagkatapos ninyong humiling",
  },
  language: {
    intro:
      "Piliin ang wika ng pahinang ito. Kapag gumawa kayo ng account, pananatilihin ito ng LifeLink. Kung may account na kayo, ang wikang pinili ninyo roon ang gagamitin pag-sign in.",
    title: "Wika",
  },
  messageSlip: {
    approve: "Aprubahan at ipadala",
    message:
      "Hi Sam, puwede mo ba akong ihatid kay Dr. Patel sa Martes, Oktubre 27? Kailangan kong nandoon bago mag-10:30 AM. Salamat! Ruth",
    notSent: "Hindi pa naipapadala",
    sent: "Naipadala 9:05 AM. Wala nang ibang naipadala.",
    showAgain: "Ipakita ulit",
    to: "Para kay Sam Rivera · iMessage",
    version: "Bersyon 2",
  },
  nav: {
    howItWorks: "Paano ito gumagana",
    language: "Wika",
    questions: "Mga tanong",
    scamCheck: "Suriin kung scam",
    signIn: "Mag-sign in",
  },
  previews: {
    approveAndSend: "Aprubahan at ipadala",
    circle: {
      appointments: "Mga appointment",
      code: "Isang-gamit na code ng imbitasyon",
      notShared: "Hindi ibinahagi",
      note: "Hanggang Disyembre 31",
      rides: "Mga hatid",
      scamAlerts: "Babala sa scam",
      shared: "Ibinahagi",
      stop: "Itigil na ang pagbabahagi",
      title: "Ibinahagi kay Sam Rivera",
    },
    connections: {
      add: "Magdagdag ng inaprubahang appointment",
      footnote: "Inililista lamang ng bawat koneksyon ang talagang kaya nito.",
      notReady: "Hindi pa handa",
      note: "Nakakonekta",
      see: "Tingnan ang mga paparating na event",
      works: "Gumagana",
    },
    documents: {
      files: [
        { date: "Okt 12", name: "Buod ng Medicare.pdf" },
        { date: "Set 30", name: "Resipe ng sopas ni Ana" },
        { date: "Set 14", name: "Mga larawan ng hardin" },
      ],
      footnote:
        "Pumili ng file para makita ito. Baguhin o ibahagi ito sa Google Drive.",
      title: "Mga dokumento",
    },
    email: {
      anaSubject: "Tanghalian sa Linggo? Dalhin mo ang photo album!",
      draftBody:
        "Ang ganda ng Linggo. Dadalhin ko ang album. Ayos ba ang 12:30? Nagmamahal, Ruth",
      draftTitle: "Sagot kay Ana · draft, hindi naipadala",
      note: "3 bago",
      parcelSender: "Parcel Delivery Service",
      parcelSubject: "Kailangang kumilos: naka-hold ang inyong parcel",
      scamWarning:
        "Mukhang scam ito: humihingi ito ng bayad sa pamamagitan ng link.",
      title: "Email",
    },
    family: {
      footnote:
        "Nakakabasa at nakakasagot si Sam. Hindi makakapagpadala, makakapag-apruba o makakagastos si Sam para kay Ruth.",
      nextAppointment: "Susunod na appointment",
      note: "Ang nakikita ni Sam",
      photos: "2 bagong larawan mula sa hardin",
      replyLabel: "Sumagot kay Ruth",
      replyText: "Kita tayo sa Martes nang 9:45!",
      title: "Mga balita ni Ruth",
      when: "Dr. Patel, Martes nang 10:30 AM",
    },
    groceries: {
      copy: "Kopyahin ang listahan",
      items: [
        { label: "Oat milk, 2", value: "$7.98" },
        { label: "Whole-grain na tinapay", value: "$4.49" },
        { label: "Mansanas, 6", value: "$5.20" },
        { label: "Sangkap ng sopas para sa pagbisita ni Ana", value: "$18.40" },
      ],
      note: "$62 sa $80 na budget",
      print: "I-print",
      title: "Lingguhang pamimili",
    },
    help: {
      answers: "Mga sagot",
      language: "Wika ng tulong",
      noteLabel: "Pribadong tala",
      noteText:
        "Hindi ako gaanong nakakarinig sa telepono. Imungkahing mag-text muna.",
      on: "Naka-on",
      oneStep: "Isang hakbang bawat pagkakataon",
      short: "Maikli",
      title: "Paano ko gustong matulungan",
    },
    recap: {
      agreed: "Napagkasunduan",
      agreedText: "Ihahatid kayo ni Sam sa Martes, susunduin nang 9:45.",
      nextStep: "Mungkahing susunod na hakbang",
      nextStepText: "Paalalahanan ako sa Lunes ng gabi.",
      offered: "Inalok lamang",
      offeredText: "Baka isama ni Sam si Max.",
      review: "Suriin ang paalala",
      title: "Buod",
    },
    today: {
      goodNews: "Magandang balita, pinili ninyo",
      headlines: [
        "Pinahaba ng aklatan ang oras tuwing Linggo",
        "Inayos ng mga boluntaryo ang rose garden ng bayan",
        "Bumalik ang ferry ngayong tag-init",
      ],
      note: "Lunes",
      pickup: "Kumpirmahin ang sundo ni Sam nang 9:45",
      title: "Magandang umaga, Ruth",
      waiting: "Naghihintay sa inyo",
      weather: "Panahon",
      weatherValue: "58°F, mahinang ulan",
    },
  },
  promise: {
    howSharingWorks: "Paano gumagana ang pagbabahagi",
    leftImageAlt:
      "Etching ng isang matandang lalaking nagbabasa ng aklat na may batang lalaki sa kandungan, katabi ng maliit na mesa.",
    leftImageCaption:
      "Jean-Jacques de Boissieu, Old Man with a Boy Reading, 1770.",
    promises: [
      "Hinding-hindi kami magpapadala ng anumang hindi ninyo nabasa at naaprubahan. Kapag nagbago ang mensahe matapos ninyong aprubahan, magtatanong kami ulit.",
      "Puwedeng malapit ang pamilya nang hindi kayo pinapangunahan. Kayo ang pipili kung ano ang makikita ng pinagkakatiwalaan ninyo, gaya ng appointment o hatid, at gaano katagal. Hindi sila kailanman makakapagpadala, makakapag-apruba o makakagastos para sa inyo.",
      "Kapag pagsasanay lamang, sinasabi namin. Kapag may nagkamali, sasabihin namin kung ano ang nangyari, na walang nawala, at ano ang susunod na gagawin.",
      "At hindi namin kailanman sasabihing ligtas ang isang mensahe. Ipinapakita namin ang mga babala at kayo ang magpapasya.",
    ],
    rightImageAlt:
      "Isang telegrama ng Western Union noong 1959, naka-type sa malalaking titik at may tatak at sulat-kamay na tala.",
    rightImageCaption:
      "Isang telegrama ng Western Union, 1959. Mahalaga ang bawat salita, at may pumirma para rito.",
    sharing:
      "Baguhin o itigil ang pagbabahagi kahit kailan, mula sa inyong Mga pinagkakatiwalaan.",
    signature: "Tulong araw-araw. Kayo ang magpapasya.",
    tab: "Ang aming pangako",
    title: "Ang hinding-hindi gagawin ng LifeLink",
  },
  questions: {
    imageAlt:
      "Claude Monet, Water Lily Pond: isang berdeng tulay na nakaarko sa lawang puno ng water lily.",
    imageCaption: "Claude Monet, Water Lily Pond, 1900.",
    intro: "Mga sagot sa pinakamadalas itanong, lahat nasa pahinang ito.",
    items: [
      {
        answer:
          "Sample na pamilya, email at appointment, para masubukan ninyo ang lahat. Walang totoong naipapadala, at may tatak na Pagsasanay ang bawat resulta.",
        question: "Ano ang Pagsasanay mode?",
      },
      {
        answer:
          "Oo. Sabihin ang kailangan ninyo, at kayang basahin ng LifeLink nang malakas ang mga sagot sa bilis na pipiliin ninyo.",
        question: "Puwede ba akong magsalita sa halip na mag-type?",
      },
      {
        answer:
          "Hindi. Tanging ibinahagi ninyo ang nakikita nila, at hindi sila kailanman makakapagpadala, makakapag-apruba o makakagastos para sa inyo.",
        question: "Puwede bang kumilos ang pamilya ko para sa akin?",
      },
      {
        answer:
          "Gmail, Outlook at Google Calendar, pati iMessage, Discord at Telegram. Malinaw na ipinapakita ng bawat isa kung ano ang gumagana at ano ang hindi pa.",
        question: "Aling mga account ang puwede kong ikonekta?",
      },
      {
        answer:
          "Hindi. Itinatabi nito ang inyong mga listahan, tinatantiya ang gastos at budget, at hinahayaan kayong kopyahin o i-print ang listahan para kayo mismo ang mamili.",
        question: "Umoorder ba ng grocery ang LifeLink?",
      },
      {
        answer:
          "Nagiging bagong bersyon ito, at hihilingin ng LifeLink na aprubahan ninyo iyon bago may maipadala.",
        question: "Paano kung baguhin ko ang mensahe?",
      },
      {
        answer:
          "Hindi. Magkakahiwalay na hakbang ang naipadala, sinagot at kinumpirma, at sinasabi ng LifeLink sa salita kung nasaan na kayo.",
        question: "Pareho ba ang “naipadala” at “napagkasunduan”?",
      },
      {
        answer:
          "Pinapangalanan nito ang mga babala at mas ligtas na susunod na hakbang. Hindi ito kailanman nangangakong ligtas ang mensahe.",
        question: "Masasabi ba nitong ligtas ang mensahe?",
      },
      {
        answer:
          "Ang Solitaire, oo, at naka-save ang laro sa device na ito. Kailangan ng koneksyon ang mga mensahe.",
        question: "Gumagana ba ito nang walang internet?",
      },
      {
        answer:
          "Makikita ninyo kung ano ang nangyari, na walang nawala, at ano ang susunod na gagawin.",
        question: "Paano kung may magkamali?",
      },
    ],
    tab: "Mga tanong",
    title: "Mga tanong",
  },
  scamCheck: {
    beCareful: "Mag-ingat sa mensaheng ito.",
    checkMessage: "Suriin ang isang mensahe",
    example: "Halimbawa",
    examples: {
      call: {
        label: "Isang tawag",
        nextStep:
          "Ibaba ang tawag at tawagan ang inyong apo sa numerong mayroon na kayo.",
        received:
          "Sabi ng tumatawag, may problema ang inyong apo at kailangang magpadala ng pera ngayon.",
        signs: [
          "Nagmamadaling humihingi ng pera.",
          "Pinalilihim sa inyo ang tawag.",
          "Gusto ng bayad sa gift card o wire transfer.",
        ],
      },
      email: {
        label: "Isang email",
        nextStep:
          "Tawagan ang inyong bangko sa numerong nakalimbag sa card. Huwag sagutin ang email na ito.",
        received:
          "Naka-lock ang inyong bank account. Kumpirmahin ang detalye ninyo ngayon para hindi ito isara.",
        signs: [
          "Nagbabantang isasara ang inyong account.",
          "Hinihiling na kumpirmahin ang pribadong detalye.",
          "Hindi tugma sa inyong bangko ang address ng nagpadala.",
        ],
      },
      letter: {
        label: "Isang sulat",
        nextStep:
          "Hanapin muna ninyo ang kumpanya ng premyo bago magbayad o magpadala ng anuman.",
        received:
          "Nanalo kayo ng $5,000. Magpadala ng $40 na processing fee para makuha ang premyo.",
        signs: [
          "Kailangang magbayad bago makatanggap.",
          "Hindi kayo sumali sa anumang paligsahan.",
          "Walang paraan para malaman kung sino ang nagpadala.",
        ],
      },
      text: {
        label: "Isang text",
        nextStep:
          "Kayo mismo ang magbukas ng app o website ng delivery company. Huwag gamitin ang link na ito.",
        received:
          "Naghihintay ang inyong parcel. Magbayad ng $1.99 na redelivery fee sa loob ng 30 minuto: parcel-redeliver.co/pay",
        signs: [
          "Minamadali kayo: magbayad sa loob ng 30 minuto.",
          "Humihingi ng bayad sa pamamagitan ng link.",
          "Hindi sariling site ng delivery company ang link.",
        ],
      },
    },
    intro:
      "Mag-paste ng text, pumili ng email, kunan ng larawan ang sulat, o suriin ang tawag sa speakerphone. Itinuturo ng LifeLink ang mga babala at nagmumungkahi ng ligtas na susunod na hakbang. Hindi nito kailanman sinasabing ligtas ang mensahe.",
    kinds: "Mga uri ng mensaheng masusuri",
    panelTitle: "Suriin kung scam",
    saferStep: "Mas ligtas na susunod na hakbang",
    tab: "Suriin kung scam",
    title: "Hindi sigurado kung totoo ang mensahe?",
    whatItLooksFor: "Ano ang hinahanap nito",
  },
  solitaire: {
    boardDescription:
      "Isang larong Klondike solitaire na kasalukuyang nilalaro. Inililipat ang otso ng spade sa nuwebe ng heart.",
    controls: ["I-undo", "Pahiwatig", "Bagong laro"],
    intro:
      "Klondike na may malalaki at malilinaw na baraha. I-tap ang baraha para ilipat, o maglaro gamit ang keyboard. Isang pindot lang ang undo at pahiwatig, at naka-save ang laro sa device na ito, kahit walang internet.",
    noAccount: "Hindi kailangan ng account.",
    play: "Maglaro ng Solitaire",
    saved: "Naka-save ang laro sa device na ito",
    titleLine1: "Isang tahimik",
    titleLine2: "na laro ng solitaire",
  },
  start: {
    alreadyHaveOne: "Gagawa kayo ng account. May account na?",
    defaultRequest:
      "Puwede ba akong ihatid ni Sam sa appointment ko sa Martes?",
    intro:
      "Sabihin sa LifeLink ang kailangan ninyo, pagkatapos ay basahin ang buong mensahe bago may maipadala. Gusto munang tumingin-tingin? Puwede ninyo itong subukan gamit ang sample na mensahe.",
    myFamily: "Sarili kong pamilya",
    request: "Ang inyong hiling",
    sampleFamily: "Sample na pamilya",
    seeDraft: "Tingnan ang draft",
    signIn: "Mag-sign in",
    titleLine1: "Magsimula sa",
    titleLine2: "isang hiling",
    tryWith: "Subukan gamit ang",
    whatHelp: "Saan ninyo gustong matulungan?",
  },
};

export { landing };

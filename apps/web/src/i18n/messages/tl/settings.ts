import type { Messages } from "../en";

const settings: Messages["settings"] = {
  accountsAndPermissions: "Mga account at pahintulot",
  accountsLink: "Mga account na maaaring gamitin ng LifeLink",
  aiEmailChecks: "Suriin ang mga bagong email gamit ang AI",
  aiEmailChecksDescription:
    "Kapag may bagong email, susuriin ito ng serbisyo ng AI sa cloud para sa mga palatandaan ng panloloko. Hindi kailanman ipinapadala ang mga lumang email o email sa pagsasanay.",
  captions: "Mga caption habang nagsasalita",
  captionsDescription:
    "Ipinapakita ang mga salita habang nakikipag-usap kayo sa LifeLink.",
  characterCount: (count, maximum) => `${count} sa ${maximum} character`,
  choicesNotSaved: (error) =>
    `Hindi pa na-save sa account ang inyong mga pinili. ${error} Pakisubukan ulit sa ibaba.`,
  contrast: "Contrast",
  contrastDescription:
    "Mas pinadidilim ng mas mataas na contrast ang teksto at pinalilinaw ang mga hangganan.",
  contrastMore: "Mas mataas na contrast",
  contrastStandard: "Karaniwan",
  defaultVoice: "Default ng LifeLink",
  demoAllowedHint: "Awtomatikong nase-save ang switch na ito.",
  demoBetweenModes:
    "Kailangang suriin ulit ang anumang inihanda sa isang mode bago ito isagawa sa kabilang mode.",
  demoDescription:
    "Sa mode ng pagsasanay, wala pong totoong ipinapadala, sine-save sa ibang lugar, o binibili. Ginagaya lang ang mga mangyayari at may tatak na “Pagsasanay”. May mga halimbawang tao at mensahe para ligtas ninyong masubukan ang app.",
  demoFailed: (error) =>
    `Hindi mabago ang mode ng pagsasanay. ${error} Pakisubukan ulit ang switch.`,
  demoOff:
    "Naka-off ang mode ng pagsasanay. Talagang mangyayari ang anumang aprubahan ninyo ngayon.",
  demoOn: "Naka-on ang mode ng pagsasanay.",
  demoTitle: "Mode ng pagsasanay",
  demoTurnedOff: "Na-off na ang mode ng pagsasanay para sa app na ito.",
  demoUse: "Gamitin ang mode ng pagsasanay",
  detailDetailed: "Detalyado",
  detailShort: "Maikli",
  explanations: "Mga paliwanag",
  explanationsDescription:
    "Ibinibigay ng Maikli ang mga pangunahing punto. Mas nagpapaliwanag ang Detalyado.",
  fullName: "Buong pangalan",
  groceriesLink: "Mga listahan ng bibilhin at badyet",
  hearSample: "Makinig sa halimbawa",
  helpDescription:
    "Ginagamit kapag nagpapaliwanag ang LifeLink ng mensahe, pagsusuri sa panloloko, buod ng usapan, o balita ng inyong umaga. Kayo lang ang nakakakita nito. Nase-save ang mga pagpipilian sa ibaba habang binabago; may sariling I-save ang mga tala na button ang mga tala.",
  helpTitle: "Paano ko gustong matulungan",
  language: "Wika",
  languageDescription:
    "Piliin ang wika para sa mga screen at tulong sa cloud ng LifeLink. Available ang mga pangunahing screen sa lahat ng sampung wika; may ilang mas bagong pahinang nasa Ingles pa rin. Ingles lang ang saklaw ng pagsusuri sa panloloko at email na gumagamit ng mga lokal na tuntunin, kaya maaaring hindi nito mapansin ang panloloko sa ibang wika. Pinananatili ang orihinal na mga salita sa sipi at mensahe.",
  lessMovement: "Bawasan ang paggalaw",
  lessMovementDescription:
    "Inaalis ang mga epektong pag-slide at unti-unting pagkawala.",
  loading: "Nilo-load ang mga setting",
  newsOnToday: "Balita sa Ngayon",
  newsOnTodayDescription:
    "Nagpapakita ng tatlong headline sa Ngayon. Doon ninyo pipiliin ang mabubuting balita o pangunahing balita.",
  notes: "Mga tala tungkol sa gusto kong tulong",
  notesHint:
    "Halimbawa, “Isang hakbang lang po muna.” Ginagamit lang ang mga ito sa paliwanag ng LifeLink para sa inyo. Hindi ito ipinapakita sa pamilya o isinasama sa mensahe. Kung papayag kayo sa paliwanag sa cloud, ipapadala ang mga talang ito kasama ng mensahe sa tagapagbigay ng AI.",
  notesNotSaved: (error) =>
    `Hindi na-save ang inyong mga tala. ${error} Nandito pa ang teksto ninyo. Piliin ang I-save ang mga tala para subukan ulit.`,
  notesSaveHint:
    "Piliin ang I-save ang mga tala para mapanatili ang mga pagbabago sa tekstong ito.",
  notesSaved: "Na-save na ang inyong mga tala.",
  oneStep: "Isang hakbang sa bawat pagkakataon",
  oneStepDescription:
    "Ipinapakita nang paisa-isa ang mga paliwanag at susunod na hakbang, na may button na Susunod.",
  permissionsLink: "Sino ang makakakita ng alin",
  postalCode: "Postal code",
  preferredName: "Pangalan na itatawag sa inyo ng LifeLink",
  profileNotSaved: (error) =>
    `Hindi na-save ang inyong profile. ${error} Nandito pa ang mga inilagay ninyo. Piliin ang I-save ang profile para subukan ulit.`,
  profileSaveHint:
    "Piliin ang I-save ang profile para mapanatili ang mga pagbabago sa bahaging ito.",
  profileTitle: "Tungkol sa inyo",
  readAloudAuto: "Awtomatikong basahin nang malakas",
  readAloudAutoDescription:
    "Binabasa nang malakas ng LifeLink ang mga bagong buod ng araw at tugon.",
  readAloudVoice: "Boses sa pagbabasa",
  readAloudVoiceDescription:
    "Piliin ang boses na magbabasa sa inyo. Ginagamit ng Default ng LifeLink ang karaniwang boses.",
  saveNotes: "I-save ang mga tala",
  saveProfile: "I-save ang profile",
  saved: "Na-save na.",
  savesAsYouChange: "Nase-save ang mga pagpipiliang ito habang binabago ninyo.",
  seeingAndHearing: "Paningin at pandinig",
  signOff: "Pangalan sa dulo ng inyong mensahe",
  signOffPlaceholder: "Halimbawa, Nanay",
  speakingSpeed: "Bilis ng pagsasalita",
  speakingSpeedDescription:
    "Gaano kabilis magsalita ang LifeLink kapag nagbabasa nang malakas.",
  speechQuicker: "Mas mabilis",
  speechSample: "Ganito ang boses ng LifeLink kapag nagbabasa para sa inyo.",
  speechSlower: "Mas mabagal",
  speechUsual: "Karaniwan",
  subline: "Gawing komportable sa inyo ang pagbasa at pakikinig sa LifeLink.",
  textSize: "Laki ng teksto",
  textSizeDescription:
    "Binabago ang bawat pahina. Tatandaan ng device na ito ang inyong pinili.",
  textSizeLarge: "Malaki",
  textSizeLarger: "Mas malaki",
  textSizeLargest: "Pinakamalaki",
  textSizeStandard: "Karaniwan",
  theme: "Maliwanag o madilim",
  themeDark: "Madilim",
  themeLight: "Maliwanag",
  themeSystem: "Tulad ng device ko",
  timeZone: "Sona ng oras",
  title: "Mga setting",
  trySavingAgain: "Subukang i-save ulit",
};

export { settings };

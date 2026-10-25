import type { Messages } from "../en";

const groceries: Messages["groceries"] = {
  about: (amount) => `mga ${amount}`,
  addItem: "Magdagdag ng bagay",
  addItems: "Magdagdag ng mga bagay",
  aisles: {
    bakery: "Mga tinapay",
    dairy: "Gatas at itlog",
    deli: "Mga pagkaing handa na",
    drinks: "Mga inumin",
    frozen: "Mga frozen na pagkain",
    household: "Mga gamit sa bahay",
    meat: "Karne at isda",
    other: "Iba pang bagay",
    pantry: "Mga pagkaing pang-imbak",
    personal: "Kalusugan at pangangalaga sa sarili",
    pets: "Mga alagang hayop",
    produce: "Prutas at gulay",
    snacks: "Mga meryenda",
  },
  allInCart: "Nasa cart na ang lahat.",
  backToGroceries: "Bumalik sa Mga bibilhin",
  backToLists: "Bumalik sa inyong mga listahan",
  budget: "Badyet",
  budgetInvalid:
    "Maglagay ng halagang gaya ng 60.00, o iwan itong blangko kung walang badyet.",
  budgetLabel: "Badyet para sa listahang ito ($)",
  cancel: "Kanselahin",
  chooseList: "Pumili ng listahan",
  clearItemSearch: "Burahin ang paghahanap",
  copied: "Nakopya na ang listahan. Maaari ninyo itong idikit sa mensahe.",
  copyAsText: "Kopyahin bilang teksto",
  copyFailed: "Hindi gumana ang pagkopya sa browser na ito. Subukang i-print.",
  current: "Mga kasalukuyang listahan",
  defaultName: "Mga bibilhin",
  deleteDescription: (name, current) =>
    `Permanenteng mabubura ang “${name}” at lahat ng laman, badyet, at pagpipilian nito. Hindi ito maibabalik.${current ? " Para maitabi ito, tapusin na lang ang pamimili." : ""}`,
  deleteList: "Burahin ang listahan",
  deleteNamed: (name) => `Permanenteng burahin ang ${name}`,
  deletePermanently: "Permanenteng burahin",
  deleteTitle: "Burahin ang listahang ito ng bibilhin?",
  deleted: (name) => `Nabura na ang “${name}”.`,
  deleting: "Binubura…",
  detailsSaved: "Na-save ang detalye ng listahan.",
  doneShopping: "Tapos na po bang mamili?",
  editDetails: "Baguhin ang detalye",
  editListDetails: "Baguhin ang detalye ng listahan",
  empty: "Wala pang listahan ng bibilhin.",
  emptyWithPast:
    "Walang kasalukuyang listahan. Magsimula ng bago o buksan ang lumang listahan sa ibaba.",
  estimate: "Tantiya",
  estimateHelp:
    "Tantiyahin ang kabuuang halaga para sa daming ito pagkatapos ng diskuwento. Ilagay ang 0 kung libre, o iwan na blangko kung hindi sigurado.",
  estimateInvalid:
    "Maglagay ng halagang gaya ng 3.50, o iwang blangko ang tantiya.",
  estimatedTotal: "Tantiyang kabuuan",
  finishHint:
    "Kapag tinapos, ililipat ang listahan sa Mga lumang listahan para magamit ulit.",
  finishTrip: "Tapusin ang pamimiling ito",
  finished: (day) => `Natapos noong ${day}`,
  finishedNote: (day) =>
    `Tinapos ninyo ang pamimiling ito noong ${day}. Nakatabi ito sa Mga lumang listahan para magamit ulit.`,
  finishedSuffix: (day) => ` · natapos noong ${day}`,
  inCart: (count) => ` · ${count} sa inyong cart`,
  inCartDetail: (count) => `${count} sa inyong cart`,
  inCartSr: " (nasa cart)",
  inYourCart: "Nasa inyong cart",
  item: "Bagay",
  itemCount: (count) => `${count} bagay`,
  itemPlaceholder: "Saging",
  itemSearch: "Maghanap ng bagay sa listahang ito",
  itemSearchCount: (shown, total) => `${shown} sa ${total} bagay ang tumutugma`,
  itemSearchPlaceholder: "Maghanap ng bagay, gaya ng gatas",
  items: "Mga bagay",
  itemsOn: (name) => `Mga bagay sa ${name}`,
  itemsToBuy: "Mga kailangang bilhin",
  keepList: "Panatilihin ang listahan",
  keepTicked: "Panatilihing may tsek",
  leftToSpend: "Natitirang magagastos",
  list: "Listahan",
  listName: "Pangalan ng listahan",
  listNumber: (count) => `Listahan ${count}`,
  listPreferences: "Mga pagpipilian sa listahan",
  lists: "Mga listahan ng bibilhin at badyet",
  loading: "Nilo-load ang inyong mga listahan",
  loadingPast: "Nilo-load ang mga lumang listahan",
  makeUsual: "Gawin itong karaniwan kong listahan",
  makeUsualTitle: "Gawin itong inyong karaniwang listahan",
  missingEstimates:
    "Walang tantiyang presyo ang ilang bagay, kaya maaaring mas mataas ang tunay na kabuuan.",
  moreAbove: "May iba pang listahan sa itaas",
  moreBelow: "Mag-scroll para sa iba pang listahan",
  moveBack: "Ibalik sa mga kasalukuyang listahan",
  moveHint: "Ilipat ang anumang bagay na nasa maling lugar.",
  moveItem: (name, direction, aisle) =>
    `Ilipat ang ${name} ${direction === "up" ? "pataas" : "pababa"}${aisle === null ? "" : `, sa ${aisle}`}`,
  movedItem: (name, direction, aisle) =>
    `Inilipat ang ${name} ${direction === "up" ? "pataas" : "pababa"}${aisle === null ? "" : `, sa ${aisle}`}.`,
  movedToPast: (name) => `Inilipat ang “${name}” sa mga lumang listahan.`,
  newEmptyList: "Bagong blangkong listahan",
  newList: "Bagong listahan",
  noBudget: "Walang badyet",
  noGuess: "walang tantiya",
  noMatchingItems: (query) =>
    `Walang tumutugma sa “${query}” sa listahang ito.`,
  noMatchingUnit: "Walang tumutugmang yunit.",
  notSet: "Hindi naitakda",
  notSorted: "Hindi pa nakaayos",
  notes: (notes) => `Mga tala: ${notes}`,
  nothingOnList: "Wala pang laman ang listahang ito.",
  nothingOnListHint:
    "Wala pang laman ang listahang ito. Buksan ang Magdagdag ng mga bagay para maglagay ng una.",
  openItemsHint:
    "Magdagdag ng bagay o alisin ang tsek ng isa bago mag-print o kumopya.",
  overBudget: "Lampas sa badyet",
  past: {
    count: (count) => `${count} lumang listahan`,
    empty:
      "Wala pang lumang listahan. Kapag natapos ang pamimili, dito itatabi ang listahan.",
    matchCount: (shown, total) => `${shown} sa ${total} ang tumutugma`,
    noMatch: (query) =>
      `Walang lumang listahang tumutugma sa “${query}”. Subukan ang ibang pangalan o bagay.`,
    reuse: "Gamitin ulit",
    reuseNamed: (name) => `Gamitin ulit ang ${name} bilang bagong listahan`,
    reusing: "Ginagamit ulit…",
    search: "Hanapin sa mga lumang listahan",
    searchPlaceholder: "Pangalan ng listahan o bagay, gaya ng gatas",
    seeAll: (count) => `Tingnan lahat ng lumang listahan (${count})`,
    seeAllHint: "Hanapin, gamitin ulit, o burahin ang mga natapos na pamimili",
    started: (name) => `Nagsimula ng bagong listahan mula sa “${name}”.`,
    subline:
      "Mga natapos na pamimili, pinakabago muna. Gamitin ulit ang isa para simulan ang listahan ngayong linggo.",
    title: "Mga lumang listahan",
    usualPrefix: "Inyong karaniwang listahan: ",
  },
  pastLists: "Mga lumang listahan",
  practice: {
    subline:
      "Hindi na available ang pamimili sa LifeLink. Maaari pa rin kayong magtago ng listahan ng bibilhin, magplano ng badyet, at kumopya o mag-print ng listahan.",
    title: "Hindi available ang pamimili",
  },
  preferences: "Mga gusto ninyo, isa bawat linya",
  preferencesHint:
    "Mga gustong tatak, dapat iwasan, o pangangailangan sa pagkain. Hanggang 10.",
  preferencesPlaceholder:
    "Mababa sa asin kung maaari\nAyos lang ang tatak ng tindahan",
  printList: "I-print ang listahan",
  quantity: "Dami",
  quantityErrors: {
    positive: "Maglagay ng daming higit sa 0.",
    whole:
      "Gumamit ng buong bilang para sa paisa-isang bagay o pakete. Pumili ng timbang o dami ng likido para sa sinusukat na dami.",
  },
  quickAdd: {
    added: (count) => `Naidagdag ang ${count} bagay.`,
    adding: "Idinadagdag…",
    button: "Mabilisang dagdag",
    buttonTitle: "Mag-paste ng listahan ng mga bagay",
    description:
      "Mag-paste ng listahan mula sa note, text, o email. Bawat linya ay magiging isang bagay, at nakikilala ang dami gaya ng “2 lb” o “x3”.",
    label: "Ang iyong listahan",
    none: "Mag-paste o mag-type ng listahan para makita rito ang mga bagay.",
    placeholder: "Gatas (1 gallon)\n2 lb manok\nItlog x12\nSaging",
    preview: (count) => `${count} bagay na idadagdag`,
    submit: (count) => `Idagdag ang ${count} bagay`,
    title: "Mag-paste ng listahan ng pamimili",
    tooMany: (room) =>
      `May puwang pa ang listahang ito para sa ${room} bagay. Magtanggal ng ilang linya o magsimula ng bagong listahan.`,
  },
  receiptBar: {
    estimated: "tantiya",
    left: (amount) => ` · ${amount} ang natitira`,
    over: (amount) => ` · ${amount} ang sobra`,
    see: "Tingnan ang tantiya",
    total: "kabuuan",
  },
  removeItem: (name) => `Alisin ang ${name}`,
  removed: (name) => `Naalis ang ${name}.`,
  saveDetails: "I-save ang detalye",
  scrollList: "Mag-scroll sa listahan para makita ang lahat.",
  showAllUnits: "Ipakita ang lahat ng yunit",
  sortByAisle: "Ayusin ayon sa pasilyo",
  sortFallback: {
    failed:
      "Hindi sumagot ang katulong, kaya ginamit ang gabay na kasama sa LifeLink.",
    limit:
      "Marami nang listahang inayos ng katulong kamakailan, kaya ginamit ang gabay na kasama sa LifeLink.",
    unavailable: "Inayos gamit ang gabay na kasama sa LifeLink.",
  },
  sortNewByAisle: "Ayusin ang mga bagong bagay ayon sa pasilyo",
  sortedByAisle: (count) => `Inayos ang ${count} bagay ayon sa pasilyo.`,
  sorting: "Inaayos…",
  startFromThis: "Gumawa ng bagong listahan mula rito",
  startFromUsual: "Magsimula sa inyong karaniwang listahan",
  startedFrom: (name) =>
    `Nagsimula ng bagong listahan mula sa “${name}”. Hindi nabago ang orihinal.`,
  stillToGet: "Mga kukunin pa",
  subline: "Mga listahan ng bibilhin at badyet ninyo.",
  switchLists: "Lumipat ng listahan o buksan ang dating pamimili",
  takeWithYou: "Dalhin ang inyong listahan",
  thisIsUsual: "Ito ang inyong karaniwang listahan",
  tickHint:
    "Lagyan ng tsek kapag nasa cart na ang bagay. Lilipat ito sa ibaba, kasama pa rin sa kabuuan, pero hindi sa kopya o print ng listahan. Gamitin ang mga arrow para ilipat pataas o pababa. Inaayos ng Ayusin ayon sa pasilyo ang mga bagay ayon sa karaniwang pagkakasunod sa tindahan, na huli ang frozen na pagkain.",
  title: "Mga bibilhin",
  toGet: (count) => `${count} bagay ang kukunin`,
  totalEstimate: "Kabuuang tantiya ($)",
  typeToSearch: "Mag-type para maghanap",
  undo: "I-undo",
  unit: "Yunit",
  units: {
    "": {
      label: "Bawat isa",
      short: "",
    },
    L: {
      label: "Litro (L)",
      short: "L",
    },
    bag: {
      label: "Mga supot",
      short: "supot",
    },
    bar: {
      label: "Mga bar",
      short: "bar",
    },
    bottle: {
      label: "Mga bote",
      short: "bote",
    },
    box: {
      label: "Mga kahon",
      short: "kahon",
    },
    bunch: {
      label: "Mga bungkos",
      short: "bungkos",
    },
    can: {
      label: "Mga lata",
      short: "lata",
    },
    carton: {
      label: "Mga karton",
      short: "karton",
    },
    case: {
      label: "Mga malaking kahon",
      short: "malaking kahon",
    },
    clove: {
      label: "Mga butil ng bawang",
      short: "butil",
    },
    container: {
      label: "Mga lalagyan",
      short: "lalagyan",
    },
    cup: {
      label: "Mga tasa",
      short: "tasa",
    },
    dozen: {
      label: "Mga dosena",
      short: "dosena",
    },
    ear: {
      label: "Mga mais",
      short: "mais",
    },
    "fl oz": {
      label: "Fluid ounce (fl oz)",
      short: "fl oz",
    },
    g: {
      label: "Gramo (g)",
      short: "g",
    },
    gallon: {
      label: "Galon",
      short: "gal",
    },
    head: {
      label: "Mga buong ulo",
      short: "ulo",
    },
    jar: {
      label: "Mga garapon",
      short: "garapon",
    },
    kg: {
      label: "Kilogramo (kg)",
      short: "kg",
    },
    lb: {
      label: "Libra (lb)",
      short: "lb",
    },
    loaf: {
      label: "Mga buong tinapay",
      short: "buong tinapay",
    },
    mL: {
      label: "Mililitro (mL)",
      short: "mL",
    },
    oz: {
      label: "Onsa (oz)",
      short: "oz",
    },
    pack: {
      label: "Mga pakete",
      short: "pakete",
    },
    packet: {
      label: "Mga maliit na pakete",
      short: "maliit na pakete",
    },
    piece: {
      label: "Mga piraso",
      short: "piraso",
    },
    pint: {
      label: "Pinta",
      short: "pinta",
    },
    pouch: {
      label: "Mga maliit na supot",
      short: "maliit na supot",
    },
    quart: {
      label: "Kuwareta",
      short: "kuwareta",
    },
    roll: {
      label: "Mga rolyo",
      short: "rolyo",
    },
    slice: {
      label: "Mga hiwa",
      short: "hiwa",
    },
    stick: {
      label: "Mga patpat",
      short: "patpat",
    },
    tbsp: {
      label: "Kutsara (tbsp)",
      short: "tbsp",
    },
    tsp: {
      label: "Kutsarita (tsp)",
      short: "tsp",
    },
    tub: {
      label: "Mga malaking lalagyan",
      short: "malaking lalagyan",
    },
    tube: {
      label: "Mga tubo",
      short: "tubo",
    },
  },
  unmarkAll: "Alisin lahat ng tsek",
  unmarkDescription: (count) =>
    `Aalisin ang tsek ng ${count} bagay sa cart para handa na ang listahan sa susunod na pamimili.`,
  unmarkTitle: "Alisin ang tsek ng bawat bagay?",
  unmarking: "Inaalis ang mga tsek…",
  useAgain: "Gamitin ulit ang listahang ito",
  usual: "Karaniwang listahan",
  usualHint:
    "Nasa karaniwang listahan ang kailangan ninyo sa karamihan ng linggo. Maaaring magsimula rito ang bawat bagong listahan.",
  usualNoLonger: (name) => `Hindi na “${name}” ang inyong karaniwang listahan.`,
  usualNow: (name) => `“${name}” na ang inyong karaniwang listahan.`,
  usualOnHint:
    "Maaaring magsimula rito ang mga bagong listahan. Pindutin ulit para ihinto.",
  usualSr: ", inyong karaniwang listahan",
  yourUsual: "Inyong karaniwang listahan",
};

export { groceries };

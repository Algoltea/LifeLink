import type { MahjongMessages } from "../en/mahjong";

const mahjong: MahjongMessages = {
  actions: "Mga aksiyon sa laro",
  alreadyClear: "Wala nang piyesa sa mesa.",
  biggerScreen:
    "Kailangan ng mas malaking screen para sa Mahjong upang sapat ang laki ng mga piyesa para pindutin. Buksan ang LifeLink sa tablet o computer para maglaro.",
  blocked: {
    "boxed-in":
      "Nakaharang ang magkabilang gilid ng piyesang iyon. Pumili ng piyesang walang harang sa kaliwa o kanan.",
    covered:
      "Natatakpan ng ibang piyesa ang piyesang iyon. Alisin muna ang mga piyesang nasa ibabaw nito.",
    removed: "Naipares na ang piyesang iyon.",
  },
  board: "Mesa ng mga piyesa",
  clearBoard:
    "Wala nang piyesa sa mesa. I-undo para ibalik ang huling pares, o maghanda ng panibagong laro.",
  cleared: (moves) => `Naalis ninyo ang lahat ng piyesa sa ${moves} galaw.`,
  dealAgain: "Maghanda ng panibagong laro",
  dealt: (layout) => `Nakahanda na ang bagong laro. Ayos: ${layout}.`,
  discarded:
    "Hindi mabuksan ang na-save ninyong laro, kaya naghanda ng bagong laro.",
  dragonTile: (dragon) => `Dragon: ${dragon}`,
  dragons: { green: "Berde", red: "Pula", white: "Puti" },
  earlier: "noong nakaraan",
  errors: {
    blocked: "Hindi pa maaaring piliin ang piyesang iyon.",
    "cannot-shuffle":
      "Hindi mabalasa ang mga piyesa. Subukang i-undo ang huling galaw o magsimula ng bagong laro.",
    "invalid-index": "Walang piyesa roon.",
    "no-match": "Hindi magkatugma ang mga piyesang iyon.",
    "nothing-to-shuffle": "Wala nang natitirang piyesa na babalasahin.",
    "nothing-to-undo": "Wala pang galaw na maibabalik.",
    "same-tile": "Iyon din ang parehong piyesa. Pumili ng pangalawang piyesa.",
  },
  flowerTile: (flower) => `Bulaklak: ${flower}`,
  flowers: {
    bamboo: "Kawayan",
    chrysanthemum: "Krisantemo",
    orchid: "Orkidyas",
    plum: "Bulaklak ng kaakit",
  },
  free: "Malayang piliin.",
  gestures:
    "Pindutin ang isang piyesa para piliin ito, saka pindutin ang katugmang piyesa. Pindutin ulit ang napiling piyesa para ibaba ito. Kung wala nang magalaw, ipinapakita ng Pahiwatig ang isang pares, inaayos muli ng Balasahin ang mga natitirang piyesa, at ibinabalik ng I-undo ang huling galaw. Maaaring maalis ang lahat ng piyesa sa bawat laro, kahit pagkatapos ng bawat pagbalasa.",
  groups: {
    characters: {
      matches:
        "Mga bilang mula 1 hanggang 9. Ipares ang dalawang may parehong bilang.",
      name: "Mga karakter (萬)",
    },
    dragons: {
      matches: "Pula, Berde, at Puti. Ipares ang dalawang may parehong dragon.",
      name: "Mga dragon",
    },
    flowers: {
      matches:
        "May markang 花 sa sulok. Maaaring ipares ang anumang bulaklak sa alinmang ibang bulaklak.",
      name: "Mga bulaklak",
    },
    otherSuits: {
      matches: "Mga bilang mula 1 hanggang 9, sa ayos na Klasiko lamang.",
      name: "Mga bilog (筒) at Kawayan (條)",
    },
    seasons: {
      matches:
        "May markang 季 sa sulok. Maaaring ipares ang anumang panahon sa alinmang ibang panahon.",
      name: "Mga panahon",
    },
    winds: {
      matches:
        "Silangan, Timog, Kanluran, at Hilaga. Ipares ang dalawang may parehong hangin.",
      name: "Mga hangin",
    },
  },
  guestSubtitle:
    "Isang tahimik na laro ng mga piyesa. Hindi kailangan ng account.",
  hint: "Pahiwatig",
  hintPair: (pair) => `Pahiwatig: ipares ang ${pair}.`,
  howToPlay: "Paano maglaro",
  keyboard:
    "Gamitin ang mga arrow key para lumipat sa mga malayang piyesa. Pindutin ang Enter para pumili ng piyesa at Escape para ibaba ito.",
  layout: "Ayos",
  layoutLabel: (name) => `Ayos: ${name}`,
  layoutSetting: (next, current) =>
    `Gagamitin ng mga bagong laro ang ayos na ${next}. Mananatili ang ayos na ${current} sa larong ito.`,
  layouts: { classic: "Klasiko", easy: "Madali" },
  matched: (pair, left) => `Naipares ang ${pair}. ${left} piyesa ang natitira.`,
  mismatch: (first, second) =>
    `Hindi magkatugma ang ${first} at ${second}. Napili na lang ang ${second}.`,
  moves: (count) => `${count} galaw`,
  newGame: "Bagong laro",
  onDateAt: (date, time) => `noong ${date}, ${time}`,
  pair: (first, second) => `${first} at ${second}`,
  picked: (name) => `Napili ang ${name}. Pindutin ngayon ang katugmang piyesa.`,
  playSolitaire: "Maglaro na lang ng Solitaire",
  preparing: "Inihahanda ang mga piyesa.",
  putDown: "Ibinaba ang piyesa. Walang napili.",
  ready:
    "Handa na ang bagong laro. Pumili ng maliwanag na piyesa para magsimula.",
  resumed: (when) => `Ipinagpatuloy ang larong na-save ${when}.`,
  rules:
    "Alisin ang lahat ng piyesa sa mesa sa pamamagitan ng pagpapares. Malayang piyesa lang ang maaaring kunin: walang nakapatong at walang harang sa kaliwa o kanan. Maliwanag ang mga malayang piyesa; maputla ang mga hindi pa maaaring kunin.",
  saveFailed:
    "Hindi pinapayagan ng browser na i-save ang laro, kaya mawawala ang inyong pag-usad kapag isinara ang pahina.",
  saved:
    "Nase-save ang laro sa device na ito pagkatapos ng bawat galaw, kahit walang internet.",
  scroll:
    "I-scroll nang pahalang ang mesa kung may mga piyesang hindi nakikita.",
  seasonTile: (season) => `Panahon: ${season}`,
  seasons: {
    autumn: "Taglagas",
    spring: "Tagsibol",
    summer: "Tag-init",
    winter: "Taglamig",
  },
  selected: "Napili.",
  shuffle: "Balasahin",
  shuffled: "Nabalasa na ang mga natitirang piyesa.",
  stillSelected: "Napili pa rin ang piyesang pinili ninyo.",
  stuck:
    "Walang malayang pares. Balasahin ang mga piyesa o i-undo ang huling galaw.",
  subtitle: "Isang tahimik na laro ng mga piyesa.",
  suggested: "Iminungkahi ng pahiwatig.",
  suitTile: (rank, suit) => `${rank} ng ${suit}`,
  suits: { bamboo: "Kawayan", characters: "Mga karakter", dots: "Mga bilog" },
  tileGuide: "Mga piyesa",
  tilePosition: (name, layer, row, column) =>
    `${name}, patong ${layer}, hilera ${row}, hanay ${column}.`,
  tiles: (count) => `${count} piyesa`,
  tilesLeft: (left, total) => `${left} sa ${total} piyesa ang natitira`,
  title: "Mahjong",
  todayAt: (time) => `ngayon, ${time}`,
  undo: "I-undo",
  undone: "Naibalik ang huling galaw.",
  wellPlayed: "Mahusay ang inyong laro.",
  windTile: (wind) => `Hangin: ${wind}`,
  winds: {
    east: "Silangan",
    north: "Hilaga",
    south: "Timog",
    west: "Kanluran",
  },
};

export { mahjong };

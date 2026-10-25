import type { Messages } from "../en";

const trustedPeople: Messages["trustedPeople"] = {
  add: "Magdagdag ng taong pinagkakatiwalaan",
  call: "Tawag",
  callAria: (name) => `Tawagan si ${name}`,
  callHelpMessage:
    "Hindi ako sigurado sa tawag na natanggap ko. Matutulungan mo ba akong tiyaking tunay ito bago ako magbahagi ng anuman o magpadala ng pera?",
  callsLoading:
    "Hindi available ang mga tawag hanggang ma-load ang mga setting ng account.",
  callsPractice: "Hindi available ang mga tawag sa mode ng pagsasanay.",
  contactFallback: "Kontak",
  empty:
    "Maaaring makatulong ang opinyon ng iba. Magdagdag ng kakilala sa inyong ",
  emptyRest:
    " para humingi ng tulong sa pagsusuri nito. Susuriin ninyo ang bawat mensahe bago ipadala.",
  failed: (name, error) =>
    `Hindi maihanda ang mensahe para kay ${name}. ${error} Walang ipinadala. Subukan ulit ang Ihanda ang mensahe.`,
  introCall:
    "Maghanda ng mensahe para humingi ng tulong tungkol sa tawag. Maaari ninyong basahin at baguhin bago aprubahan. Wala pang ipinapadala.",
  introCheck:
    "Maghanda ng mensahe para humingi ng tulong sa pagsusuring ito. Maaari ninyong basahin at baguhin bago aprubahan. Wala pang ipinapadala.",
  list: "Mga taong pinagkakatiwalaan",
  loading: "Nilo-load ang mga taong pinagkakatiwalaan",
  noMessageAddress: "Walang naka-save na address para sa mensahe",
  noPhone: "Walang naka-save na numero ng telepono. ",
  noWayToMessage:
    "Walang naka-save na paraan ng pagpapadala ng mensahe sa kanila. ",
  prepare: "Ihanda ang mensahe",
  prepareAria: (name) => `Maghanda ng mensahe para kay ${name}`,
  preparing: "Inihahanda…",
  reachedBy: {
    discord: "Makauugnayan sa mensahe",
    email: "Makauugnayan sa email",
    imessage: "Makauugnayan sa mensahe",
    in_app: "Makauugnayan sa LifeLink",
    telegram: "Makauugnayan sa mensahe",
  },
  saveDetails: "I-save ang kanilang detalye ng pakikipag-ugnayan sa inyong ",
  trustedCircle: "Mga pinagkakatiwalaan",
  unavailable: "Hindi available ngayon ang Tawag at Ihanda ang mensahe.",
};

export { trustedPeople };

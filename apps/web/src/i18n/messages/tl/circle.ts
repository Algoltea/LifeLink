import type { Messages } from "../en";

const circle: Messages["circle"] = {
  addPerson: "Magdagdag ng tao",
  contactFallback: "Kontak",
  edit: "Baguhin",
  editPerson: (name) => `Baguhin si ${name}`,
  empty:
    "Magdagdag ng taong pinagkakatiwalaan ninyo. Maaari ninyo silang padalhan ng mensahe at piliin ang makikita nila sa LifeLink. Wala pong ibinabahagi sa simpleng pagdagdag ng tao.",
  keep: "Panatilihin",
  loadingPeople: "Nilo-load ang mga tao",
  message: "Mensahe",
  people: "Mga tao",
  peopleCount: (count) => `${count} tao`,
  permissions: "Mga pahintulot",
  permissionsFor: (name) => ` para kay ${name}`,
  practiceContact: "Kontak para sa pagsasanay",
  reachNone: "Wala pang paraan para makaugnayan sila",
  reachTelegramWaiting: "Telegram: hinihintay silang pindutin ang Start",
  reachWhatsappSaved: "Na-save ang WhatsApp. Hindi pa makapagpadala ng mensahe",
  reachedBy: {
    discord: "Makauugnayan sa Discord",
    email: "Makauugnayan sa email",
    imessage: "Makauugnayan sa iMessage",
    in_app: "Makauugnayan sa LifeLink",
    telegram: "Makauugnayan sa Telegram",
  },
  removeConfirm: (firstName) => `Alisin si ${firstName}`,
  removeDescription: (name) =>
    `Aalisin si ${name}, at hihinto agad ang anumang ibinabahagi ninyo sa kanila.`,
  removeFailed: (error) =>
    `Hindi maalis ang taong ito. ${error} Pakipili ulit ang Alisin.`,
  removeFallback: "Alisin",
  removeNamed: (firstName) => `Alisin si ${firstName}…`,
  removePerson: "Alisin ang taong ito…",
  removeStopsSharing: (firstName) =>
    `Kapag inalis si ${firstName}, hihinto rin ang anumang ibinabahagi ninyo sa kanila.`,
  removeTitle: (name) => `Alisin si ${name}?`,
  removed: (name) => `Naalis na si ${name}.`,
  removing: "Inaalis…",
  subline:
    "Ang mga taong pinagkakatiwalaan ninyo, paano sila makauugnayan, at kung ano mismo ang makikita ng bawat isa.",
  title: "Mga pinagkakatiwalaan",
  trusted: "Pinagkakatiwalaan",
};

export { circle };

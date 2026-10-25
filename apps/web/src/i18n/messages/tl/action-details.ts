import type { Messages } from "../en";

const actionDetails: Messages["actionDetails"] = {
  and: " at ",
  appointment: "Appointment",
  budget: (amount) => ` Badyet: ${amount}.`,
  by: (channel) => `Sa pamamagitan ng ${channel}`,
  calendar: "Kalendaryo",
  confirming: "Kinukumpirma ninyo",
  document: "Dokumento",
  draftSavedIn: (provider) =>
    `Na-save bilang burador sa inyong ${provider}. Hindi ito ipapadala hanggang kayo mismo ang magpadala roon.`,
  driveNoteHint:
    "Ise-save ito bilang bagong dokumento sa inyong Google Drive. Kayo lang ang makakakita maliban kung ibabahagi ninyo roon.",
  estimate: (amount) => `Tantiya ninyo: ${amount}.`,
  event: "Kaganapan",
  itemCount: (name, count) => `${name}: ${count} bagay`,
  noEstimate: "Wala pang tantiya.",
  noJustYou: "Hindi, kayo lang",
  notGiven: "Hindi ibinigay",
  notes: "Mga tala",
  onlyGrantees: (names, scope) =>
    `Siya o sila lang (${names}) ang makakakita nito, dahil ibinabahagi ninyo ang ${scope} sa kanila.`,
  peopleYouAllowed: "mga taong pinayagan ninyo",
  readEmail: "Basahin nang malakas ang email",
  readMessage: "Basahin nang malakas ang mensahe",
  readNote: "Basahin nang malakas ang tala",
  readUpdate: "Basahin nang malakas ang balita",
  reminder: "Paalala",
  replySentFrom: (provider) =>
    `Ipapadala mula sa inyong ${provider} bilang tugon sa parehong usapan, pagkatapos lamang ninyong aprubahan.`,
  sharedWithCircle: "Ibinahagi sa inyong mga pinagkakatiwalaan",
  shoppingRecord:
    "Tala ito ng dating kahilingan sa pamimili. Hindi na available ang pamimili sa pamamagitan ng LifeLink.",
  spoken: {
    appointment: (title: string, when: string, location: string | null) =>
      `Appointment: ${title}. ${when}${location ? `, sa ${location}` : ""}.`,
    calendar: (title, when, location) =>
      `${title}. ${when}${location ? `, sa ${location}` : ""}.`,
    confirm: (summary) => `Kinukumpirma ninyo: ${summary}`,
    driveNote: (title, body) =>
      `Isang tala sa inyong Google Drive na may pamagat na ${title}. Nakasaad dito: ${body}`,
    email: (to, subject, body) =>
      `Email para kay ${to}. Paksa: ${subject}. Nakasaad dito: ${body}`,
    emailAloud: (subject, body) => `Paksa: ${subject}. ${body}`,
    message: (name, channel, route, body) =>
      `Para kay ${name}, sa ${channel}${route}. Nakasaad sa mensahe: ${body}`,
    reminder: (title, when, shared) =>
      `Paalala: ${title}. ${when}. ${shared ? "Ibinahagi sa inyong mga pinagkakatiwalaan." : "Para lang sa inyo."}`,
    reply: (to, subject, body) =>
      `Tugon kay ${to}. Paksa: ${subject}. Nakasaad dito: ${body}`,
    update: (text) => `Nakasaad sa balita: ${text}`,
  },
  starts: "Simula",
  subject: "Paksa",
  thisScope: "ito",
  to: "Para kay",
  toAddress: (address) => ` sa ${address}`,
  toName: (name) => `Para kay ${name}`,
  when: "Kailan",
  where: "Saan",
  withPhotos: (count) => `May ${count} larawan.`,
  yesShared: "Oo",
};

export { actionDetails };

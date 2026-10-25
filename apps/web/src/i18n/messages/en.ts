import { actionDetails } from "./en/action-details";
import { appExtras } from "./en/app-extras";
import { ask } from "./en/ask";
import { auth } from "./en/auth";
import { callScreening } from "./en/call-screening";
import { circle } from "./en/circle";
import { common } from "./en/common";
import { connections } from "./en/connections";
import type { ConnectionsMessages } from "./en/connections";
import { contactForm } from "./en/contact-form";
import { documents } from "./en/documents";
import { email } from "./en/email";
import { errors } from "./en/errors";
import { explanation } from "./en/explanation";
import { family } from "./en/family";
import { format } from "./en/format";
import { greeting } from "./en/greeting";
import { groceries } from "./en/groceries";
import { guest } from "./en/guest";
import { imessageSetup } from "./en/imessage-setup";
import { landing } from "./en/landing";
import { mahjong } from "./en/mahjong";
import { markets } from "./en/markets";
import { onboarding } from "./en/onboarding";
import { photoInput } from "./en/photo-input";
import { recap } from "./en/recap";
import { scam } from "./en/scam";
import { scamResult } from "./en/scam-result";
import { settings } from "./en/settings";
import { sharing } from "./en/sharing";
import { shell } from "./en/shell";
import { solitaire } from "./en/solitaire";
import { steps } from "./en/steps";
import { tasks } from "./en/tasks";
import { telegramSetup } from "./en/telegram-setup";
import { threads } from "./en/threads";
import { today } from "./en/today";
import { trustedPeople } from "./en/trusted-people";
import { voice } from "./en/voice";
import { weather } from "./en/weather";

/** LifeLink's own words in English. Every other locale must provide the same keys. */
const en = {
  actionDetails,
  appExtras,
  ask,
  auth,
  callScreening,
  circle,
  common,
  connections,
  contactForm,
  documents,
  email,
  errors,
  explanation,
  family,
  format,
  greeting,
  groceries,
  guest,
  imessageSetup,
  landing,
  mahjong,
  markets,
  onboarding,
  photoInput,
  recap,
  scam,
  scamResult,
  settings,
  sharing,
  shell,
  solitaire,
  steps,
  tasks,
  telegramSetup,
  threads,
  today,
  trustedPeople,
  voice,
  weather,
};

type Messages = Omit<typeof en, "connections"> & {
  connections: ConnectionsMessages;
};

export { en };

export type { Messages };

import type { Messages } from "./en";
import { actionDetails } from "./tl/action-details";
import { appExtras } from "./tl/app-extras";
import { ask } from "./tl/ask";
import { auth } from "./tl/auth";
import { callScreening } from "./tl/call-screening";
import { circle } from "./tl/circle";
import { common } from "./tl/common";
import { connections } from "./tl/connections";
import { contactForm } from "./tl/contact-form";
import { documents } from "./tl/documents";
import { email } from "./tl/email";
import { errors } from "./tl/errors";
import { explanation } from "./tl/explanation";
import { family } from "./tl/family";
import { format } from "./tl/format";
import { greeting } from "./tl/greeting";
import { groceries } from "./tl/groceries";
import { guest } from "./tl/guest";
import { imessageSetup } from "./tl/imessage-setup";
import { landing } from "./tl/landing";
import { mahjong } from "./tl/mahjong";
import { markets } from "./tl/markets";
import { onboarding } from "./tl/onboarding";
import { photoInput } from "./tl/photo-input";
import { recap } from "./tl/recap";
import { scam } from "./tl/scam";
import { scamResult } from "./tl/scam-result";
import { settings } from "./tl/settings";
import { sharing } from "./tl/sharing";
import { shell } from "./tl/shell";
import { solitaire } from "./tl/solitaire";
import { steps } from "./tl/steps";
import { tasks } from "./tl/tasks";
import { telegramSetup } from "./tl/telegram-setup";
import { threads } from "./tl/threads";
import { today } from "./tl/today";
import { trustedPeople } from "./tl/trusted-people";
import { voice } from "./tl/voice";
import { weather } from "./tl/weather";

/** LifeLink's own words, translated for its core screens. */
const tl: Messages = {
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

export { tl };

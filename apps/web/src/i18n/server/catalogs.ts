import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { de } from "./de";
import { es } from "./es";
import type { ServerCatalog } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ko } from "./ko";
import { pt } from "./pt";
import { tl } from "./tl";
import { vi } from "./vi";
import { zh } from "./zh";

/** Only application-owned messages are eligible for fixed-message translation. */
const serverCatalogs: Record<Exclude<InterfaceLocale, "en">, ServerCatalog> = {
  de,
  es,
  fr,
  it,
  ko,
  pt,
  tl,
  vi,
  zh,
};

export { serverCatalogs };

import {
  CHINESE_LOCALE_PATTERN,
  interfaceLocales,
} from "@lifelink/contracts/locale";

/** Where the chosen screen language is mirrored, so it applies before the account loads. */
const LOCALE_STORAGE_KEY = "lifelink:locale";

/** Inline version of the stored lookup for the pre-paint <script>, so screen readers get the right language at once. */
const LOCALE_BOOT_SCRIPT = `(function(){var l;try{l=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});}catch(e){}l=(l||navigator.language||"en").trim().toLowerCase();var b=l.split("-")[0];if(b==="zh"){var m=${CHINESE_LOCALE_PATTERN}.exec(l),v=m&&m.groups;if(v&&(v.script?v.script!=="hans":["tw","hk","mo"].includes(v.region))){b="en";}}if(b==="fil"){b="tl";}document.documentElement.lang=${JSON.stringify(interfaceLocales.map(({ id }) => id))}.includes(b)?b:"en";})();`;

export { LOCALE_BOOT_SCRIPT, LOCALE_STORAGE_KEY };

/** Where the chosen screen language is mirrored, so it applies before the account loads. */
const LOCALE_STORAGE_KEY = "lifelink:locale";

/** Inline version of the stored lookup for the pre-paint <script>, so screen readers get the right language at once. */
const LOCALE_BOOT_SCRIPT = `(function(){try{var l=(localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)})||navigator.language||"en").toLowerCase().split("-")[0];document.documentElement.lang=l==="es"?"es":"en";}catch(e){}})();`;

export { LOCALE_BOOT_SCRIPT, LOCALE_STORAGE_KEY };

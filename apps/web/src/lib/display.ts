/**
 * Display preferences applied to <html> before first paint, so text size,
 * contrast, and motion never flash. The signed-in preferences are mirrored to
 * localStorage under this key; the solitaire page reads the same key offline.
 */
const DISPLAY_STORAGE_KEY = "lifelink:display";

interface DisplayPreferences {
  contrast: "more" | "standard";
  reducedMotion: boolean;
  textScale: number;
}

const DEFAULT_DISPLAY: DisplayPreferences = {
  contrast: "standard",
  reducedMotion: false,
  textScale: 1,
};

const applyDisplay = (preferences: DisplayPreferences): void => {
  const root = document.documentElement;

  root.style.setProperty("--text-scale", String(preferences.textScale));
  root.dataset.contrast = preferences.contrast;
  root.dataset.motion = preferences.reducedMotion ? "reduced" : "full";
};

const saveDisplay = (preferences: DisplayPreferences): void => {
  try {
    localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage can be unavailable (private mode); the page still applies the values.
  }

  applyDisplay(preferences);
};

/** Inline, dependency-free version of applyDisplay for the pre-paint <script>. */
const DISPLAY_BOOT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(DISPLAY_STORAGE_KEY)})||"{}");var r=document.documentElement;var s=Number(p.textScale);if(s>=1&&s<=1.6){r.style.setProperty("--text-scale",String(s));}r.dataset.contrast=p.contrast==="more"?"more":"standard";r.dataset.motion=p.reducedMotion===true?"reduced":"full";}catch(e){}})();`;

export {
  DEFAULT_DISPLAY,
  DISPLAY_BOOT_SCRIPT,
  DISPLAY_STORAGE_KEY,
  applyDisplay,
  saveDisplay,
};

export type { DisplayPreferences };

import type { Messages } from "../en";

const weather: Messages["weather"] = {
  closeWeek: "Schließen",
  conditions: {
    Clear: "Klar",
    Cloudy: "Bewölkt",
    Drizzle: "Nieselregen",
    Fog: "Nebel",
    "Freezing drizzle": "Gefrierender Nieselregen",
    "Freezing rain": "Gefrierender Regen",
    "Freezing, watch for ice": "Frost, achten Sie auf Glatteis",
    "Heavy drizzle": "Starker Nieselregen",
    "Heavy rain": "Starker Regen",
    "Heavy showers": "Starke Schauer",
    "Heavy snow": "Starker Schneefall",
    "Heavy snow showers": "Starke Schneeschauer",
    "Icy fog": "Gefrierender Nebel",
    "Light drizzle": "Leichter Nieselregen",
    "Light rain": "Leichter Regen",
    "Light showers": "Leichte Schauer",
    "Light snow": "Leichter Schneefall",
    "Mixed weather": "Wechselhaft",
    "Mostly clear": "Überwiegend klar",
    "Partly cloudy": "Teilweise bewölkt",
    Rain: "Regen",
    "Rain likely, take a coat":
      "Regen wahrscheinlich, nehmen Sie einen Mantel mit",
    Showers: "Schauer",
    Snow: "Schnee",
    "Snow grains": "Schneegriesel",
    "Snow likely, take care outside":
      "Schnee wahrscheinlich, seien Sie draußen vorsichtig",
    "Snow showers": "Schneeschauer",
    "Storms likely": "Gewitter wahrscheinlich",
    Thunderstorms: "Gewitter",
    "Thunderstorms with hail": "Gewitter mit Hagel",
    "Very hot, drink water": "Sehr heiß, trinken Sie Wasser",
  },
  dataFrom: "Wetterdaten von ",
  high: "Höchsttemperatur ",
  highLow: (high, low) => `· Höchstwert ${high} Tiefstwert ${low}`,
  low: "Tiefsttemperatur ",
  practiceSample: "Beispielwetter zum Üben. ",
  showWeek: ". Wetter der Woche anzeigen",
  spoken: (temperature, now) => `Es sind ${temperature} Grad. Wetter: ${now}.`,
  spokenRange: (high, low) =>
    ` Die heutige Höchsttemperatur beträgt ${high} Grad, die Tiefsttemperatur ${low} Grad.`,
  weatherIn: (place) => `Wetter in ${place}`,
};

export { weather };

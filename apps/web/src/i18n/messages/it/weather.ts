import type { Messages } from "../en";

const weather: Messages["weather"] = {
  closeWeek: "Chiudi",
  conditions: {
    Clear: "sereno",
    Cloudy: "nuvoloso",
    Drizzle: "pioviggine",
    Fog: "nebbia",
    "Freezing drizzle": "pioviggine gelata",
    "Freezing rain": "pioggia gelata",
    "Freezing, watch for ice": "gelo, attenzione al ghiaccio",
    "Heavy drizzle": "pioviggine intensa",
    "Heavy rain": "pioggia intensa",
    "Heavy showers": "rovesci intensi",
    "Heavy snow": "neve intensa",
    "Heavy snow showers": "rovesci di neve intensi",
    "Icy fog": "nebbia gelata",
    "Light drizzle": "pioviggine leggera",
    "Light rain": "pioggia leggera",
    "Light showers": "rovesci leggeri",
    "Light snow": "neve leggera",
    "Mixed weather": "tempo variabile",
    "Mostly clear": "prevalentemente sereno",
    "Partly cloudy": "parzialmente nuvoloso",
    Rain: "pioggia",
    "Rain likely, take a coat": "probabile pioggia, porti un cappotto",
    Showers: "rovesci",
    Snow: "neve",
    "Snow grains": "neve granulosa",
    "Snow likely, take care outside":
      "probabile neve, faccia attenzione all’aperto",
    "Snow showers": "rovesci di neve",
    "Storms likely": "probabili temporali",
    Thunderstorms: "temporali",
    "Thunderstorms with hail": "temporali con grandine",
    "Very hot, drink water": "molto caldo, beva acqua",
  },
  dataFrom: "Dati meteo da ",
  high: "Massima ",
  highLow: (high, low) => `· Max ${high} Min ${low}`,
  low: "minima ",
  practiceSample: "Meteo di esempio per la prova. ",
  showWeek: ". Mostra il meteo della settimana",
  spoken: (temperature, now) =>
    `La temperatura è di ${temperature} gradi e il tempo è ${now}.`,
  spokenRange: (high, low) =>
    ` La massima di oggi è ${high} e la minima è ${low}.`,
  weatherIn: (place) => `Meteo a ${place}`,
};

export { weather };

import type { Messages } from "../en";

const markets: Messages["markets"] = {
  asOf: (when: string) => `Prezzi aggiornati a ${when}`,
  close: "Chiudi",
  commodities: "Materie prime",
  dataFrom: "Dati di mercato da ",
  delayed:
    "I prezzi possono avere fino a 30 minuti. Solo a scopo informativo, non è un consiglio.",
  directions: { down: "in ribasso", flat: "invariato", up: "in rialzo" },
  index: "Indice",
  loading: "Caricamento dei prezzi di oggi…",
  names: {
    coffee: "Caffè",
    gold: "Oro",
    oil: "Petrolio greggio",
    silver: "Argento",
  },
  pause: "Metti in pausa lo scorrimento dei prezzi",
  play: "Avvia lo scorrimento dei prezzi",
  showAll: ". Mostra tutti i prezzi",
  stocks: "Azioni",
  title: "Mercati",
  units: { barrel: "al barile", ounce: "all’oncia", pound: "alla libbra" },
};

export { markets };

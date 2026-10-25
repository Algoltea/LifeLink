import type { Messages } from "../en";

const markets: Messages["markets"] = {
  asOf: (when: string) => `Kurse von ${when}`,
  close: "Schließen",
  commodities: "Rohstoffe",
  dataFrom: "Marktdaten von ",
  delayed:
    "Kurse können bis zu 30 Minuten alt sein. Nur zur Information, keine Beratung.",
  directions: { down: "gefallen", flat: "unverändert", up: "gestiegen" },
  index: "Index",
  loading: "Aktuelle Kurse werden geladen…",
  names: {
    coffee: "Kaffee",
    gold: "Gold",
    oil: "Rohöl",
    silver: "Silber",
  },
  pause: "Laufende Kurse anhalten",
  play: "Laufende Kurse starten",
  showAll: ". Alle Kurse anzeigen",
  stocks: "Aktien",
  title: "Märkte",
  units: { barrel: "je Barrel", ounce: "je Unze", pound: "je Pfund" },
};

export { markets };

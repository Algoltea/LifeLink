import type { Messages } from "../en";

const markets: Messages["markets"] = {
  asOf: (when: string) => `Cours du ${when}`,
  close: "Fermer",
  commodities: "Matières premières",
  dataFrom: "Données de marché fournies par ",
  delayed:
    "Les cours peuvent dater de 30 minutes au plus. À titre d’information, pas un conseil.",
  directions: { down: "en baisse", flat: "inchangé", up: "en hausse" },
  index: "Indice",
  loading: "Chargement des cours du jour…",
  names: {
    coffee: "Café",
    gold: "Or",
    oil: "Pétrole brut",
    silver: "Argent",
  },
  pause: "Mettre en pause le défilement des cours",
  play: "Relancer le défilement des cours",
  showAll: ". Afficher tous les cours",
  stocks: "Actions",
  title: "Marchés",
  units: { barrel: "par baril", ounce: "par once", pound: "par livre" },
};

export { markets };

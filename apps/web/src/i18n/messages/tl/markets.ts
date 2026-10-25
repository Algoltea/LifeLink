import type { Messages } from "../en";

const markets: Messages["markets"] = {
  asOf: (when: string) => `Mga presyo noong ${when}`,
  close: "Isara",
  commodities: "Mga kalakal",
  dataFrom: "Datos ng merkado mula sa ",
  delayed:
    "Maaaring hanggang 30 minuto na ang mga presyo. Para sa inyong kaalaman, hindi payo.",
  directions: { down: "bumaba", flat: "walang pagbabago", up: "tumaas" },
  index: "Index",
  loading: "Kinukuha ang mga presyo ngayong araw…",
  names: {
    coffee: "Kape",
    gold: "Ginto",
    oil: "Krudong langis",
    silver: "Pilak",
  },
  pause: "Ihinto ang gumagalaw na mga presyo",
  play: "Simulan ang gumagalaw na mga presyo",
  showAll: ". Ipakita ang lahat ng presyo",
  stocks: "Mga stock",
  title: "Mga merkado",
  units: { barrel: "bawat bariles", ounce: "bawat onsa", pound: "bawat libra" },
};

export { markets };

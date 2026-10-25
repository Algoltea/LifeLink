import type { Messages } from "../en";

const markets: Messages["markets"] = {
  asOf: (when: string) => `Preços de ${when}`,
  close: "Fechar",
  commodities: "Matérias-primas",
  dataFrom: "Dados de mercado de ",
  delayed:
    "Os preços podem ter até 30 minutos. Apenas para sua informação, não é um conselho.",
  directions: { down: "em baixa", flat: "sem alteração", up: "em alta" },
  index: "Índice",
  loading: "Carregando os preços de hoje…",
  names: {
    coffee: "Café",
    gold: "Ouro",
    oil: "Petróleo bruto",
    silver: "Prata",
  },
  pause: "Pausar os preços em movimento",
  play: "Iniciar os preços em movimento",
  showAll: ". Mostrar todos os preços",
  stocks: "Ações",
  title: "Mercados",
  units: { barrel: "por barril", ounce: "por onça", pound: "por libra" },
};

export { markets };

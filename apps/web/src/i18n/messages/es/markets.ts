import type { Messages } from "../en";

const markets: Messages["markets"] = {
  asOf: (when: string) => `Precios de ${when}`,
  close: "Cerrar",
  commodities: "Materias primas",
  dataFrom: "Datos de mercado de ",
  delayed:
    "Los precios pueden tener hasta 30 minutos de antigüedad. Solo para su información, no es un consejo.",
  directions: { down: "baja", flat: "sin cambios", up: "sube" },
  index: "Índice",
  loading: "Cargando los precios de hoy…",
  names: {
    coffee: "Café",
    gold: "Oro",
    oil: "Petróleo crudo",
    silver: "Plata",
  },
  pause: "Pausar los precios en movimiento",
  play: "Iniciar los precios en movimiento",
  showAll: ". Mostrar todos los precios",
  stocks: "Acciones",
  title: "Mercados",
  units: { barrel: "por barril", ounce: "por onza", pound: "por libra" },
};

export { markets };

const markets = {
  asOf: (when: string) => `Prices as of ${when}`,
  close: "Close",
  commodities: "Commodities",
  dataFrom: "Market data from ",
  delayed:
    "Prices can be up to 30 minutes old. For your information, not advice.",
  directions: { down: "down", flat: "unchanged", up: "up" },
  index: "Index",
  loading: "Getting today’s prices…",
  names: {
    coffee: "Coffee",
    gold: "Gold",
    oil: "Crude oil",
    silver: "Silver",
  },
  pause: "Pause the moving prices",
  play: "Start the moving prices",
  showAll: ". Show all prices",
  stocks: "Stocks",
  title: "Markets",
  units: { barrel: "per barrel", ounce: "per ounce", pound: "per pound" },
};

export { markets };

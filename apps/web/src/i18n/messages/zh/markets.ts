import type { Messages } from "../en";

const markets: Messages["markets"] = {
  asOf: (when: string) => `截至 ${when} 的价格`,
  close: "关闭",
  commodities: "大宗商品",
  dataFrom: "市场数据来自 ",
  delayed: "价格可能是最多 30 分钟前的。仅供参考，不构成建议。",
  directions: { down: "下跌", flat: "持平", up: "上涨" },
  index: "指数",
  loading: "正在获取今日价格…",
  names: {
    coffee: "咖啡",
    gold: "黄金",
    oil: "原油",
    silver: "白银",
  },
  pause: "暂停滚动价格",
  play: "继续滚动价格",
  showAll: "。查看所有价格",
  stocks: "股票",
  title: "市场",
  units: { barrel: "每桶", ounce: "每盎司", pound: "每磅" },
};

export { markets };

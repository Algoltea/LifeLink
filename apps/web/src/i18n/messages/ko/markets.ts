import type { Messages } from "../en";

const markets: Messages["markets"] = {
  asOf: (when: string) => `${when} 기준 가격`,
  close: "닫기",
  commodities: "원자재",
  dataFrom: "시장 데이터 제공: ",
  delayed:
    "가격은 최대 30분 전 정보일 수 있습니다. 참고용이며 조언이 아닙니다.",
  directions: { down: "하락", flat: "변동 없음", up: "상승" },
  index: "지수",
  loading: "오늘의 가격을 불러오는 중…",
  names: {
    coffee: "커피",
    gold: "금",
    oil: "원유",
    silver: "은",
  },
  pause: "움직이는 가격 멈추기",
  play: "움직이는 가격 다시 시작",
  showAll: ". 모든 가격 보기",
  stocks: "주식",
  title: "시장",
  units: { barrel: "배럴당", ounce: "온스당", pound: "파운드당" },
};

export { markets };

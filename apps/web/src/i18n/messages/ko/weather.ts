import type { Messages } from "../en";

const weather: Messages["weather"] = {
  closeWeek: "닫기",
  // Keys match the shared English wording from @lifelink/contracts/weather.
  conditions: {
    Clear: "맑음",
    Cloudy: "흐림",
    Drizzle: "이슬비",
    Fog: "안개",
    "Freezing drizzle": "어는 이슬비",
    "Freezing rain": "어는 비",
    "Freezing, watch for ice": "영하의 날씨, 빙판길을 조심하세요",
    "Heavy drizzle": "강한 이슬비",
    "Heavy rain": "많은 비",
    "Heavy showers": "강한 소나기",
    "Heavy snow": "많은 눈",
    "Heavy snow showers": "강한 소낙눈",
    "Icy fog": "어는 안개",
    "Light drizzle": "약한 이슬비",
    "Light rain": "약한 비",
    "Light showers": "약한 소나기",
    "Light snow": "약한 눈",
    "Mixed weather": "변덕스러운 날씨",
    "Mostly clear": "대체로 맑음",
    "Partly cloudy": "구름 조금",
    Rain: "비",
    "Rain likely, take a coat": "비가 올 수 있으니 겉옷을 챙기세요",
    Showers: "소나기",
    Snow: "눈",
    "Snow grains": "싸락눈",
    "Snow likely, take care outside": "눈이 올 수 있으니 외출 시 조심하세요",
    "Snow showers": "소낙눈",
    "Storms likely": "폭풍우 가능성",
    Thunderstorms: "뇌우",
    "Thunderstorms with hail": "우박을 동반한 뇌우",
    "Very hot, drink water": "매우 더우니 물을 드세요",
  },
  dataFrom: "날씨 정보 제공: ",
  high: "최고 ",
  highLow: (high, low) => `· 최고 ${high} 최저 ${low}`,
  low: "최저 ",
  practiceSample: "연습용 예시 날씨입니다. ",
  showWeek: ". 이번 주 날씨 보기",
  spoken: (temperature, now) =>
    `현재 기온은 ${temperature}도이며, 날씨는 ${now}입니다.`,
  spokenRange: (high, low) =>
    ` 오늘 최고 기온은 ${high}도, 최저 기온은 ${low}도입니다.`,
  weatherIn: (place) => `${place} 날씨`,
};

export { weather };

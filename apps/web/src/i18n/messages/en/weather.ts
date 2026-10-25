const weather = {
  closeWeek: "Close",
  conditions: Object.fromEntries<string>([]),
  dataFrom: "Weather data from ",
  high: "High ",
  highLow: (high: string, low: string) => `· H ${high} L ${low}`,
  low: "low ",
  practiceSample: "Sample weather for practice. ",
  showWeek: ". Show the week’s weather",
  spoken: (temperature: number, now: string) =>
    `It is ${temperature} degrees and ${now}.`,
  spokenRange: (high: number, low: number) =>
    ` Today's high is ${high} and the low is ${low}.`,
  weatherIn: (place: string) => `Weather in ${place}`,
};

export { weather };

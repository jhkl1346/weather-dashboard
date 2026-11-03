const weekdayFormatter = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' })

/** 'YYYY-MM-DD'를 현지 날짜로 해석한다. (new Date('YYYY-MM-DD')는 UTC 기준이라 하루 밀릴 수 있다) */
function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** '2026-11-03' → '화' */
export function formatWeekday(date: string): string {
  return weekdayFormatter.format(parseLocalDate(date))
}

/** '2026-11-03' → '11/3' */
export function formatMonthDay(date: string): string {
  const d = parseLocalDate(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** 같은 이름의 도시를 구분할 수 있도록 지역과 국가를 붙인다. */
export function formatCityRegion(city: { admin1?: string; country: string }): string {
  return [city.admin1, city.country].filter(Boolean).join(', ')
}

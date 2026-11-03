export type TempUnit = 'C' | 'F'

export function isTempUnit(value: unknown): value is TempUnit {
  return value === 'C' || value === 'F'
}

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

/** API는 섭씨로 주므로, 화면에 보여줄 단위로 바꾼 뒤 반올림한다. */
export function convertTemp(celsius: number, unit: TempUnit): number {
  return Math.round(unit === 'F' ? toFahrenheit(celsius) : celsius)
}

/** 12.4, 'C' → '12°C' / withUnit이 false면 '12°' */
export function formatTemp(celsius: number, unit: TempUnit, withUnit = true): string {
  return `${convertTemp(celsius, unit)}°${withUnit ? unit : ''}`
}

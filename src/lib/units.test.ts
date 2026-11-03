import { convertTemp, formatTemp, isTempUnit, toFahrenheit } from './units'

describe('toFahrenheit', () => {
  it('섭씨를 화씨로 바꾼다', () => {
    expect(toFahrenheit(0)).toBe(32)
    expect(toFahrenheit(100)).toBe(212)
    expect(toFahrenheit(-40)).toBe(-40)
  })
})

describe('convertTemp', () => {
  it('단위에 맞게 바꾼 뒤 반올림한다', () => {
    expect(convertTemp(12.4, 'C')).toBe(12)
    expect(convertTemp(12.4, 'F')).toBe(54) // 54.32
    expect(convertTemp(-0.4, 'C')).toBe(-0)
  })
})

describe('formatTemp', () => {
  it('단위 기호를 붙이거나 뺄 수 있다', () => {
    expect(formatTemp(12.4, 'C')).toBe('12°C')
    expect(formatTemp(12.4, 'F')).toBe('54°F')
    expect(formatTemp(12.4, 'F', false)).toBe('54°')
  })
})

describe('isTempUnit', () => {
  it('C와 F만 허용한다', () => {
    expect(isTempUnit('C')).toBe(true)
    expect(isTempUnit('K')).toBe(false)
    expect(isTempUnit(null)).toBe(false)
  })
})

import { formatCityRegion, formatMonthDay, formatWeekday } from './format'

describe('formatWeekday', () => {
  it('날짜 문자열을 한글 요일로 바꾼다', () => {
    expect(formatWeekday('2026-11-03')).toBe('화')
    expect(formatWeekday('2026-11-08')).toBe('일')
  })
})

describe('formatMonthDay', () => {
  it('앞의 0을 뺀 월/일로 바꾼다', () => {
    expect(formatMonthDay('2026-01-05')).toBe('1/5')
  })
})

describe('formatCityRegion', () => {
  it('지역과 국가를 쉼표로 잇는다', () => {
    expect(formatCityRegion({ admin1: '경기도', country: '대한민국' })).toBe('경기도, 대한민국')
  })

  it('비어 있는 값은 건너뛴다', () => {
    expect(formatCityRegion({ country: '대한민국' })).toBe('대한민국')
    expect(formatCityRegion({ country: '' })).toBe('')
  })
})

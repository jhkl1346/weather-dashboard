import { isCity, isCityList, isSameCity } from './city'

const seoul = { name: '서울', country: '대한민국', lat: 37.5665, lon: 126.978 }

describe('isSameCity', () => {
  it('소수 둘째 자리까지 좌표가 같으면 같은 도시로 본다', () => {
    expect(isSameCity(seoul, { ...seoul, name: '서울특별시', lat: 37.5701 })).toBe(true)
    expect(isSameCity(seoul, { ...seoul, lat: 35.1796 })).toBe(false)
  })
})

describe('isCity', () => {
  it('필수 필드가 모두 있어야 City로 인정한다', () => {
    expect(isCity(seoul)).toBe(true)
    expect(isCity({ name: '서울', lat: 37.5 })).toBe(false)
    expect(isCity('서울')).toBe(false)
    expect(isCity(null)).toBe(false)
  })

  it('배열의 모든 항목을 검사한다', () => {
    expect(isCityList([seoul])).toBe(true)
    expect(isCityList([seoul, { name: 1 }])).toBe(false)
    expect(isCityList({})).toBe(false)
  })
})

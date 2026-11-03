import { describeWeather } from './weatherCode'

describe('describeWeather', () => {
  it('알려진 코드를 한글 설명으로 바꾼다', () => {
    expect(describeWeather(0).label).toBe('맑음')
    expect(describeWeather(61).label).toBe('약한 비')
  })

  it('모르는 코드는 기본값을 돌려준다', () => {
    expect(describeWeather(12345).label).toBe('알 수 없음')
  })
})

import { buildSearchNames } from './cityAliases'

describe('buildSearchNames', () => {
  it('약칭은 실제 등록된 정식 이름도 함께 검색한다', () => {
    expect(buildSearchNames('서울')).toEqual(['서울', '서울특별시'])
    expect(buildSearchNames('광주')).toEqual(['광주', '광주광역시', '광주시'])
  })

  it('별칭이 없는 한글 이름은 "시"를 붙인 이름도 검색한다', () => {
    expect(buildSearchNames('수원')).toEqual(['수원', '수원시'])
  })

  it('이미 "시"로 끝나거나 한글이 아니면 그대로 검색한다', () => {
    expect(buildSearchNames('수원시')).toEqual(['수원시'])
    expect(buildSearchNames('Seoul')).toEqual(['Seoul'])
  })

  it('앞뒤 공백을 무시하고, 빈 검색어면 빈 배열을 돌려준다', () => {
    expect(buildSearchNames('  부산 ')).toEqual(['부산', '부산광역시'])
    expect(buildSearchNames('   ')).toEqual([])
  })
})

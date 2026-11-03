/**
 * Open-Meteo 지오코딩은 등록된 이름과 정확히 같아야 찾는다.
 * 서울은 '서울특별시'로만 등록돼 있어서 '서울'로 검색하면 나오지 않으므로,
 * 흔히 쓰는 약칭을 실제 등록된 이름으로 이어 준다. (2026-11 API 응답 기준으로 확인)
 */
const ALIASES: Record<string, string[]> = {
  서울: ['서울특별시'],
  부산: ['부산광역시'],
  대구: ['대구광역시'],
  인천: ['인천광역시'],
  광주: ['광주광역시', '광주시'], // 경기도 광주시도 같이 보여준다
  대전: ['대전광역시'],
  울산: ['울산광역시'],
  // 아래 도시는 한글 이름으로 등록돼 있지 않다
  용인: ['Yongin-si'],
  통영: ['Tongyeong'],
}

const HANGUL_ONLY = /^[가-힣]+$/

/**
 * 검색어 하나로 실제로 요청할 이름 목록을 만든다.
 * - 별칭이 있으면 입력값 + 별칭
 * - 없으면 입력값 + '시'를 붙인 이름 (수원 → 수원시처럼 '시'까지 붙여 등록된 도시가 많다)
 */
export function buildSearchNames(query: string): string[] {
  const name = query.trim()
  if (!name) return []

  const alias = ALIASES[name]
  if (alias) return [name, ...alias]
  if (HANGUL_ONLY.test(name) && !name.endsWith('시')) return [name, `${name}시`]
  return [name]
}

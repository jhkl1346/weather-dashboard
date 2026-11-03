# 날씨 대시보드 프로젝트 기획서

> 이 문서를 프로젝트 루트에 `SPEC.md`로 두고, 위에서부터 순서대로 진행합니다.
> Claude Code와 작업할 때는 "SPEC.md를 읽고 다음 마일스톤을 진행해줘"처럼 요청하면 됩니다.
>
> **현재 진행 상황 (2026-11-03 기준):** 마일스톤 0~2 구현 완료 (마일스톤 1·2 커밋/push 대기). 다음은 마일스톤 3입니다.

---

## 1. 프로젝트 개요

| 항목       | 내용                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| 이름       | Weather Dashboard (가칭)                                                    |
| 한 줄 소개 | 도시를 검색하거나 현재 위치로 현재 날씨와 주간 예보를 차트로 보여주는 웹 앱 |
| 목표 직군  | 개발 (프론트엔드 중심)                                                      |
| 예상 기간  | 2~3일 (MVP 1일 + 확장 1~2일)                                                |
| 완료 기준  | 배포 링크가 있고, README가 정리되어 있고, 핵심 로직에 테스트가 있을 것      |

### 이 프로젝트로 보여줄 역량

- 외부 API 연동과 비동기 처리 (`async/await`, 요청 취소, 캐싱)
- 로딩 / 에러 / 빈 상태까지 고려한 UI 상태 관리
- TypeScript로 API 응답 타입 모델링
- 데이터 시각화 (주간 기온 차트)
- 반응형 UI와 접근성
- 테스트 코드와 배포(CI/CD)

---

## 2. 기술 스택

| 영역       | 선택                            | 선택 이유                                      |
| ---------- | ------------------------------- | ---------------------------------------------- |
| 프레임워크 | React 18 + Vite                 | 채용 공고에서 가장 흔하고 개발 환경이 빠름     |
| 언어       | TypeScript                      | API 응답 타입 안정성, 채용 기본 요건           |
| 서버 상태  | TanStack Query                  | 캐싱, 로딩/에러 상태, 재시도를 선언적으로 처리 |
| 차트       | Recharts                        | React와 궁합이 좋고 설정이 간단                |
| 스타일     | Tailwind CSS (또는 CSS Modules) | 빠른 반응형 구현                               |
| 테스트     | Vitest + React Testing Library  | Vite와 통합이 쉬움                             |
| 린트/포맷  | oxlint + Prettier               | Vite 템플릿 기본 린터로 빠르고 설정이 간단함   |
| 배포       | Vercel (또는 Netlify)           | Git push만으로 자동 배포                       |

### 날씨 API: Open-Meteo 사용

- API 키가 필요 없고 무료이며 도시 검색(지오코딩) API도 제공합니다. (개인/비상업 용도)
- 키 노출 문제가 없어서 MVP를 빠르게 끝낼 수 있습니다.
- 확장 단계에서 OpenWeatherMap으로 바꿔 보며 **"API 키를 프록시(서버리스 함수)로 숨기는 경험"**을 추가할 수 있습니다. (마일스톤 5 참고)

---

## 3. 사용할 API

### 3-1. 도시 검색 (지오코딩)

```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name=서울&count=5&language=ko&format=json
```

응답에서 사용할 값: `name`, `country`, `admin1`, `latitude`, `longitude`, `timezone`

### 3-2. 날씨 예보

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=37.57&longitude=126.98
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m
  &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max
  &timezone=auto
```

응답에서 사용할 값

- `current`: 현재 기온, 체감온도, 습도, 풍속, 날씨 코드
- `daily`: 7일치 최고/최저 기온, 강수 확률, 날씨 코드

> `weather_code`(WMO 코드)를 한글 설명과 아이콘으로 바꾸는 매핑 테이블을 `src/lib/weatherCode.ts`에 직접 만듭니다. (예: 0 = 맑음, 61 = 약한 비)
> 정확한 파라미터와 코드표는 Open-Meteo 공식 문서에서 확인하세요: https://open-meteo.com/en/docs

### 3-3. 현재 위치

브라우저 `navigator.geolocation.getCurrentPosition()` 사용 (HTTPS 필요, 사용자 권한 거부 시 대체 흐름 필요)

---

## 4. 기능 목록

### MVP (필수)

- [x] 도시 이름 검색 + 검색 결과 목록에서 선택
- [x] 현재 날씨 카드 (기온, 체감, 습도, 풍속, 날씨 아이콘/설명)
- [x] 7일 예보 리스트 (요일, 아이콘, 최고/최저, 강수 확률)
- [x] 로딩 스켈레톤 / 에러 메시지 / 검색 결과 없음 상태
- [ ] 반응형 레이아웃 (모바일 → 데스크톱)

### 확장 (추천)

- [ ] 현재 위치로 날씨 조회 (권한 거부 시 안내)
- [ ] 주간 기온 차트 (최고/최저 라인)
- [ ] 즐겨찾기 도시 (localStorage 저장, 클릭 시 바로 조회)
- [ ] 섭씨/화씨 단위 전환 (설정 저장)
- [ ] 다크 모드 (시스템 설정 연동 + 수동 토글)
- [ ] 마지막으로 본 도시 기억

### 도전 (선택)

- [ ] 시간별 예보 (24시간)
- [ ] API 키를 쓰는 다른 날씨 API로 교체하고 서버리스 프록시로 키 숨기기
- [ ] PWA (오프라인 캐시, 홈 화면 추가)
- [ ] 다국어 (한/영)

---

## 5. 폴더 구조 (제안)

```
weather-dashboard/
├─ src/
│  ├─ api/
│  │  ├─ geocoding.ts        # 도시 검색 요청
│  │  └─ forecast.ts         # 예보 요청
│  ├─ components/
│  │  ├─ SearchBar.tsx
│  │  ├─ CurrentWeather.tsx
│  │  ├─ DailyForecast.tsx
│  │  ├─ TemperatureChart.tsx
│  │  ├─ FavoriteCities.tsx
│  │  └─ states/             # Loading, Error, Empty 컴포넌트
│  ├─ hooks/
│  │  ├─ useDebounce.ts
│  │  ├─ useGeolocation.ts
│  │  ├─ useFavorites.ts     # localStorage 연동
│  │  └─ useWeather.ts       # TanStack Query 래핑
│  ├─ lib/
│  │  ├─ weatherCode.ts      # WMO 코드 → 설명/아이콘
│  │  └─ units.ts            # 섭씨/화씨 변환, 포맷터
│  ├─ types/
│  │  └─ weather.ts          # API 응답 및 도메인 타입
│  ├─ App.tsx
│  └─ main.tsx
├─ tests/                    # 또는 각 파일 옆에 *.test.ts(x)
├─ SPEC.md                   # 이 문서
├─ README.md
└─ package.json
```

---

## 6. 설계 포인트

### 6-1. 타입 모델링

API 응답을 그대로 쓰지 않고, 앱에서 쓰기 좋은 도메인 타입으로 변환하는 함수를 둡니다.

```ts
type City = { name: string; country: string; admin1?: string; lat: number; lon: number }

type CurrentWeather = {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  code: number
}

type DailyWeather = {
  date: string
  code: number
  tempMax: number
  tempMin: number
  precipProb: number
}
```

### 6-2. 데이터 흐름

```
SearchBar (입력) → useDebounce(300ms) → 지오코딩 쿼리 → 결과 목록
→ 도시 선택 → 예보 쿼리 (lat/lon 기준 캐싱) → CurrentWeather / DailyForecast / Chart
```

### 6-3. UI 상태 (모든 화면에서 4가지를 처리)

| 상태    | 처리                                                       |
| ------- | ---------------------------------------------------------- |
| loading | 스켈레톤 UI                                                |
| error   | 원인별 메시지 + 다시 시도 버튼 (네트워크 오류 / 서버 오류) |
| empty   | "검색 결과가 없어요" 안내                                  |
| success | 정상 렌더링                                                |

### 6-4. 예외 상황 체크

- [x] 검색어 입력 중 이전 요청이 늦게 도착하는 경우 (요청 취소 또는 TanStack Query 키로 해결)
- [ ] 위치 권한을 거부한 경우
- [x] 오프라인 상태
- [ ] localStorage가 막혀 있는 환경 (try/catch)
- [x] 같은 이름의 도시가 여러 개인 경우 (국가/지역 같이 표시)

### 6-5. 접근성

- 검색 입력에 `label`, 결과 목록에 `role="listbox"`와 키보드 탐색(↑ ↓ Enter)
- 색상만으로 정보를 전달하지 않기 (아이콘 + 텍스트)
- 명도 대비 확인 (다크 모드 포함)
- 차트에는 텍스트 대체 요약 제공

---

## 7. 마일스톤 (진행 순서)

각 마일스톤이 끝나면 커밋하고, 동작을 직접 확인한 뒤 다음으로 넘어갑니다.

### 마일스톤 0. 프로젝트 세팅 (30분)

- [x] `npm create vite@latest` (React + TypeScript)
- [x] oxlint, Prettier, Vitest, Tailwind 설치 및 설정
- [x] Git 저장소 생성, GitHub 연결, 첫 커밋
- [x] README 초안 (프로젝트 소개만)

### 마일스톤 1. 날씨 조회 핵심 흐름 (반나절)

- [x] 타입 정의 (`types/weather.ts`)
- [x] `api/geocoding.ts`, `api/forecast.ts` 구현
- [x] 하드코딩한 도시(서울)로 현재 날씨 표시
- [x] 단위 테스트: 응답 → 도메인 타입 변환 함수
- [x] `npm run dev`로 실제 서울 날씨가 뜨는지 확인
- [ ] 커밋/push
- 참고: `lib/weatherCode.ts`(날씨 코드 매핑)와 `useWeather` 훅, `CurrentWeather` 컴포넌트도 함께 구현됨

### 마일스톤 2. 검색과 예보 UI (반나절)

- [x] SearchBar + 디바운스 + 결과 목록
- [x] 7일 예보 리스트
- [x] Loading / Error / Empty 상태 컴포넌트
- [x] `weatherCode.ts` 매핑
- [ ] 커밋/push

### 마일스톤 3. 확장 기능 (하루)

- [ ] 주간 기온 차트
- [ ] 현재 위치 조회
- [ ] 즐겨찾기 + localStorage
- [ ] 단위 전환, 다크 모드

### 마일스톤 4. 품질과 배포 (반나절)

- [ ] 반응형 점검 (360px, 768px, 1280px)
- [ ] 접근성 점검 (키보드만으로 사용해 보기, Lighthouse)
- [ ] 테스트 보강 (훅, 주요 컴포넌트)
- [ ] Vercel 배포, GitHub Actions로 테스트/린트 자동화
- [ ] README 완성

### 마일스톤 5. 도전 과제 (선택)

- [ ] API 키가 필요한 API로 교체하고, Vercel 서버리스 함수(`/api/weather`)로 프록시 구현
- [ ] 시간별 예보, PWA, 다국어

---

## 8. 테스트 계획

| 대상               | 종류     | 예시                                           |
| ------------------ | -------- | ---------------------------------------------- |
| `units.ts`         | 단위     | 섭씨 → 화씨 변환, 소수점 반올림                |
| `weatherCode.ts`   | 단위     | 알려진 코드 매핑, 알 수 없는 코드의 기본값     |
| API 응답 변환 함수 | 단위     | 샘플 응답 → 도메인 타입                        |
| `useFavorites`     | 훅       | 추가/삭제/중복 방지, localStorage 실패 시 동작 |
| `SearchBar`        | 컴포넌트 | 입력 → 결과 표시 → 선택 시 콜백 호출           |
| 에러 상태          | 컴포넌트 | API 실패 시 에러 메시지와 재시도 버튼 표시     |

API 호출은 MSW(Mock Service Worker) 또는 `vi.fn()`으로 목킹합니다.

---

## 9. Git 규칙

- 커밋 메시지: `feat: 도시 검색 추가`, `fix: 위치 권한 거부 시 크래시 수정`, `test:`, `docs:`, `refactor:`, `chore:`
- 마일스톤 단위로 브랜치를 만들고 PR로 머지하면 이력이 깔끔해집니다. (혼자 해도 PR을 쓰면 좋은 습관으로 보입니다)
- 한 커밋에는 하나의 의미만 담습니다.

---

## 10. README 작성 가이드

README에 반드시 넣을 것

1. 프로젝트 소개와 **배포 링크**, 스크린샷 또는 GIF
2. 주요 기능
3. 기술 스택과 **선택 이유**
4. 실행 방법 (`npm install`, `npm run dev`, `npm test`)
5. 폴더 구조 요약
6. **트러블슈팅 기록** (겪은 문제 → 원인 → 해결, 최소 2~3개)
7. 개선 계획 (다음에 해볼 것)

---

## 11. 면접 대비 질문

미리 답을 정리해 두면 좋은 질문들입니다.

- 왜 React Query(TanStack Query)를 썼나요? `useEffect + fetch`와 무엇이 다른가요?
- 검색창 디바운스는 왜 필요하고, 어떻게 구현했나요?
- 이전 요청이 나중에 도착하는 경쟁 상태(race condition)는 어떻게 막았나요?
- API 키가 클라이언트에 노출되면 어떤 문제가 생기고, 어떻게 막을 수 있나요?
- 위치 권한을 거부당하면 어떻게 처리했나요?
- 접근성을 위해 어떤 것들을 고려했나요?
- 이 프로젝트에서 가장 어려웠던 부분과 해결 과정은?
- 시간이 더 있다면 무엇을 개선하겠나요?

---

## 12. 최종 체크리스트

- [ ] 배포 링크가 정상 동작하고 README에 걸려 있다
- [ ] 모바일에서도 깨지지 않는다
- [ ] 로딩 / 에러 / 빈 상태가 모두 처리되어 있다
- [ ] `npm run lint`, `npm test`가 통과한다
- [ ] 콘솔에 에러/경고가 없다
- [ ] 커밋 이력이 의미 단위로 정리되어 있다
- [ ] README에 트러블슈팅과 기술 선택 이유가 있다
- [ ] 스크린샷 또는 데모 GIF가 있다

---

## 부록. Claude Code에게 요청하는 방법 (예시)

```
SPEC.md를 읽고 마일스톤 0을 진행해줘. 끝나면 무엇을 했는지 알려주고 멈춰줘.
```

```
마일스톤 1의 api/forecast.ts를 구현하고, 응답 변환 함수에 대한 테스트도 같이 작성해줘.
```

```
방금 만든 코드에서 경쟁 상태가 생길 수 있는 부분이 있는지 리뷰해줘.
```

> 팁: 코드를 그대로 받아 쓰기보다, 만들어진 코드를 읽고 "왜 이렇게 했는지" 설명할 수 있을 때까지 질문하세요. 포트폴리오의 가치는 결국 면접에서 설명하는 능력에서 나옵니다.

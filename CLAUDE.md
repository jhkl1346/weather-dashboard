# Weather Dashboard

## 언어

- 항상 한국어로 답변한다. 설명, 질문, 작업 요약 모두 한국어로 쓴다.
- 코드 식별자(변수, 함수 이름)는 영어, 주석과 커밋 메시지는 한국어로 쓴다.
- 사용자는 개발 입문자다. 명령어와 개념은 쉬운 말로 짧게 설명한다.

## 프로젝트

- 날씨 대시보드 웹 앱 (포트폴리오용). 전체 계획과 진행 상황은 `SPEC.md`를 따른다.
- 작업을 시작하기 전에 `SPEC.md`를 읽고, 완료한 항목은 `[x]`로 갱신한다.
- 스택: React, TypeScript, Vite, TanStack Query, Recharts, Tailwind CSS, Vitest
- 날씨 데이터: Open-Meteo (API 키 없음)

## 명령어

- `npm run dev`: 개발 서버
- `npm test`: 테스트
- `npm run lint`: 린트 (oxlint)
- `npm run build`: 빌드
- `npx prettier --write .`: 포맷

## 작업 규칙

- 마일스톤 단위로 진행하고, 끝나면 린트/테스트/빌드를 실행해 결과를 알려준다.
- 커밋과 push는 사용자가 요청할 때만 한다. 커밋 메시지는 `feat:`, `fix:`, `test:`, `docs:`, `chore:` 형식으로 쓴다.
- `.env` 같은 비밀 값은 커밋하지 않는다.
- 새 기능에는 테스트를 같이 작성한다.

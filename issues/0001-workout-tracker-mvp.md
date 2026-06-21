# PRD: 운동기록 웹앱 (Workout Tracker) — MVP

> **Labels:** `ready-for-agent`
> **Status:** Ready
> **Note:** No issue tracker is configured for this repo (not a git repo, no `gh` CLI). This file is the fallback "issue". Re-file to a real tracker once one is set up.

---

## Problem Statement

운동을 시작한 헬스장 초보자(본인, 1인 사용)가 자신이 **어떤 운동을 얼마만큼 했는지** 전혀 기록하지 않고 있다. 그 결과:

- 지난주에 어떤 무게로 몇 회 들었는지 기억하지 못해, 이번 운동에서 무게를 올려야 할지 판단할 근거가 없다.
- 초보자가 운동을 지속하게 만드는 가장 큰 동력인 "내가 나아지고 있다"는 감각을 확인할 방법이 없다.
- 종이/엑셀/노션 같은 임시 수단조차 쓰지 않아, 데이터가 아예 남지 않는다.

## Solution

폰 브라우저로 헬스장에서 **세트 단위로 실시간 입력**하고, 데스크탑 웹에서 **성장(종목별 무게 추이)과 빈도(주간 운동 횟수)**를 확인하는 1인용 반응형 웹앱.

- 입력은 세트 사이 30초 안에 끝나야 하므로 마찰을 극한까지 줄인다(탭 3번 안에 한 세트 기록).
- 종목 목록은 미리 채우지 않는다. 처음 입력한 종목이 저장되어 다음부터 버튼으로 떠, 사용할수록 본인에게 정확히 맞는 목록이 자라난다.
- 폰과 데스크탑이 같은 데이터를 보려면 클라우드에 데이터가 있어야 하므로, 호스팅·DB·로그인을 한 번에 해결하는 백엔드 서비스(Supabase)를 사용한다. 로그인이 있으므로 URL을 아는 타인이 기록을 훼손할 수 없다.

## User Stories

### 기록 (입력)
1. As a 헬스장 사용자, I want 폰 브라우저로 URL에 접속해 바로 로그인된 상태로 들어가기를, so that 세트 사이 짧은 시간에 즉시 입력을 시작할 수 있다.
2. As a 사용자, I want 폰 홈화면에 추가해 앱처럼 한 번에 열기를(PWA), so that 매번 URL을 치는 마찰 없이 입력 화면에 도달한다.
3. As a 사용자, I want "오늘 세션 시작" 동작 하나로 기록을 묶기를, so that 오늘 한 운동들이 하나의 세션으로 자동으로 모인다.
4. As a 초보자, I want 이전에 한 종목을 버튼 목록에서 골라 선택하기를, so that 종목명을 타이핑하지 않고 빠르게 지정한다.
5. As a 초보자, I want 처음 하는 종목을 한 번 입력해 추가하기를, so that 다음부터는 그 종목이 버튼으로 떠 재입력이 필요 없다.
6. As a 사용자, I want 선택한 종목에 대해 무게와 횟수를 입력해 한 세트를 기록하기를, so that 세트별로 실제 수행한 내용이 남는다.
7. As a 사용자, I want 같은 종목에 세트를 연달아 추가하기를(무게·횟수가 세트마다 다를 수 있음), so that 한 종목의 모든 세트를 정확히 남긴다.
8. As a 사용자, I want 방금 입력한 세트를 즉시 수정/삭제하기를, so that 오타나 잘못 누른 값을 바로잡는다.
9. As a 사용자, I want 한 세션 안에서 여러 종목을 기록하기를, so that 오늘 한 모든 운동을 한 세션에 담는다.
10. As a 사용자, I want 입력이 자동 저장되기를, so that 폰이 잠기거나 페이지를 벗어나도 기록이 사라지지 않는다.

### 확인 (성장)
11. As a 초보자, I want 종목을 하나 선택해 그 종목의 무게 추이 그래프를 보기를, so that 지난번보다 늘었는지 한눈에 확인하고 동기를 얻는다.
12. As a 사용자, I want 그래프가 날짜(세션) 순으로 무게 변화를 보여주기를, so that "저번엔 40, 이번엔 42"라는 성장의 서사를 본다.
13. As a 사용자, I want 데스크탑 화면에서 그래프를 보기를, so that 큰 화면에서 편하게 추이를 확인한다.

### 확인 (빈도) — v1.1
14. As a 초보자, I want 주간 운동 횟수/출석을 보기를, so that 운동 습관이 들고 있는지 확인한다.
15. As a 사용자, I want 어떤 주에 운동을 빠졌는지 보기를, so that 꾸준함을 스스로 점검한다.

### 인증/계정
16. As a 1인 사용자, I want 내 계정으로만 로그인해 내 기록에 접근하기를, so that URL을 아는 타인이 내 데이터를 보거나 훼손하지 못한다.
17. As a 사용자, I want 로그인 세션이 유지되기를, so that 폰·데스크탑에서 매번 로그인하지 않는다.

## Implementation Decisions

### 아키텍처 / 스택
- **클라이언트:** Vite + React 단일 반응형 웹앱. 네이티브 앱·Next.js 미사용(이 규모엔 과함).
- **백엔드:** Supabase — Postgres(DB), Auth(본인 계정 1개), 무료 호스팅 티어.
- **차트:** Recharts(성장 그래프).
- **배포:** Vercel 또는 Netlify(깃 연결 후 자동 배포).
- **PWA:** manifest + 홈화면 추가 지원. 입력 마찰과 접속 마찰을 줄이는 핵심.

### 모듈 / 인터페이스
- **`workoutRepository` (단일 데이터 레이어 모듈, 테스트 seam):**
  Supabase 클라이언트를 이 모듈 뒤로 캡슐화. UI는 DB 구현을 모르고 이 인터페이스만 호출.
  대략의 표면:
  - `startSession()` → 새 세션 생성/반환
  - `getOrCreateExercise(name)` → 개인 종목 목록 조회/추가
  - `listExercises()` → 버튼 목록용 종목 조회(사용 빈도/최근순)
  - `addSet({ sessionId, exerciseId, weight, reps })` → 세트 추가
  - `updateSet(setId, …)` / `deleteSet(setId)` → 세트 수정/삭제
  - `getProgressByExercise(exerciseId)` → 세션별 무게 추이(성장 그래프용)
  - `getWeeklyFrequency(range)` → 주간 운동 빈도(v1.1)
- **UI 화면:** (1) 세션/입력 화면(폰 우선), (2) 종목별 성장 화면(데스크탑 우선), (3) 빈도 화면(v1.1).

### 데이터 모델 (스키마)
`세션(session) > 운동종목(exercise) > 세트(set)` 3계층.
- `sessions`: `id`, `user_id`, `started_at`
- `exercises`: `id`, `user_id`, `name` — 개인 목록. 처음 입력 시 생성, 사용자별 unique(name).
- `sets`: `id`, `session_id`, `exercise_id`, `weight`, `reps`, `created_at`
- Row Level Security: 모든 테이블 `user_id` 기준 본인 데이터만 접근.

### 입력 UX 결정
- "탭 3번 안에 한 세트 기록"을 절대 기준으로 삼는다. 디자인보다 입력 속도 우선.
- 종목 목록은 시드하지 않는다(과설계 회피). 사용하며 자라는 개인 목록.

## Testing Decisions

- **좋은 테스트의 정의:** 구현 디테일이 아니라 **외부 동작**만 검증한다. "Supabase를 어떻게 호출했는가"가 아니라 "세트를 추가하면 그 종목의 성장 데이터에 반영되는가"를 본다.
- **테스트 대상(seam):** `workoutRepository` 단일 모듈. 이 한 seam에서 입력→조회 라운드트립을 검증한다(예: `addSet` 후 `getProgressByExercise`가 그 값을 포함, `getOrCreateExercise`가 중복 생성하지 않음, `getWeeklyFrequency`가 세션 수를 정확히 집계). UI 컴포넌트는 이 모듈을 호출만 하므로 별도 단위 테스트 부담을 최소화한다.
- **Prior art:** 그린필드라 기존 테스트 없음. Supabase 로컬/테스트 인스턴스 또는 인메모리 페이크 구현을 repository 인터페이스에 맞춰 두고 그 위에서 테스트하는 패턴을 첫 prior art로 확립한다.

## Out of Scope

- 다크모드, 운동 루틴/프로그램 관리, 세트 메모, 종합 통계 대시보드, 휴식 타이머.
- 다중 사용자, 공유, 소셜, 트레이너-회원 관리.
- 네이티브 모바일 앱, 오프라인 우선(offline-first) 동기화.
- 미리 채워진 수백 개 종목 DB.
- 날짜별 raw 로그 나열 화면(사용자가 의미 없다고 명시).
- **v1.1로 미룸:** 주간 빈도 화면(스토리 14–15). v1을 실제로 2주 사용한 뒤에만 착수.

## Further Notes

- **최대 리스크 3가지:**
  1. 실시간 입력 마찰 — 세트 사이 30초 내 입력이 안 되면 앱이 죽는다. 입력 속도가 최우선.
  2. PWA/접속 마찰 — 폰에서 매번 로그인·URL 입력이 걸리면 사용 중단. 홈화면 추가 + 세션 유지 필수.
  3. 2주 사용 테스트 건너뛰기 — v1 완성 직후 기능을 더 붙이려는 충동을 참고, 먼저 실사용으로 검증.
- **MVP 단계:** v1 = (로그인 + 세션/세트 입력 + 종목별 성장 그래프). 여기서 멈추고 2주 실사용 → v1.1 = 주간 빈도.
- 본 PRD는 `/grill-me` 그릴링 세션에서 도출된 결정들을 종합한 것이다.

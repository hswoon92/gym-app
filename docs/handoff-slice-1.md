# 인수인계 — Slice 1: Walking Skeleton

> 대상 이슈: [#1 [Slice 1] Walking skeleton: 로그인하고 한 세트 기록](https://github.com/hswoon92/gym-app/issues/1)
> 브랜치: `slice-1-walking-skeleton` · 상태: **구현·실동작 검증 완료, 배포만 남음**

## 1. 무엇을 만들었나

전체 스택을 관통하는 가장 얇은 종단 경로. 로그인 → 세션 시작 → 한 세트 저장 →
새로고침 후에도 클라우드(Supabase)에 유지. 스택은 Vite + React + Supabase.

| 레이어 | 파일 | 비고 |
| --- | --- | --- |
| DB 스키마 + RLS | `supabase/migrations/0001_init.sql` | sessions/exercises/sets, user_id 기준 RLS |
| 데이터 레이어 (seam) | `src/repository/workoutRepository.js` | Supabase 구현 |
| 인메모리 페이크 | `src/repository/inMemoryWorkoutRepository.js` | 같은 인터페이스, 테스트용 |
| 계약 테스트 | `src/repository/contract.js`, `*.test.js` | 두 구현이 같은 계약 통과 |
| 인증 | `src/Auth.jsx`, `src/App.jsx` | 이메일+비번, 세션 유지 |
| 입력 UI | `src/Tracker.jsx` | 세션/종목/세트 입력·목록 |
| Supabase 클라이언트 | `src/supabaseClient.js` | env에서 URL/anon key 읽음 |
| PWA | `public/manifest.webmanifest`, `public/sw.js`, `public/icon-*.png` | 홈화면 추가 가능 |
| 배포 설정 | `vercel.json`, `public/_redirects` | SPA 라우팅 폴백 |

## 2. Acceptance criteria 현황

- [x] sessions/exercises/sets 테이블 + user_id RLS — `0001_init.sql` 적용 확인(REST 200, 비로그인 시 빈 배열)
- [x] 본인 계정 로그인 + 세션 유지 — 실제 로그인·새로고침 확인
- [x] 세션 시작 후 종목·무게·횟수로 한 세트 저장 — 실동작 확인
- [x] 저장한 세트가 새로고침/재접속 후 유지 — 실동작 확인
- [ ] **배포 URL로 폰·데스크탑 접속 + 폰 홈화면 추가** — ⬇ 4번 참고 (남은 작업)
- [x] workoutRepository addSet→조회 라운드트립 테스트 — `npm test` 4/4 통과

## 3. 로컬 실행 / 테스트

```bash
npm install
# .env.local 에 Supabase URL/anon key 필요 (4번 참고)
npm run dev      # http://localhost:5173 (점유 시 5174)
npm test         # workoutRepository 계약 4개
npm run build    # 프로덕션 빌드 → dist/
```

## 4. 환경 / 시크릿 — 중요

- **Supabase 프로젝트는 이미 생성·설정됨.** ref: `rckkoypenvgsrqehoogx`
  (URL: `https://rckkoypenvgsrqehoogx.supabase.co`)
- `0001_init.sql` 은 **이미 실행됨** (테이블+RLS 존재).
- 로그인 계정 1개 생성됨, Email "Confirm email" 옵션 꺼짐.
- **`.env.local` 은 git에 커밋되지 않음**(.gitignore). 로컬에만 있고 `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY` 두 값이 들어 있다. 새 개발 환경에서는 `.env.example` 복사 후
  Supabase 대시보드 Settings > API 에서 값 재입력.
- anon key 는 공개용이라 노출돼도 안전(RLS가 보호). `service_role` 키는 쓰지 않음.

## 5. 남은 작업 — 배포 (마지막 criteria)

1. 이 브랜치를 main 에 머지(PR 머지).
2. [vercel.com](https://vercel.com) 로그인 → **Add New > Project** → `hswoon92/gym-app` import.
3. Framework 자동감지(Vite). Build `npm run build`, Output `dist` (기본값 그대로).
4. **Environment Variables** 에 추가:
   - `VITE_SUPABASE_URL = https://rckkoypenvgsrqehoogx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY = <anon key>` (로컬 `.env.local` 값과 동일)
5. **Deploy** → 배포 URL 접속.
6. **Supabase 추가 설정**: Authentication > URL Configuration 의 **Site URL** / **Redirect URLs**
   에 배포 도메인 추가(세션 유지·인증 일관성).
7. 폰 브라우저로 배포 URL 열기 → 공유 메뉴 > **홈 화면에 추가**(PWA) 확인.

## 6. 설계 메모 / 알아둘 점

- **테스트 철학**: 구현 디테일이 아니라 외부 동작만 검증. seam은 `workoutRepository` 하나.
  같은 계약을 인메모리/Supabase 두 구현에 적용하는 패턴을 prior art로 확립함.
- **스키마 deviation**: PRD의 `sets`에는 user_id가 없었으나, RLS를 모든 테이블에서
  `auth.uid() = user_id` 한 줄로 통일하려고 `sets.user_id`를 추가함. 클라이언트는 user_id를
  보내지 않고 DB `DEFAULT auth.uid()`가 채움.
- **활성 세션**은 localStorage(`gym-app:active-session-id`)에 보관해 새로고침 후 복원.
- **PWA 설치 가능 조건**을 위해 최소 service worker(`public/sw.js`)에 fetch 핸들러만 둠.
  오프라인 우선 동기화는 범위 밖.

## 7. 다음 슬라이스 (참고)

- Slice 2~4 (v1): 세트 수정/삭제, 여러 종목/세션, 종목별 성장 그래프(Recharts).
  - `workoutRepository`에 `updateSet`/`deleteSet`/`getProgressByExercise` 추가 지점 이미 설계됨.
- Slice 5 (v1.1): 주간 빈도 — v1을 2주 실사용 후 착수(이슈 #5, PRD 명시).

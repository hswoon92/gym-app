# 운동기록 (Workout Tracker)

세트 단위로 빠르게 기록하는 1인용 반응형 운동 트래커. Vite + React + Supabase.

PRD: [`issues/0001-workout-tracker-mvp.md`](issues/0001-workout-tracker-mvp.md)

## Slice 1 — Walking skeleton

전체 스택을 관통하는 가장 얇은 종단 경로: 로그인 → 세션 시작 → 한 세트 저장 →
새로고침 후에도 유지. 클라우드(Supabase) 저장, RLS 로 본인 데이터만 접근, PWA 설치 가능.

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기 (아래 Supabase 설정 참고)
npm run dev
```

## Supabase 설정 (한 번만)

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성.
2. **SQL Editor** 에 [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   내용을 붙여넣고 실행 → `sessions` / `exercises` / `sets` 테이블과 RLS 정책 생성.
3. **Authentication > Users** 에서 본인 계정 1개 생성(이메일+비밀번호).
   (Authentication > Providers 에서 Email confirm 을 꺼두면 바로 로그인 가능.)
4. **Settings > API** 의 `Project URL` 과 `anon public` 키를 `.env.local` 에 입력:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

## 테스트

```bash
npm test
```

`workoutRepository` 계약 테스트 — `addSet` 후 조회 라운드트립, 종목 중복 미생성,
세션별 세트 격리를 검증한다. 인메모리 페이크로 돌며 Supabase 구현도 같은 계약을 만족한다.

- 데이터 레이어: [`src/repository/workoutRepository.js`](src/repository/workoutRepository.js)
  (Supabase), [`inMemoryWorkoutRepository.js`](src/repository/inMemoryWorkoutRepository.js) (페이크)
- 계약: [`src/repository/contract.js`](src/repository/contract.js)

## 배포 (Vercel 또는 Netlify)

1. 이 깃 저장소를 Vercel/Netlify 에 연결.
2. 빌드 설정: build command `npm run build`, output `dist`.
3. 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록.
4. 배포된 URL 을 폰 브라우저로 열고 **홈화면에 추가**(PWA) → 앱처럼 실행.

SPA 라우팅 폴백은 `vercel.json`(Vercel)과 `public/_redirects`(Netlify)에 포함되어 있다.

## 다음 슬라이스

Slice 2~4 = 세트 수정/삭제, 종목별 성장 그래프 등. Slice 5(주간 빈도)는 v1.1.
GitHub Issues 참고.

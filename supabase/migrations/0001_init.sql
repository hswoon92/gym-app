-- Slice 1: 세션 > 운동종목 > 세트 스키마 + user_id 기준 Row Level Security
--
-- 적용 방법: Supabase 프로젝트 > SQL Editor 에 이 파일 내용을 붙여넣고 실행한다.
-- (또는 supabase CLI: `supabase db push`)
--
-- 설계 메모: PRD 스키마에 더해 sets 에도 user_id 를 둔다. RLS 정책을 모든
-- 테이블에서 동일하게 `auth.uid() = user_id` 한 줄로 표현하기 위함이며,
-- 클라이언트는 user_id 를 보내지 않는다 (DEFAULT auth.uid() 가 채운다).

create extension if not exists pgcrypto;

-- 세션: 하루의 운동을 하나로 묶는 단위
create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  started_at  timestamptz not null default now()
);

-- 운동종목: 사용자별 개인 목록. 처음 입력 시 생성되고 이름은 사용자 내에서 unique.
create table if not exists public.exercises (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);

-- 세트: 한 종목에 대해 수행한 무게·횟수 1회
create table if not exists public.sets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id   uuid not null references public.sessions (id) on delete cascade,
  exercise_id  uuid not null references public.exercises (id) on delete cascade,
  weight       numeric not null check (weight >= 0),
  reps         integer not null check (reps > 0),
  created_at   timestamptz not null default now()
);

create index if not exists sets_session_id_idx on public.sets (session_id);
create index if not exists sets_exercise_id_idx on public.sets (exercise_id);

-- Row Level Security: 모든 테이블에서 본인(user_id = auth.uid()) 데이터만 접근.
alter table public.sessions  enable row level security;
alter table public.exercises enable row level security;
alter table public.sets      enable row level security;

drop policy if exists "own sessions" on public.sessions;
create policy "own sessions" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own exercises" on public.exercises;
create policy "own exercises" on public.exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sets" on public.sets;
create policy "own sets" on public.sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

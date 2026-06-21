import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // 배포/실행 전에 .env.local 을 채우라는 명시적 안내.
  console.error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. .env.example 을 .env.local 로 복사해 값을 채우세요.'
  )
}

// persistSession: true (기본) — 로그인 세션이 새로고침/재접속 후에도 유지된다.
export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: { persistSession: true, autoRefreshToken: true },
})

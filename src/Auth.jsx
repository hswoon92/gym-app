import { useState } from 'react'
import { supabase } from './supabaseClient.js'

// 1인 사용자용 이메일+비밀번호 로그인. 계정은 Supabase 대시보드에서 1개 생성한다.
export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function signIn(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <div className="app">
      <h1>운동기록 로그인</h1>
      <form onSubmit={signIn}>
        <input
          type="email"
          placeholder="이메일"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={busy}>
          {busy ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <p className="muted">계정은 Supabase 대시보드(Authentication &gt; Users)에서 1개 생성하세요.</p>
    </div>
  )
}

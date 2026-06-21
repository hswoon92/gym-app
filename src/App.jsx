import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'
import Auth from './Auth.jsx'
import Tracker from './Tracker.jsx'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 저장된 로그인 세션 복원(새로고침/재접속 후에도 유지).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="app"><p className="muted">불러오는 중…</p></div>
  }

  if (!session) return <Auth />
  return <Tracker user={session.user} />
}

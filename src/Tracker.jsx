import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient.js'
import { createSupabaseWorkoutRepository } from './repository/workoutRepository.js'

const SESSION_KEY = 'gym-app:active-session-id'

export default function Tracker({ user }) {
  const repo = useMemo(() => createSupabaseWorkoutRepository(supabase), [])

  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY))
  const [exercises, setExercises] = useState([])
  const [exerciseName, setExerciseName] = useState('')
  const [activeExercise, setActiveExercise] = useState(null) // { id, name }
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [sets, setSets] = useState([])
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // 활성 세션이 있으면(새로고침 후 포함) 종목 목록과 세트를 다시 불러온다 → 데이터 유지.
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    ;(async () => {
      try {
        const [exs, existingSets] = await Promise.all([
          repo.listExercises(),
          repo.getSetsForSession(sessionId),
        ])
        if (!cancelled) {
          setExercises(exs)
          setSets(existingSets)
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [repo, sessionId])

  async function startSession() {
    setError(null)
    try {
      const session = await repo.startSession()
      localStorage.setItem(SESSION_KEY, session.id)
      setSessionId(session.id)
      setSets([])
    } catch (e) {
      setError(e.message)
    }
  }

  async function pickOrCreateExercise(name) {
    setError(null)
    try {
      const ex = await repo.getOrCreateExercise(name)
      setActiveExercise(ex)
      setExerciseName('')
      setExercises((prev) =>
        prev.some((e) => e.id === ex.id) ? prev : [ex, ...prev]
      )
    } catch (e) {
      setError(e.message)
    }
  }

  async function saveSet(e) {
    e.preventDefault()
    if (!activeExercise) {
      setError('먼저 운동 종목을 선택하세요')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await repo.addSet({
        sessionId,
        exerciseId: activeExercise.id,
        weight: Number(weight),
        reps: Number(reps),
      })
      const refreshed = await repo.getSetsForSession(sessionId)
      setSets(refreshed)
      setWeight('')
      setReps('')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (!sessionId) {
    return (
      <div className="app">
        <div className="topbar">
          <span className="muted">{user.email}</span>
          <button className="secondary" onClick={signOut}>로그아웃</button>
        </div>
        <h1>오늘의 운동</h1>
        <p className="muted">세션을 시작하면 오늘 기록이 하나로 묶입니다.</p>
        {error && <div className="error">{error}</div>}
        <button onClick={startSession}>오늘 세션 시작</button>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="topbar">
        <span className="muted">{user.email}</span>
        <button className="secondary" onClick={signOut}>로그아웃</button>
      </div>
      <h1>오늘의 운동</h1>

      {exercises.length > 0 && (
        <div className="chips">
          {exercises.map((ex) => (
            <button
              key={ex.id}
              className={`chip secondary${activeExercise?.id === ex.id ? ' active' : ''}`}
              onClick={() => setActiveExercise(ex)}
            >
              {ex.name}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (exerciseName.trim()) pickOrCreateExercise(exerciseName)
        }}
      >
        <input
          placeholder="새 종목 입력 (예: 스쿼트)"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
        />
        {exerciseName.trim() && (
          <button type="submit" className="secondary">＋ 종목 추가/선택</button>
        )}
      </form>

      {activeExercise && (
        <form onSubmit={saveSet}>
          <p className="muted">선택된 종목: <strong>{activeExercise.name}</strong></p>
          <div className="row">
            <input
              type="number"
              inputMode="decimal"
              placeholder="무게(kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="횟수"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={busy}>
            {busy ? '저장 중…' : '세트 저장'}
          </button>
        </form>
      )}

      {error && <div className="error">{error}</div>}

      <ul className="set-list">
        {sets.map((s) => (
          <li key={s.id}>
            <span>{s.exercise_name}</span>
            <span>{s.weight}kg × {s.reps}</span>
          </li>
        ))}
      </ul>
      {sets.length === 0 && <p className="muted">아직 기록된 세트가 없습니다.</p>}
    </div>
  )
}

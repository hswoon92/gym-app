// Slice 1 데이터 레이어 (테스트 seam).
//
// UI 는 Supabase 구현을 모르고 이 인터페이스만 호출한다. 같은 인터페이스를
// 만족하는 인메모리 페이크가 inMemoryWorkoutRepository.js 에 있으며, 두 구현은
// contract.js 의 동일한 계약 테스트를 통과한다.
//
// 인터페이스:
//   startSession()                                -> { id, started_at }
//   getOrCreateExercise(name)                     -> { id, name }   (중복 생성하지 않음)
//   listExercises()                               -> [{ id, name }] (최근 생성순)
//   addSet({ sessionId, exerciseId, weight, reps })-> { id, ... }
//   getSetsForSession(sessionId)                  -> [{ id, weight, reps, exercise_id, exercise_name, created_at }]

export function createSupabaseWorkoutRepository(supabase) {
  async function startSession() {
    const { data, error } = await supabase
      .from('sessions')
      .insert({})
      .select('id, started_at')
      .single()
    if (error) throw error
    return data
  }

  async function getOrCreateExercise(name) {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('운동 종목 이름이 비어 있습니다')

    // 먼저 조회 — 이미 있으면 그대로 반환 (중복 생성 회피).
    const existing = await supabase
      .from('exercises')
      .select('id, name')
      .eq('name', trimmed)
      .maybeSingle()
    if (existing.error) throw existing.error
    if (existing.data) return existing.data

    // 없으면 생성. unique(user_id, name) 위반(경합)은 재조회로 회복.
    const inserted = await supabase
      .from('exercises')
      .insert({ name: trimmed })
      .select('id, name')
      .single()
    if (inserted.error) {
      const retry = await supabase
        .from('exercises')
        .select('id, name')
        .eq('name', trimmed)
        .single()
      if (retry.error) throw inserted.error
      return retry.data
    }
    return inserted.data
  }

  async function listExercises() {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  async function addSet({ sessionId, exerciseId, weight, reps }) {
    const { data, error } = await supabase
      .from('sets')
      .insert({
        session_id: sessionId,
        exercise_id: exerciseId,
        weight,
        reps,
      })
      .select('id, session_id, exercise_id, weight, reps, created_at')
      .single()
    if (error) throw error
    return data
  }

  async function getSetsForSession(sessionId) {
    const { data, error } = await supabase
      .from('sets')
      .select('id, weight, reps, exercise_id, created_at, exercises(name)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data.map((row) => ({
      id: row.id,
      weight: row.weight,
      reps: row.reps,
      exercise_id: row.exercise_id,
      exercise_name: row.exercises?.name ?? null,
      created_at: row.created_at,
    }))
  }

  return {
    startSession,
    getOrCreateExercise,
    listExercises,
    addSet,
    getSetsForSession,
  }
}

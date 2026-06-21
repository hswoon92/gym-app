// workoutRepository 의 인메모리 페이크. Supabase 없이 계약 테스트를 돌리기 위한 것.
// 동작(외부에서 관찰 가능한 결과)은 Supabase 구현과 같아야 한다.

let counter = 0
function id(prefix) {
  counter += 1
  return `${prefix}_${counter}`
}

export function createInMemoryWorkoutRepository() {
  const sessions = []
  const exercises = []
  const sets = []

  async function startSession() {
    const session = { id: id('session'), started_at: new Date().toISOString() }
    sessions.push(session)
    return { ...session }
  }

  async function getOrCreateExercise(name) {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('운동 종목 이름이 비어 있습니다')
    const existing = exercises.find((e) => e.name === trimmed)
    if (existing) return { id: existing.id, name: existing.name }
    const exercise = { id: id('exercise'), name: trimmed, created_at: new Date().toISOString() }
    exercises.push(exercise)
    return { id: exercise.id, name: exercise.name }
  }

  async function listExercises() {
    return [...exercises]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((e) => ({ id: e.id, name: e.name }))
  }

  async function addSet({ sessionId, exerciseId, weight, reps }) {
    const set = {
      id: id('set'),
      session_id: sessionId,
      exercise_id: exerciseId,
      weight,
      reps,
      created_at: new Date().toISOString(),
    }
    sets.push(set)
    return { ...set }
  }

  async function getSetsForSession(sessionId) {
    return sets
      .filter((s) => s.session_id === sessionId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((s) => ({
        id: s.id,
        weight: s.weight,
        reps: s.reps,
        exercise_id: s.exercise_id,
        exercise_name: exercises.find((e) => e.id === s.exercise_id)?.name ?? null,
        created_at: s.created_at,
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

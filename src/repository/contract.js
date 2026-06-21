// workoutRepository 계약 테스트. 어떤 구현(인메모리/Supabase)이든 이 계약을
// 통과해야 한다. 구현 디테일이 아니라 외부 동작만 검증한다.
import { describe, it, expect } from 'vitest'

export function runWorkoutRepositoryContract(name, makeRepository) {
  describe(name, () => {
    it('세트를 추가한 뒤 조회하면 그 세트가 무게·횟수·종목명과 함께 돌아온다 (라운드트립)', async () => {
      const repo = await makeRepository()
      const session = await repo.startSession()
      const squat = await repo.getOrCreateExercise('스쿼트')

      await repo.addSet({ sessionId: session.id, exerciseId: squat.id, weight: 60, reps: 5 })

      const sets = await repo.getSetsForSession(session.id)
      expect(sets).toHaveLength(1)
      expect(sets[0]).toMatchObject({
        weight: 60,
        reps: 5,
        exercise_id: squat.id,
        exercise_name: '스쿼트',
      })
    })

    it('같은 종목을 두 번 요청해도 중복 생성하지 않고 같은 id 를 돌려준다', async () => {
      const repo = await makeRepository()
      const first = await repo.getOrCreateExercise('벤치프레스')
      const second = await repo.getOrCreateExercise('벤치프레스')
      expect(second.id).toBe(first.id)

      const exercises = await repo.listExercises()
      expect(exercises.filter((e) => e.name === '벤치프레스')).toHaveLength(1)
    })

    it('한 세션의 여러 세트를 추가 순서대로 돌려준다', async () => {
      const repo = await makeRepository()
      const session = await repo.startSession()
      const ex = await repo.getOrCreateExercise('데드리프트')

      await repo.addSet({ sessionId: session.id, exerciseId: ex.id, weight: 80, reps: 5 })
      await repo.addSet({ sessionId: session.id, exerciseId: ex.id, weight: 85, reps: 3 })

      const sets = await repo.getSetsForSession(session.id)
      expect(sets.map((s) => s.weight)).toEqual([80, 85])
    })

    it('다른 세션의 세트는 섞이지 않는다', async () => {
      const repo = await makeRepository()
      const a = await repo.startSession()
      const b = await repo.startSession()
      const ex = await repo.getOrCreateExercise('오버헤드프레스')

      await repo.addSet({ sessionId: a.id, exerciseId: ex.id, weight: 30, reps: 8 })

      expect(await repo.getSetsForSession(b.id)).toHaveLength(0)
      expect(await repo.getSetsForSession(a.id)).toHaveLength(1)
    })
  })
}

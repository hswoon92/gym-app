import { runWorkoutRepositoryContract } from './contract.js'
import { createInMemoryWorkoutRepository } from './inMemoryWorkoutRepository.js'

// 인메모리 페이크로 계약을 검증한다. Supabase 구현은 같은 인터페이스를 만족하며,
// 통합 테스트(실 인스턴스)는 Slice 1 이후 CI 환경이 갖춰지면 같은 계약을 재사용한다.
runWorkoutRepositoryContract('inMemoryWorkoutRepository', () =>
  createInMemoryWorkoutRepository()
)

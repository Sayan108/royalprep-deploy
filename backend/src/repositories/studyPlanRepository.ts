import type { Pool } from 'pg'
import type { StudyPlan } from '../models/studyPlan.js'

type StoredPlan = { version: number; plan: StudyPlan }

export function createStudyPlanRepository(pool: Pool) {
  return {
    async read(owner: string): Promise<StoredPlan | undefined> {
      const result = await pool.query<StoredPlan>('SELECT version, plan FROM student_study_plans WHERE owner_email=$1', [owner])
      return result.rows[0]
    },
    async write(owner: string, version: number, plan: StudyPlan): Promise<StoredPlan | undefined> {
      try {
        const result = version === 0
          ? await pool.query<StoredPlan>('INSERT INTO student_study_plans (owner_email, version, plan) VALUES ($1, 1, $2::jsonb) RETURNING version, plan', [owner, JSON.stringify(plan)])
          : await pool.query<StoredPlan>('UPDATE student_study_plans SET version=version+1, plan=$1::jsonb, updated_at=now() WHERE owner_email=$2 AND version=$3 RETURNING version, plan', [JSON.stringify(plan), owner, version])
        return result.rows[0]
      } catch (error) {
        if (version === 0 && error instanceof Error && 'code' in error && error.code === '23505') return undefined
        throw error
      }
    },
  }
}

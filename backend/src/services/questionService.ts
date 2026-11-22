import { randomBytes } from 'node:crypto'
import type { Pool } from 'pg'
import { createPostgresQuestionRepository } from '../repositories/postgresQuestionRepository.js'

export const id = () => randomBytes(24).toString('hex')

export function createQuestionService(postgres: Pool) {
  return createPostgresQuestionRepository(postgres)
}

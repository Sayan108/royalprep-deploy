import { randomBytes } from 'node:crypto'
import { createQuestionRepository } from '../repositories/questionRepository.js'

export const id = () => randomBytes(24).toString('hex')

export function createQuestionService(memory = false) {
  return createQuestionRepository(memory)
}

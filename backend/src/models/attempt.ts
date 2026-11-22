import { z } from 'zod'
import type { Question } from './question.js'

export const startAttemptSchema = z.object({
  requestId: z.string().uuid(),
  chapters: z.array(z.string().trim().min(1).max(120)).min(1).max(100).refine(values => new Set(values).size === values.length),
  count: z.number().int().min(1).max(100),
  durationMinutes: z.number().int().min(1).max(240),
}).strict()

export const answerMutationSchema = z.object({
  expectedVersion: z.number().int().positive(),
  option: z.number().int().min(0).max(3).nullable(),
}).strict()

export const flagMutationSchema = z.object({
  expectedVersion: z.number().int().positive(),
  flagged: z.boolean(),
}).strict()

export const submitSchema = z.object({ expectedVersion: z.number().int().positive() }).strict()

export type Attempt = {
  id: string
  requestId: string
  fingerprint: string
  version: number
  status: 'active' | 'submitted'
  createdAt: number
  deadline: number
  submittedAt: number | null
  questions: Question[]
  answers: Record<string, number>
  flags: string[]
}

export function attemptView(attempt: Attempt, now: number) {
  const { questions, requestId: _requestId, fingerprint: _fingerprint, ...state } = attempt
  return {
    ...state,
    serverTime: now,
    questions: questions.map(({ id, version, chapter, stem, options, correct, explanation }) => ({
      id, version, chapter, stem, options,
      ...(attempt.status === 'submitted' ? { correct, explanation } : {}),
    })),
    ...(attempt.status === 'submitted' ? { score: questions.filter(question => attempt.answers[question.id] === question.correct).length } : {}),
  }
}

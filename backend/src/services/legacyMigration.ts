import { z } from 'zod'
import { questionContentSchema, questionInputSchema } from '../models/question.js'
import type { Question, QuestionReport } from '../models/question.js'

const legacySet = z.object({
  id: z.string().min(1), version: z.number().int().positive(),
  title: z.string().min(1), published: z.boolean(), questions: z.array(questionContentSchema),
})
const legacyReport = z.object({
  id: z.string().min(1), setId: z.string().min(1), questionIndex: z.number().int().nonnegative(),
  setVersion: z.number().int().positive(), questionStem: z.string(), message: z.string(), createdAt: z.number(),
})

export function migrateLegacySets(payloads: unknown[]): Question[] {
  return payloads.flatMap(payload => {
    const set = legacySet.parse(payload)
    const chapter = set.title.replace(/^MRCS Mock [1-5]: /, '')
    return set.questions.map((q, index) => ({
      ...questionInputSchema.parse({ ...q, chapter, published: set.published }),
      id: `${set.id}-${index}`, version: set.version,
    }))
  })
}

export function migrateLegacyReports(payloads: unknown[], questionIds: Set<string>): QuestionReport[] {
  return payloads.map(payload => {
    const report = legacyReport.parse(payload)
    const questionId = `${report.setId}-${report.questionIndex}`
    if (!questionIds.has(questionId)) throw Error(`Legacy report ${report.id} references a missing question.`)
    return {
      id: report.id, questionId, questionVersion: report.setVersion, questionStem: report.questionStem,
      message: report.message, createdAt: report.createdAt,
    }
  })
}

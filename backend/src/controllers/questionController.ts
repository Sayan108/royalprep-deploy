import type { RequestHandler } from 'express'
import { z } from 'zod'
import { questionInputSchema } from '../models/question.js'
import { createQuestionService, id } from '../services/questionService.js'
import { parseQuestionCsv } from '../services/csvImport.js'

const answerInput = z.object({ version: z.number().int().positive(), option: z.number().int().min(0).max(3) })
const reportInput = z.object({ version: z.number().int().positive(), message: z.string().trim().min(1).max(500) })

export function createQuestionController(service: ReturnType<typeof createQuestionService>) {
  const listPractice: RequestHandler = async (_req, res) => {
    const questions = await service.listQuestions(true)
    res.set('Cache-Control', 'no-store').json(questions.map(q => ({
      id: q.id, version: q.version, chapter: q.chapter, stem: q.stem, options: q.options,
    })))
  }
  const listQuestions: RequestHandler = async (_req, res) => { res.json(await service.listQuestions()) }
  const listReports: RequestHandler = async (_req, res) => { res.json(await service.listReports()) }
  const create: RequestHandler = async (req, res) => {
    const parsed = questionInputSchema.safeParse(req.body)
    if (!parsed.success) { res.status(422).json({ error: 'Provide a valid question, four distinct options, an answer, explanation, chapter and status.' }); return }
    const question = { ...parsed.data, id: id(), version: 1 }
    await service.createQuestions([question])
    res.status(201).json(question)
  }
  const update: RequestHandler = async (req, res) => {
    const parsed = questionInputSchema.safeParse(req.body)
    const version = z.number().int().positive().safeParse(req.body?.version)
    if (!parsed.success || !version.success) { res.status(422).json({ error: 'Provide a valid question and current version.' }); return }
    const existing = await service.readQuestion(String(req.params.id))
    if (!existing) { res.status(404).json({ error: 'Question not found.' }); return }
    if (existing.version !== version.data) { res.status(409).json({ error: 'Question changed; reload before editing.' }); return }
    const updated = { ...parsed.data, id: existing.id, version: existing.version + 1 }
    if (!await service.updateQuestion(updated, existing.version)) { res.status(409).json({ error: 'Question changed; reload before editing.' }); return }
    res.json(updated)
  }
  const importCsv: RequestHandler = async (req, res) => {
    const parsed = z.object({ csv: z.string().min(1).max(140_000) }).safeParse(req.body)
    if (!parsed.success) { res.status(422).json({ error: 'Provide a CSV file under 140 KB.' }); return }
    const questions = parseQuestionCsv(parsed.data.csv).map(q => ({ ...q, id: id(), version: 1 }))
    await service.createQuestions(questions)
    res.status(201).json({ count: questions.length })
  }
  const answer: RequestHandler = async (req, res) => {
    const parsed = answerInput.safeParse(req.body)
    if (!parsed.success) { res.status(422).json({ error: 'Invalid practice answer.' }); return }
    const question = await service.readQuestion(String(req.params.id))
    if (!question?.published) { res.status(404).json({ error: 'Question not found.' }); return }
    if (question.version !== parsed.data.version) { res.status(409).json({ error: 'Question changed; reload practice.' }); return }
    res.set('Cache-Control', 'no-store').json({ correct: question.correct, explanation: question.explanation, isCorrect: question.correct === parsed.data.option })
  }
  const report: RequestHandler = async (req, res) => {
    const parsed = reportInput.safeParse(req.body)
    if (!parsed.success) { res.status(422).json({ error: 'Provide a report of up to 500 characters.' }); return }
    const question = await service.readQuestion(String(req.params.id))
    if (!question?.published) { res.status(404).json({ error: 'Question not found.' }); return }
    if (question.version !== parsed.data.version) { res.status(409).json({ error: 'Question changed; reload practice.' }); return }
    await service.createReport({ id: id(), questionId: question.id, questionVersion: question.version, questionStem: question.stem, message: parsed.data.message, createdAt: Date.now() })
    res.status(201).json({ ok: true })
  }
  return { listPractice, listQuestions, listReports, create, update, importCsv, answer, report }
}

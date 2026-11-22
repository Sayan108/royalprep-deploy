import type { RequestHandler } from 'express'
import { z } from 'zod'
import { studyPlanSchema } from '../models/studyPlan.js'
import { createStudyPlanRepository } from '../repositories/studyPlanRepository.js'

export function createStudyPlanController(repository: ReturnType<typeof createStudyPlanRepository>) {
  const read: RequestHandler = async (_req, res) => {
    const owner = (res.locals.student as { email: string }).email
    res.json(await repository.read(owner) ?? { version: 0, plan: null })
  }
  const write: RequestHandler = async (req, res) => {
    const input = z.object({ expectedVersion: z.number().int().min(0).max(2_147_483_646), plan: studyPlanSchema }).strict().safeParse(req.body)
    if (!input.success) { res.status(422).json({ error: 'Provide a valid plan, unique tasks and current version.' }); return }
    const owner = (res.locals.student as { email: string }).email
    const saved = await repository.write(owner, input.data.expectedVersion, input.data.plan)
    if (!saved) { res.status(409).json({ error: 'Your plan changed elsewhere. Reload before saving.' }); return }
    res.json(saved)
  }
  return { read, write }
}

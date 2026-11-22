import type { RequestHandler } from 'express'
import { z } from 'zod'
import { heroContentSchema, revisionSchema } from '../models/hero.js'
import { createHeroRepository, HeroConflict, HeroNotFound } from '../repositories/heroRepository.js'

export function createHeroController(repository: ReturnType<typeof createHeroRepository>) {
  const publicHero: RequestHandler = async (_req, res) => {
    const hero = await repository.publicHero()
    res.set('Cache-Control', 'no-store')
    if (!hero) { res.status(404).json({ error: 'Homepage content has not been published.' }); return }
    res.json(hero)
  }
  const adminHero: RequestHandler = async (_req, res) => { res.json(await repository.adminHero()) }
  const saveDraft: RequestHandler = async (req, res) => {
    const input = z.object({ expectedRevision: revisionSchema, content: heroContentSchema }).strict().safeParse(req.body)
    if (!input.success) { res.status(422).json({ error: 'Provide valid hero fields and safe internal links.' }); return }
    try { res.json({ revision: await repository.saveDraft(input.data.expectedRevision, input.data.content) }) }
    catch (error) {
      if (error instanceof HeroConflict) { res.status(409).json({ error: error.message }); return }
      throw error
    }
  }
  const publish: RequestHandler = async (req, res) => {
    const input = z.object({ expectedRevision: revisionSchema }).strict().safeParse(req.body)
    if (!input.success) { res.status(422).json({ error: 'Provide the current hero revision.' }); return }
    try { res.json({ revision: await repository.publish(input.data.expectedRevision) }) }
    catch (error) {
      if (error instanceof HeroConflict) { res.status(409).json({ error: error.message }); return }
      if (error instanceof HeroNotFound) { res.status(404).json({ error: error.message }); return }
      throw error
    }
  }
  const restore: RequestHandler = async (req, res) => {
    const input = z.object({ expectedRevision: revisionSchema, sourceRevision: revisionSchema.min(1) }).strict().safeParse(req.body)
    if (!input.success) { res.status(422).json({ error: 'Provide the current revision and a published revision to restore.' }); return }
    try { res.json({ revision: await repository.restore(input.data.expectedRevision, input.data.sourceRevision) }) }
    catch (error) {
      if (error instanceof HeroConflict) { res.status(409).json({ error: error.message }); return }
      if (error instanceof HeroNotFound) { res.status(404).json({ error: error.message }); return }
      throw error
    }
  }
  return { publicHero, adminHero, saveDraft, publish, restore }
}

import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { createAdminAuth } from '../middleware/adminAuth.js'
import { createQuestionController } from '../controllers/questionController.js'
import { createQuestionService } from '../services/questionService.js'

export function createApiRouter(config: { adminPassword: string; secret: string; memory?: boolean }) {
  const router = Router()
  const service = createQuestionService(config.memory)
  const questions = createQuestionController(service)
  const auth = createAdminAuth(config.adminPassword, config.secret)

  router.use(rateLimit({ windowMs: 60_000, limit: 180 }))
  router.use('/admin', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
  router.post('/admin/login', rateLimit({ windowMs: 15 * 60_000, limit: 10 }), auth.login)
  router.use('/admin', auth.requireAdmin)
  router.get('/health', (_req, res) => { res.json({ ok: true, storage: config.memory ? 'memory' : 'mongodb' }) })
  router.get('/admin/questions', questions.listQuestions)
  router.post('/admin/questions', questions.create)
  router.put('/admin/questions/:id', questions.update)
  router.get('/admin/question-reports', questions.listReports)
  router.post('/admin/questions/import', questions.importCsv)
  router.get('/practice/questions', questions.listPractice)
  router.post('/practice/questions/:id/answer', questions.answer)
  router.post('/practice/questions/:id/reports', rateLimit({ windowMs: 60_000, limit: 10, handler: (_req, res) => { res.status(429).json({ error: 'Too many reports. Please try again later.' }) } }), questions.report)
  return router
}

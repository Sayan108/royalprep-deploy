import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createApiRouter } from './routes/api.js'

export function createApp(config: { adminPassword: string; secret: string; memory?: boolean; origin?: string }) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet(), cors({ origin: config.origin ?? 'http://localhost:5173' }), express.json({ limit: '150kb' }))
  app.use('/api', createApiRouter(config))
  app.use((error: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(error.message)
    res.status(error.status ?? 500).json({ error: error.status ? error.message : 'The request could not be completed.' })
  })
  return app
}

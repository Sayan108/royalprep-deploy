import { createHmac, timingSafeEqual } from 'node:crypto'
import type { RequestHandler } from 'express'

const equal = (a: string, b: string) => {
  const left = Buffer.from(a), right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function createAdminAuth(adminPassword: string, secret: string) {
  const sign = (value: string) => createHmac('sha256', secret).update(value).digest('base64url')
  const login: RequestHandler = (req, res) => {
    if (typeof req.body.password !== 'string' || !equal(req.body.password, adminPassword)) { res.status(401).json({ error: 'Invalid admin password.' }); return }
    const expires = String(Date.now() + 8 * 60 * 60_000)
    res.json({ token: expires + '.' + sign(expires) })
  }
  const requireAdmin: RequestHandler = (req, res, next) => {
    const [expires, signature] = (req.headers.authorization?.replace(/^Bearer /, '') ?? '').split('.')
    if (!expires || !signature || Number(expires) <= Date.now() || !equal(sign(expires), signature)) { res.status(401).json({ error: 'Sign in to the admin panel.' }); return }
    next()
  }
  return { login, requireAdmin }
}

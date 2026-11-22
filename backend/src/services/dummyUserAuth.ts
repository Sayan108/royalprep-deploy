import { randomBytes } from 'node:crypto'
import type { RequestHandler } from 'express'
import type { Pool } from 'pg'
import { normalizeEmail } from './email.js'

const challengeLifetime = 5 * 60_000
const sessionLifetime = 8 * 60 * 60_000
export function createDummyUserAuth(enabled: boolean, postgres: Pool) {
  const challenges = new Map<string, number>()
  const sessions = new Map<string, { email: string; expiresAt: number }>()

  const requestOtp: RequestHandler = (req, res) => {
    res.set('Cache-Control', 'no-store')
    if (!enabled) {
      res.status(503).json({ error: 'Student demo sign-in is disabled.' })
      return
    }

    const email = normalizeEmail(req.body?.email)
    if (!email) {
      res.status(422).json({ error: 'Enter a valid email address.' })
      return
    }

    const now = Date.now()
    for (const [address, expiry] of challenges) {
      if (expiry <= now) challenges.delete(address)
    }
    challenges.set(email, now + challengeLifetime)
    res.json({ message: 'Development only: any six-digit code works. No email was sent.', demoOtp: '123456', expiresInSeconds: challengeLifetime / 1000 })
  }

  const verifyOtp: RequestHandler = async (req, res) => {
    res.set('Cache-Control', 'no-store')
    if (!enabled) {
      res.status(503).json({ error: 'Student demo sign-in is disabled.' })
      return
    }

    const email = normalizeEmail(req.body?.email)
    const code = req.body?.code
    if (!email || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      res.status(422).json({ error: 'Enter a valid email address and six-digit code.' })
      return
    }

    const expires = challenges.get(email)
    if (!expires || expires <= Date.now()) {
      challenges.delete(email)
      res.status(401).json({ error: 'The code is missing or expired. Request a new code.' })
      return
    }
    challenges.delete(email)
    await postgres.query('INSERT INTO student_accounts (email) VALUES ($1) ON CONFLICT (email) DO NOTHING', [email])
    const expiresAt = Date.now() + sessionLifetime
    for (const [token, session] of sessions) if (session.expiresAt <= Date.now()) sessions.delete(token)
    const token = randomBytes(32).toString('base64url')
    sessions.set(token, { email, expiresAt })
    res.json({ token, user: { email }, expiresAt })
  }

  const requireStudent: RequestHandler = (req, res, next) => {
    if (!enabled) {
      res.status(401).json({ error: 'Student sign-in is unavailable.' })
      return
    }
    const token = req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1]
    const session = token ? sessions.get(token) : undefined
    if (!token || !session || session.expiresAt <= Date.now()) {
      if (token) sessions.delete(token)
      res.status(401).json({ error: 'Sign in to your student account.' })
      return
    }
    res.locals.student = session
    res.locals.studentToken = token
    next()
  }

  const getSession: RequestHandler = (_req, res) => {
    const { email, expiresAt } = res.locals.student as { email: string; expiresAt: number }
    res.json({ user: { email }, expiresAt })
  }

  const logout: RequestHandler = (_req, res) => {
    sessions.delete(res.locals.studentToken as string)
    res.json({ message: 'Signed out.' })
  }

  return { requestOtp, verifyOtp, requireStudent, getSession, logout }
}

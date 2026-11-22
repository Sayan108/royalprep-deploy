import { randomBytes, timingSafeEqual } from 'node:crypto';
import { normalizeEmail } from '../services/email.js';
const challengeLifetime = 5 * 60_000;
const sessionLifetime = 8 * 60 * 60_000;
const equal = (a, b) => {
    const left = Buffer.from(a), right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
};
export function createAdminAuth(adminPassword, adminEmail, enabled) {
    const email = normalizeEmail(adminEmail);
    if (adminEmail && !email)
        throw Error('ADMIN_EMAIL must be a valid email address.');
    const challenges = new Map();
    const sessions = new Map();
    const requestOtp = (req, res) => {
        if (!enabled || !email) {
            res.status(503).json({ error: 'Admin email sign-in is unavailable.' });
            return;
        }
        if (typeof req.body?.password !== 'string' || !equal(req.body.password, adminPassword)) {
            res.status(401).json({ error: 'Invalid admin password.' });
            return;
        }
        const now = Date.now();
        for (const [token, expiry] of challenges)
            if (expiry <= now)
                challenges.delete(token);
        const challenge = randomBytes(32).toString('base64url');
        challenges.set(challenge, now + challengeLifetime);
        res.json({ challenge, message: 'Development only: any six-digit code works. No email was sent.', demoOtp: '123456', expiresInSeconds: challengeLifetime / 1000 });
    };
    const login = (req, res) => {
        if (!enabled || !email) {
            res.status(503).json({ error: 'Admin email sign-in is unavailable.' });
            return;
        }
        const { challenge, code } = req.body ?? {};
        if (typeof challenge !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(challenge) || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
            res.status(422).json({ error: 'Provide a valid challenge and six-digit code.' });
            return;
        }
        const expiry = challenges.get(challenge);
        challenges.delete(challenge);
        if (!expiry || expiry <= Date.now()) {
            res.status(401).json({ error: 'The code is missing or expired. Request a new code.' });
            return;
        }
        const now = Date.now();
        for (const [token, sessionExpiry] of sessions)
            if (sessionExpiry <= now)
                sessions.delete(token);
        const token = randomBytes(32).toString('base64url');
        sessions.set(token, now + sessionLifetime);
        res.json({ token });
    };
    const requireAdmin = (req, res, next) => {
        const token = req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
        const expires = token ? sessions.get(token) : undefined;
        if (!enabled || !email || !token || !expires || expires <= Date.now()) {
            if (token)
                sessions.delete(token);
            res.status(401).json({ error: 'Sign in to the admin panel.' });
            return;
        }
        res.locals.adminToken = token;
        next();
    };
    const logout = (_req, res) => {
        sessions.delete(res.locals.adminToken);
        res.json({ message: 'Signed out.' });
    };
    return { requestOtp, login, requireAdmin, logout };
}

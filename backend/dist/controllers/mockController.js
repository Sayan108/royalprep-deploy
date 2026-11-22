import { answerSchema, setSchema } from '../models/mock.js';
import { id } from '../services/mockService.js';
export function createMockController(service, memory = false) {
    const health = (_req, res) => { res.json({ ok: true, storage: memory ? 'memory' : 'mongodb' }); };
    const listAdminSets = async (_req, res) => { res.json(await service.listSets()); };
    const createSet = async (req, res) => {
        const parsed = setSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(422).json({ error: 'Every set needs a title, duration and exactly 10 valid questions.', details: parsed.error.flatten() });
            return;
        }
        const set = { ...parsed.data, id: id(), version: 1 };
        await service.createSet(set);
        res.status(201).json(set);
    };
    const updateSet = async (req, res) => {
        const parsed = setSchema.safeParse(req.body);
        if (!parsed.success || !Number.isInteger(req.body.version)) {
            res.status(422).json({ error: 'Provide exactly 10 valid questions and the current version.' });
            return;
        }
        await service.exclusive(async () => {
            const existing = await service.readSet(String(req.params.id));
            if (!existing) {
                res.status(404).json({ error: 'Set not found.' });
                return;
            }
            if (existing.version !== req.body.version) {
                res.status(409).json({ error: 'Set changed; reload before editing.' });
                return;
            }
            const updated = { ...parsed.data, id: existing.id, version: existing.version + 1 };
            if (!await service.updateSet(updated, existing.version)) {
                res.status(409).json({ error: 'Set changed; reload before editing.' });
                return;
            }
            res.json(updated);
        });
    };
    const listPublishedSets = async (_req, res) => {
        const all = await service.listSets(true);
        res.json(all.map(s => ({ id: s.id, title: s.title, minutes: s.minutes, count: 10 })));
    };
    const startAttempt = async (req, res) => {
        const set = await service.readSet(String(req.params.id));
        if (!set?.published) {
            res.status(404).json({ error: 'This mock is unavailable.' });
            return;
        }
        const attempt = { id: id(), snapshot: structuredClone(set), answers: {}, startedAt: Date.now(), deadline: Date.now() + set.minutes * 60_000, version: 1 };
        await service.saveAttempt(attempt);
        res.status(201).json(service.publicAttempt(attempt));
    };
    const getAttempt = async (req, res) => service.exclusive(async () => {
        let attempt = await service.readAttempt(String(req.params.id));
        if (!attempt) {
            res.status(404).json({ error: 'Attempt not found.' });
            return;
        }
        if (Date.now() >= attempt.deadline)
            attempt = await service.finalize(attempt);
        res.set('Cache-Control', 'no-store').json(service.publicAttempt(attempt));
    });
    const saveAnswer = async (req, res) => service.exclusive(async () => {
        const parsed = answerSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(422).json({ error: 'Invalid answer.' });
            return;
        }
        const attempt = await service.readAttempt(String(req.params.id));
        if (!attempt) {
            res.status(404).json({ error: 'Attempt not found.' });
            return;
        }
        if (attempt.finishedAt || Date.now() >= attempt.deadline) {
            await service.finalize(attempt);
            res.status(409).json({ error: 'The attempt has ended.' });
            return;
        }
        if (attempt.version !== parsed.data.version) {
            res.status(409).json({ error: 'Your attempt changed; reload it.' });
            return;
        }
        const previous = attempt.version;
        attempt.answers[parsed.data.questionId] = parsed.data.option;
        attempt.version++;
        await service.saveAttempt(attempt, previous);
        res.json(service.publicAttempt(attempt));
    });
    const submitAttempt = async (req, res) => service.exclusive(async () => {
        const attempt = await service.readAttempt(String(req.params.id));
        if (!attempt) {
            res.status(404).json({ error: 'Attempt not found.' });
            return;
        }
        await service.finalize(attempt);
        res.json({ id: attempt.id });
    });
    const getResult = async (req, res) => service.exclusive(async () => {
        const attempt = await service.readAttempt(String(req.params.id));
        if (!attempt) {
            res.status(404).json({ error: 'Attempt not found.' });
            return;
        }
        if (!attempt.finishedAt && Date.now() < attempt.deadline) {
            res.status(409).json({ error: 'Submit the attempt to see the result.' });
            return;
        }
        await service.finalize(attempt);
        const correct = attempt.snapshot.questions.filter((q, index) => q.correct === attempt.answers[String(index)]).length;
        res.set('Cache-Control', 'no-store').json({ title: attempt.snapshot.title, correct, incorrect: Object.keys(attempt.answers).length - correct, unanswered: 10 - Object.keys(attempt.answers).length, score: correct * 10, questions: attempt.snapshot.questions, answers: attempt.answers });
    });
    return { health, listAdminSets, createSet, updateSet, listPublishedSets, startAttempt, getAttempt, saveAnswer, submitAttempt, getResult };
}

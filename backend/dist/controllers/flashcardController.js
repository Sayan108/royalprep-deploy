import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { flashcardInputSchema, flashcardReviewSchema } from '../models/flashcard.js';
export function createFlashcardController(repository) {
    const owner = (res) => res.locals.student.email;
    const list = async (_req, res) => {
        const state = await repository.read(owner(res));
        res.json({ cards: state.cards, serverTime: Date.now() });
    };
    const create = async (req, res) => {
        const parsed = flashcardInputSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(422).json({ error: 'Provide a chapter and both sides of the card.' });
            return;
        }
        const result = await repository.mutate(owner(res), (state, now) => {
            if (state.cards.length >= 500)
                return { status: 422, body: { error: 'A maximum of 500 personal cards is supported.' } };
            const card = { ...parsed.data, id: randomUUID(), version: 1, intervalDays: 0, dueAt: now };
            state.cards.push(card);
            return { status: 201, body: card };
        });
        res.status(result.status).json(result.body);
    };
    const review = async (req, res) => {
        const parsed = flashcardReviewSchema.safeParse(req.body);
        if (!parsed.success || !z.string().uuid().safeParse(req.params.id).success) {
            res.status(422).json({ error: 'Provide a valid card, rating, event ID and version.' });
            return;
        }
        const { eventId, expectedVersion, rating } = parsed.data;
        const result = await repository.mutate(owner(res), (state, now) => {
            const card = state.cards.find(item => item.id === req.params.id);
            if (!card)
                return { status: 404, body: { error: 'Flashcard not found.' } };
            const event = state.events.find(item => item.id === eventId);
            if (event) {
                if (event.cardId !== card.id || event.rating !== rating)
                    return { status: 409, body: { error: 'Review event ID was already used.' } };
                return { status: 200, body: card };
            }
            if (card.version !== expectedVersion)
                return { status: 409, body: { error: 'This card changed elsewhere. Reload before reviewing.' } };
            if (state.events.length >= 10_000)
                return { status: 422, body: { error: 'Review history limit reached; contact support.' } };
            const interval = rating === 'again' ? 0 : rating === 'hard' ? Math.max(1, Math.ceil(card.intervalDays * 1.2)) : rating === 'good' ? Math.max(3, card.intervalDays * 2) : Math.max(7, card.intervalDays * 3);
            card.intervalDays = Math.min(365, interval);
            card.dueAt = now + (interval === 0 ? 10 * 60_000 : card.intervalDays * 86_400_000);
            card.version++;
            state.events.push({ id: eventId, cardId: card.id, rating });
            return { status: 200, body: card };
        });
        res.status(result.status).json(result.body);
    };
    const remove = async (req, res) => {
        const parsed = z.object({ expectedVersion: z.number().int().positive() }).strict().safeParse(req.body);
        if (!parsed.success || !z.string().uuid().safeParse(req.params.id).success) {
            res.status(422).json({ error: 'Provide a valid card and current version.' });
            return;
        }
        const result = await repository.mutate(owner(res), state => {
            const index = state.cards.findIndex(item => item.id === req.params.id);
            if (index < 0)
                return { status: 404, body: { error: 'Flashcard not found.' } };
            if (state.cards[index].version !== parsed.data.expectedVersion)
                return { status: 409, body: { error: 'This card changed elsewhere. Reload before removing it.' } };
            state.cards.splice(index, 1);
            return { status: 200, body: { message: 'Flashcard removed.' } };
        });
        res.status(result.status).json(result.body);
    };
    return { list, create, review, remove };
}

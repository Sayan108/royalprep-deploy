import { z } from 'zod';
export const flashcardInputSchema = z.object({
    chapter: z.string().trim().min(1).max(120),
    front: z.string().trim().min(1).max(1000),
    back: z.string().trim().min(1).max(3000),
}).strict();
export const flashcardReviewSchema = z.object({
    eventId: z.string().uuid(),
    expectedVersion: z.number().int().positive(),
    rating: z.enum(['again', 'hard', 'good', 'easy']),
}).strict();

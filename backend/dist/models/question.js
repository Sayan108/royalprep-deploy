import { z } from 'zod';
export const questionContentSchema = z.object({
    stem: z.string().trim().min(5).max(3000),
    options: z.array(z.string().trim().min(1).max(1000)).length(4),
    correct: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(1).max(5000),
    source: z.string().trim().min(1).max(100).optional(),
});
export const questionInputSchema = questionContentSchema.extend({
    chapter: z.string().trim().min(1).max(120),
    published: z.boolean(),
}).refine(q => new Set(q.options).size === 4, 'Options must be distinct');

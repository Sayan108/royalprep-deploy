import mongoose from 'mongoose';
import { z } from 'zod';
export const questionSchema = z.object({
    stem: z.string().trim().min(5).max(3000),
    options: z.array(z.string().trim().min(1).max(1000)).length(4),
    correct: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(1).max(5000),
    source: z.string().trim().min(1).max(100).optional(),
}).refine(q => new Set(q.options).size === 4, 'Options must be distinct');
export const setSchema = z.object({
    title: z.string().trim().min(3).max(120),
    minutes: z.number().int().min(1).max(180),
    published: z.boolean(),
    questions: z.array(questionSchema).length(10),
});
export const answerSchema = z.object({
    questionId: z.string().regex(/^[0-9]$/),
    option: z.number().int().min(0).max(3),
    version: z.number().int().positive(),
});
export const SetModel = mongoose.model('MockSet', new mongoose.Schema({ _id: String, payload: mongoose.Schema.Types.Mixed }, { versionKey: false }));
export const AttemptModel = mongoose.model('MockAttempt', new mongoose.Schema({ _id: String, payload: mongoose.Schema.Types.Mixed }, { versionKey: false }));
export const ReportModel = mongoose.model('QuestionReport', new mongoose.Schema({ _id: String, payload: mongoose.Schema.Types.Mixed }, { versionKey: false }));

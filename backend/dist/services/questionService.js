import { randomBytes } from 'node:crypto';
import { createPostgresQuestionRepository } from '../repositories/postgresQuestionRepository.js';
export const id = () => randomBytes(24).toString('hex');
export function createQuestionService(postgres) {
    return createPostgresQuestionRepository(postgres);
}

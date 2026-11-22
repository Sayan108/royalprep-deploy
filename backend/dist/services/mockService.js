import { randomBytes } from 'node:crypto';
import { createMockRepository } from '../repositories/mockRepository.js';
export const id = () => randomBytes(24).toString('hex');
export function createMockService(memory = false) {
    const repository = createMockRepository(memory);
    // Serialize writes in this process; MongoDB CAS also guards revisions across processes.
    let writeQueue = Promise.resolve();
    const exclusive = async (fn) => {
        const previous = writeQueue;
        let release;
        writeQueue = new Promise(resolve => { release = resolve; });
        await previous;
        try {
            return await fn();
        }
        finally {
            release();
        }
    };
    const publicAttempt = (a) => ({
        id: a.id, title: a.snapshot.title, deadline: a.deadline, serverTime: Date.now(), finishedAt: a.finishedAt,
        version: a.version, answers: a.answers,
        questions: a.snapshot.questions.map((q, index) => ({ id: String(index), stem: q.stem, options: q.options })),
    });
    async function finalize(a) {
        if (!a.finishedAt) {
            const previous = a.version;
            a.finishedAt = Math.min(Date.now(), a.deadline);
            a.version++;
            await repository.saveAttempt(a, previous);
        }
        return a;
    }
    return { ...repository, exclusive, publicAttempt, finalize };
}

export function createFlashcardRepository(pool) {
    const empty = () => ({ cards: [], events: [] });
    return {
        async read(owner) {
            const result = await pool.query('SELECT state FROM student_flashcards WHERE owner_email=$1', [owner]);
            return result.rows[0]?.state ?? empty();
        },
        async mutate(owner, operation) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query('INSERT INTO student_flashcards (owner_email,state) VALUES ($1,$2::jsonb) ON CONFLICT (owner_email) DO NOTHING', [owner, JSON.stringify(empty())]);
                const result = await client.query('SELECT state FROM student_flashcards WHERE owner_email=$1 FOR UPDATE', [owner]);
                if (!result.rows[0])
                    throw Error('Flashcard state is missing.');
                const state = result.rows[0].state;
                const outcome = operation(state, Date.now());
                await client.query('UPDATE student_flashcards SET state=$1::jsonb WHERE owner_email=$2', [JSON.stringify(state), owner]);
                await client.query('COMMIT');
                return outcome;
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        },
    };
}

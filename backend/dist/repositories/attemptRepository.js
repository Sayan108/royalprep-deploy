export class AttemptNotFound extends Error {
}
export function createAttemptRepository(pool) {
    return {
        async findRequest(owner, requestId) {
            const result = await pool.query('SELECT payload FROM custom_attempts WHERE owner_email=$1 AND request_id=$2', [owner, requestId]);
            return result.rows[0]?.payload;
        },
        async insert(owner, attempt) {
            try {
                await pool.query('INSERT INTO custom_attempts (id, owner_email, request_id, fingerprint, payload) VALUES ($1,$2,$3,$4,$5::jsonb)', [attempt.id, owner, attempt.requestId, attempt.fingerprint, JSON.stringify(attempt)]);
                return true;
            }
            catch (error) {
                if (error instanceof Error && 'code' in error && error.code === '23505')
                    return false;
                throw error;
            }
        },
        async ids(owner) {
            const result = await pool.query("SELECT id FROM custom_attempts WHERE owner_email=$1 ORDER BY (payload->>'createdAt')::bigint DESC LIMIT 100", [owner]);
            return result.rows.map(row => row.id);
        },
        async mutate(owner, id, change) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                const result = await client.query('SELECT payload FROM custom_attempts WHERE owner_email=$1 AND id=$2 FOR UPDATE', [owner, id]);
                if (!result.rows[0])
                    throw new AttemptNotFound();
                const attempt = result.rows[0].payload;
                const outcome = change(attempt, Date.now());
                await client.query('UPDATE custom_attempts SET payload=$1::jsonb WHERE owner_email=$2 AND id=$3', [JSON.stringify(attempt), owner, id]);
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

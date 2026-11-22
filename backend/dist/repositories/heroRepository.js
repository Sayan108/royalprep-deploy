import { randomUUID } from 'node:crypto';
export class HeroConflict extends Error {
}
export class HeroNotFound extends Error {
}
export function createHeroRepository(pool) {
    async function state(client, lock = false) {
        const result = await client.query(`SELECT current_revision AS "currentRevision", draft_revision AS "draftRevision", published_revision AS "publishedRevision" FROM hero_state WHERE singleton = true${lock ? ' FOR UPDATE' : ''}`);
        if (!result.rows[0])
            throw Error('Hero state is missing; check PostgreSQL migrations.');
        return result.rows[0];
    }
    async function readRevision(client, revision) {
        const result = await client.query('SELECT revision, content, created_at AS "createdAt" FROM hero_revisions WHERE revision = $1', [revision]);
        return result.rows[0];
    }
    async function transact(operation) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const current = await state(client, true);
            const result = await operation(client, current);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async function audit(client, action, revision, sourceRevision = null) {
        await client.query('INSERT INTO hero_audit_events (id, action, revision, source_revision, actor) VALUES ($1, $2, $3, $4, $5)', [randomUUID(), action, revision, sourceRevision, 'shared-admin']);
    }
    function checkRevision(state, expected) {
        if (state.currentRevision !== expected)
            throw new HeroConflict('Hero changed; reload before saving or publishing.');
    }
    return {
        async publicHero() {
            const current = await state(pool);
            return current.publishedRevision === null ? undefined : readRevision(pool, current.publishedRevision);
        },
        async adminHero() {
            const current = await state(pool);
            const draft = current.draftRevision === null ? null : await readRevision(pool, current.draftRevision);
            const history = await pool.query(`SELECT r.revision, r.content, r.created_at AS "createdAt" FROM hero_revisions r
         JOIN (SELECT DISTINCT revision FROM hero_audit_events WHERE action IN ('publish', 'restore')) a ON a.revision = r.revision
         ORDER BY r.revision DESC`);
            return { ...current, draft, history: history.rows };
        },
        async saveDraft(expected, content) {
            return transact(async (client, current) => {
                checkRevision(current, expected);
                const revision = current.currentRevision + 1;
                await client.query('INSERT INTO hero_revisions (revision, content) VALUES ($1, $2::jsonb)', [revision, JSON.stringify(content)]);
                await client.query('UPDATE hero_state SET current_revision=$1, draft_revision=$1 WHERE singleton=true', [revision]);
                await audit(client, 'draft', revision);
                return revision;
            });
        },
        async publish(expected) {
            return transact(async (client, current) => {
                checkRevision(current, expected);
                if (current.draftRevision === null)
                    throw new HeroNotFound('Save a draft before publishing.');
                if (current.publishedRevision !== current.draftRevision) {
                    await client.query('UPDATE hero_state SET published_revision=$1 WHERE singleton=true', [current.draftRevision]);
                    await audit(client, 'publish', current.draftRevision);
                }
                return current.draftRevision;
            });
        },
        async restore(expected, sourceRevision) {
            return transact(async (client, current) => {
                checkRevision(current, expected);
                const published = await client.query('SELECT 1 FROM hero_audit_events WHERE revision=$1 AND action IN ($2, $3) LIMIT 1', [sourceRevision, 'publish', 'restore']);
                if (!published.rowCount)
                    throw new HeroNotFound('Published hero revision not found.');
                const previous = await readRevision(client, sourceRevision);
                if (!previous)
                    throw new HeroNotFound('Published hero revision not found.');
                const revision = current.currentRevision + 1;
                await client.query('INSERT INTO hero_revisions (revision, content) VALUES ($1, $2::jsonb)', [revision, JSON.stringify(previous.content)]);
                await client.query('UPDATE hero_state SET current_revision=$1, draft_revision=$1, published_revision=$1 WHERE singleton=true', [revision]);
                await audit(client, 'restore', revision, sourceRevision);
                return revision;
            });
        },
    };
}

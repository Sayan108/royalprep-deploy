export function createStudyPlanRepository(pool) {
    return {
        async read(owner) {
            const result = await pool.query('SELECT version, plan FROM student_study_plans WHERE owner_email=$1', [owner]);
            return result.rows[0];
        },
        async write(owner, version, plan) {
            try {
                const result = version === 0
                    ? await pool.query('INSERT INTO student_study_plans (owner_email, version, plan) VALUES ($1, 1, $2::jsonb) RETURNING version, plan', [owner, JSON.stringify(plan)])
                    : await pool.query('UPDATE student_study_plans SET version=version+1, plan=$1::jsonb, updated_at=now() WHERE owner_email=$2 AND version=$3 RETURNING version, plan', [JSON.stringify(plan), owner, version]);
                return result.rows[0];
            }
            catch (error) {
                if (version === 0 && error instanceof Error && 'code' in error && error.code === '23505')
                    return undefined;
                throw error;
            }
        },
    };
}

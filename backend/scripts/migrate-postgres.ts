import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import pg from 'pg'

if (!process.env.DATABASE_URL) throw Error('Set DATABASE_URL before applying PostgreSQL migrations.')
const migrationsUrl = new URL('../migrations/', import.meta.url)
const files = (await readdir(migrationsUrl)).filter(file => /^\d+_[a-z0-9_]+\.sql$/.test(file)).sort()
if (!files.length) throw Error('No PostgreSQL migrations were found.')
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  await client.query('BEGIN')
  await client.query('SELECT pg_advisory_xact_lock($1)', [71122701])
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL)')
  const newlyApplied: string[] = []
  for (const file of files) {
    const name = file.slice(0, -4)
    const sql = await readFile(new URL(file, migrationsUrl), 'utf8')
    const checksum = createHash('sha256').update(sql).digest('hex')
    const applied = await client.query<{ checksum: string }>('SELECT checksum FROM schema_migrations WHERE name = $1', [name])
    if (applied.rows[0]) {
      if (applied.rows[0].checksum !== checksum) throw Error(`Migration ${name} has changed since it was applied.`)
    } else {
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [name, checksum])
      newlyApplied.push(name)
    }
  }
  await client.query('COMMIT')
  console.log(newlyApplied.length ? `Applied migrations: ${newlyApplied.join(', ')}.` : 'PostgreSQL migrations are up to date.')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
  await pool.end()
}

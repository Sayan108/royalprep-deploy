import type { Pool } from 'pg'
import type { FlashcardState } from '../models/flashcard.js'

export function createFlashcardRepository(pool: Pool) {
  const empty = (): FlashcardState => ({ cards: [], events: [] })
  return {
    async read(owner: string): Promise<FlashcardState> {
      const result = await pool.query<{ state: FlashcardState }>('SELECT state FROM student_flashcards WHERE owner_email=$1', [owner])
      return result.rows[0]?.state ?? empty()
    },
    async mutate<T>(owner: string, operation: (state: FlashcardState, now: number) => T): Promise<T> {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query('INSERT INTO student_flashcards (owner_email,state) VALUES ($1,$2::jsonb) ON CONFLICT (owner_email) DO NOTHING', [owner, JSON.stringify(empty())])
        const result = await client.query<{ state: FlashcardState }>('SELECT state FROM student_flashcards WHERE owner_email=$1 FOR UPDATE', [owner])
        if (!result.rows[0]) throw Error('Flashcard state is missing.')
        const state = result.rows[0].state
        const outcome = operation(state, Date.now())
        await client.query('UPDATE student_flashcards SET state=$1::jsonb WHERE owner_email=$2', [JSON.stringify(state), owner])
        await client.query('COMMIT')
        return outcome
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally { client.release() }
    },
  }
}

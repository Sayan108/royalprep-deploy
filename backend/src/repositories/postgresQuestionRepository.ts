import type { Pool, PoolClient, QueryResultRow } from 'pg'
import type { Question, QuestionReport } from '../models/question.js'

type QuestionRow = QueryResultRow & Omit<Question, 'options'> & { options: string[]; source: string | null }
type ReportRow = QueryResultRow & Omit<QuestionReport, 'createdAt'> & { createdAt: string }

const questionColumns = 'id, version, chapter, published, stem, options, correct, explanation, source'
const reportColumns = 'id, question_id AS "questionId", question_version AS "questionVersion", question_stem AS "questionStem", message, created_at AS "createdAt"'

function toQuestion(row: QuestionRow): Question {
  const { source, ...question } = row
  return source === null ? question : { ...question, source }
}

export async function insertQuestions(client: PoolClient, questions: Question[]) {
  for (const question of questions) {
    await client.query(
      'INSERT INTO questions (id, version, chapter, published, stem, options, correct, explanation, source) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9)',
      [question.id, question.version, question.chapter, question.published, question.stem, JSON.stringify(question.options), question.correct, question.explanation, question.source ?? null],
    )
  }
}

export async function insertReport(client: PoolClient, report: QuestionReport) {
  await client.query(
    'INSERT INTO question_reports (id, question_id, question_version, question_stem, message, created_at) VALUES ($1,$2,$3,$4,$5,$6)',
    [report.id, report.questionId, report.questionVersion, report.questionStem, report.message, report.createdAt],
  )
}

export function createPostgresQuestionRepository(pool: Pool) {
  return {
    async listQuestions(publishedOnly = false): Promise<Question[]> {
      const result = await pool.query<QuestionRow>(`SELECT ${questionColumns} FROM questions${publishedOnly ? ' WHERE published = true' : ''} ORDER BY sequence`)
      return result.rows.map(toQuestion)
    },
    async readQuestion(id: string): Promise<Question | undefined> {
      const result = await pool.query<QuestionRow>(`SELECT ${questionColumns} FROM questions WHERE id = $1`, [id])
      return result.rows[0] ? toQuestion(result.rows[0]) : undefined
    },
    async createQuestions(items: Question[]) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await insertQuestions(client, items)
        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
    async updateQuestion(question: Question, previous: number): Promise<boolean> {
      const result = await pool.query(
        'UPDATE questions SET version=$1, chapter=$2, published=$3, stem=$4, options=$5::jsonb, correct=$6, explanation=$7, source=$8 WHERE id=$9 AND version=$10',
        [question.version, question.chapter, question.published, question.stem, JSON.stringify(question.options), question.correct, question.explanation, question.source ?? null, question.id, previous],
      )
      return result.rowCount === 1
    },
    async createReport(report: QuestionReport) {
      const client = await pool.connect()
      try { await insertReport(client, report) } finally { client.release() }
    },
    async listReports(): Promise<QuestionReport[]> {
      const result = await pool.query<ReportRow>(`SELECT ${reportColumns} FROM question_reports ORDER BY created_at`)
      return result.rows.map(row => ({ ...row, createdAt: Number(row.createdAt) }))
    },
  }
}

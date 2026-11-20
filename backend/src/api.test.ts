import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from './app.js'
import { migrateLegacyReports, migrateLegacySets } from './services/legacyMigration.js'

const question = { chapter: 'Anatomy', published: true, stem: 'Pick the right answer', options: ['A', 'B', 'C', 'D'], correct: 1, explanation: 'B is correct.', source: 'Original' }

test('standalone questions support editing, practice, reports and version conflicts', async () => {
  const api = request(createApp({ memory: true, adminPassword: 'test-password-long', secret: 'secret'.repeat(10) }))
  assert.equal((await api.post('/api/admin/questions').send(question)).status, 401)
  const login = await api.post('/api/admin/login').send({ password: 'test-password-long' })
  const auth = { Authorization: 'Bearer ' + login.body.token }
  const created = await api.post('/api/admin/questions').set(auth).send(question)
  assert.equal(created.status, 201)
  await api.post('/api/admin/questions').set(auth).send({ ...question, stem: 'A draft question', published: false })
  const list = await api.get('/api/practice/questions')
  assert.equal(list.body.length, 1)
  assert.equal(list.body[0].id, created.body.id)
  assert.equal(list.body[0].correct, undefined)
  assert.equal(list.body[0].explanation, undefined)
  const path = '/api/practice/questions/' + created.body.id
  assert.equal((await api.post(path + '/answer').send({ version: 2, option: 1 })).status, 409)
  assert.deepEqual((await api.post(path + '/answer').send({ version: 1, option: 0 })).body, { correct: 1, explanation: 'B is correct.', isCorrect: false })
  assert.equal((await api.post(path + '/reports').send({ version: 1, message: 'Please review' })).status, 201)
  assert.equal((await api.get('/api/admin/question-reports')).status, 401)
  const reports = await api.get('/api/admin/question-reports').set(auth)
  assert.equal(reports.body[0].questionId, created.body.id)
  assert.equal(reports.body[0].questionVersion, 1)
  assert.equal(reports.body[0].questionStem, question.stem)
  const updated = await api.put('/api/admin/questions/' + created.body.id).set(auth).send({ ...created.body, stem: 'Updated question', published: false })
  assert.equal(updated.status, 200)
  assert.equal(updated.body.version, 2)
  assert.equal((await api.put('/api/admin/questions/' + created.body.id).set(auth).send(created.body)).status, 409)
  assert.equal((await api.post(path + '/answer').send({ version: 2, option: 1 })).status, 404)
  assert.equal((await api.get('/api/practice/questions')).body.length, 0)
  assert.equal((await api.get('/api/sets')).status, 404)
  assert.equal((await api.get('/api/admin/sets').set(auth)).status, 404)
})

test('CSV import accepts individual questions and rejects invalid rows before writing', async () => {
  const api = request(createApp({ memory: true, adminPassword: 'test-password-long', secret: 'secret'.repeat(10) }))
  const login = await api.post('/api/admin/login').send({ password: 'test-password-long' })
  const auth = { Authorization: 'Bearer ' + login.body.token }
  const header = 'chapter,published,stem,option_a,option_b,option_c,option_d,correct,explanation,source'
  const row = 'Anatomy,true,"A question, with a comma",A,B,C,D,B,Explanation,Book'
  const invalid = 'Anatomy,true,Invalid question,A,A,C,D,B,Explanation,Book'
  assert.equal((await api.post('/api/admin/questions/import').send({ csv: [header, row].join('\n') })).status, 401)
  assert.equal((await api.post('/api/admin/questions/import').set(auth).send({ csv: [header, row, invalid].join('\n') })).status, 422)
  assert.equal((await api.get('/api/admin/questions').set(auth)).body.length, 0)
  const imported = await api.post('/api/admin/questions/import').set(auth).send({ csv: [header, row].join('\n') })
  assert.equal(imported.status, 201)
  assert.equal(imported.body.count, 1)
  const all = await api.get('/api/admin/questions').set(auth)
  assert.equal(all.body[0].stem, 'A question, with a comma')
  assert.equal(all.body[0].correct, 1)
  assert.equal(all.body[0].source, 'Book')
})

test('legacy questions and reports retain stable identity and report context', () => {
  const [migrated] = migrateLegacySets([{ id: 'legacy-id', title: 'MRCS Mock 1: Applied Anatomy', version: 3, published: true, questions: [question] }])
  assert.equal(migrated.id, 'legacy-id-0')
  assert.equal(migrated.chapter, 'Applied Anatomy')
  assert.equal(migrated.version, 3)
  assert.equal(migrated.correct, question.correct)
  const [report] = migrateLegacyReports([{ id: 'report-id', setId: 'legacy-id', questionIndex: 0, setVersion: 2, questionStem: 'Original stem', message: 'Review', createdAt: 123 }], new Set([migrated.id]))
  assert.equal(report.questionId, migrated.id)
  assert.equal(report.questionVersion, 2)
  assert.equal(report.questionStem, 'Original stem')
  assert.throws(() => migrateLegacyReports([{ id: 'report-id', setId: 'missing', questionIndex: 0, setVersion: 1, questionStem: 'Original', message: 'Review', createdAt: 123 }], new Set()))
})

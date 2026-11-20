import 'dotenv/config'
import mongoose from 'mongoose'
import { QuestionModel, ReportModel } from '../src/models/question.js'
import { migrateLegacyReports, migrateLegacySets } from '../src/services/legacyMigration.js'

if (!process.env.MONGODB_URI || process.env.STORAGE === 'memory') throw Error('Configure MongoDB before migrating questions.')
await mongoose.connect(process.env.MONGODB_URI)
try {
  const db = mongoose.connection.db
  if (!db) throw Error('MongoDB connection is unavailable.')
  const sets = await db.collection('mocksets').find().toArray()
  const reports = await db.collection('questionreports').find().toArray()
  const questions = migrateLegacySets(sets.map(row => row.payload))
  const migratedReports = migrateLegacyReports(reports.map(row => row.payload), new Set(questions.map(q => q.id)))
  if (new Set(questions.map(q => q.id)).size !== questions.length) throw Error('Legacy question IDs are not unique.')
  if (questions.length) await QuestionModel.bulkWrite(questions.map(q => ({
    updateOne: { filter: { _id: q.id }, update: { $setOnInsert: { payload: q } }, upsert: true },
  })))
  if (migratedReports.length) await ReportModel.bulkWrite(migratedReports.map(report => ({
    updateOne: { filter: { _id: report.id }, update: { $setOnInsert: { payload: report } }, upsert: true },
  })))
  const questionCount = await QuestionModel.countDocuments({ _id: { $in: questions.map(q => q.id) } })
  const reportCount = await ReportModel.countDocuments({ _id: { $in: migratedReports.map(r => r.id) } })
  if (questionCount !== questions.length || reportCount !== migratedReports.length) throw Error('Migration verification failed.')
  console.log(`Verified ${questionCount} migrated questions and ${reportCount} migrated reports. Legacy records were retained.`)
} finally {
  await mongoose.disconnect()
}

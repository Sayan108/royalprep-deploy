import { QuestionModel, ReportModel } from '../models/question.js'
import type { Question, QuestionReport } from '../models/question.js'

export function createQuestionRepository(memory = false) {
  const questions = new Map<string, Question>()
  const reports = new Map<string, QuestionReport>()
  return {
    async listQuestions(publishedOnly = false): Promise<Question[]> {
      const all = memory ? [...questions.values()] : (await QuestionModel.find(publishedOnly ? { 'payload.published': true } : {}).lean()).map(row => row.payload as Question)
      return publishedOnly ? all.filter(q => q.published) : all
    },
    async readQuestion(id: string): Promise<Question | undefined> {
      return memory ? questions.get(id) : (await QuestionModel.findById(id).lean())?.payload as Question | undefined
    },
    async createQuestions(items: Question[]) {
      if (memory) { for (const item of items) questions.set(item.id, item); return }
      await QuestionModel.insertMany(items.map(item => ({ _id: item.id, payload: item })))
    },
    async updateQuestion(question: Question, previous: number): Promise<boolean> {
      if (memory) {
        if (questions.get(question.id)?.version !== previous) return false
        questions.set(question.id, question); return true
      }
      const result = await QuestionModel.updateOne({ _id: question.id, 'payload.version': previous }, { $set: { payload: question } })
      return result.modifiedCount > 0
    },
    async createReport(report: QuestionReport) {
      if (memory) reports.set(report.id, report)
      else await ReportModel.create({ _id: report.id, payload: report })
    },
    async listReports(): Promise<QuestionReport[]> {
      return memory ? [...reports.values()] : (await ReportModel.find().lean()).map(row => row.payload as QuestionReport)
    },
  }
}

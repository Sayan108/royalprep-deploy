import { QuestionModel, ReportModel } from '../models/question.js';
export function createQuestionRepository(memory = false) {
    const questions = new Map();
    const reports = new Map();
    return {
        async listQuestions(publishedOnly = false) {
            const all = memory ? [...questions.values()] : (await QuestionModel.find(publishedOnly ? { 'payload.published': true } : {}).lean()).map(row => row.payload);
            return publishedOnly ? all.filter(q => q.published) : all;
        },
        async readQuestion(id) {
            return memory ? questions.get(id) : (await QuestionModel.findById(id).lean())?.payload;
        },
        async createQuestions(items) {
            if (memory) {
                for (const item of items)
                    questions.set(item.id, item);
                return;
            }
            await QuestionModel.insertMany(items.map(item => ({ _id: item.id, payload: item })));
        },
        async updateQuestion(question, previous) {
            if (memory) {
                if (questions.get(question.id)?.version !== previous)
                    return false;
                questions.set(question.id, question);
                return true;
            }
            const result = await QuestionModel.updateOne({ _id: question.id, 'payload.version': previous }, { $set: { payload: question } });
            return result.modifiedCount > 0;
        },
        async createReport(report) {
            if (memory)
                reports.set(report.id, report);
            else
                await ReportModel.create({ _id: report.id, payload: report });
        },
        async listReports() {
            return memory ? [...reports.values()] : (await ReportModel.find().lean()).map(row => row.payload);
        },
    };
}

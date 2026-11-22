import { AttemptModel, ReportModel, SetModel } from '../models/mock.js';
export function createMockRepository(memory = false) {
    const sets = new Map();
    const attempts = new Map();
    const reports = new Map();
    return {
        async readSet(key) {
            return memory ? sets.get(key) : (await SetModel.findById(key).lean())?.payload;
        },
        async listSets(publishedOnly = false) {
            const all = memory ? [...sets.values()] : (await SetModel.find(publishedOnly ? { 'payload.published': true } : {}).lean()).map(row => row.payload);
            return publishedOnly ? all.filter(set => set.published) : all;
        },
        async createSet(set) {
            if (memory)
                sets.set(set.id, set);
            else
                await SetModel.create({ _id: set.id, payload: set });
        },
        async updateSet(set, previous) {
            if (memory) {
                sets.set(set.id, set);
                return true;
            }
            const result = await SetModel.updateOne({ _id: set.id, 'payload.version': previous }, { $set: { payload: set } });
            return result.modifiedCount > 0;
        },
        async readAttempt(key) {
            return memory ? attempts.get(key) : (await AttemptModel.findById(key).lean())?.payload;
        },
        async saveAttempt(attempt, previous) {
            if (memory) {
                attempts.set(attempt.id, attempt);
                return;
            }
            if (previous === undefined) {
                await AttemptModel.create({ _id: attempt.id, payload: attempt });
                return;
            }
            const saved = await AttemptModel.updateOne({ _id: attempt.id, 'payload.version': previous }, { $set: { payload: attempt } });
            if (!saved.modifiedCount)
                throw Object.assign(Error('Attempt changed; reload and retry.'), { status: 409 });
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

import { CsvError, parse } from 'csv-parse/sync';
import { questionInputSchema } from '../models/question.js';
const required = ['chapter', 'published', 'stem', 'option_a', 'option_b', 'option_c', 'option_d', 'correct', 'explanation'];
export function parseQuestionCsv(csv) {
    let rows;
    try {
        rows = parse(csv, { bom: true, skip_empty_lines: true, trim: true });
    }
    catch (error) {
        if (error instanceof CsvError)
            throw Object.assign(Error(`Invalid CSV: ${error.message}`), { status: 422 });
        throw error;
    }
    const [header, ...data] = rows;
    if (!header || new Set(header).size !== header.length || required.some(name => !header.includes(name)) || header.some(name => ![...required, 'source'].includes(name))) {
        throw Object.assign(Error('CSV must have the documented columns, with no duplicates or extra columns.'), { status: 422 });
    }
    if (data.length < 1 || data.length > 1000)
        throw Object.assign(Error('CSV must contain between 1 and 1000 question rows.'), { status: 422 });
    return data.map((row, index) => {
        const record = Object.fromEntries(header.map((name, i) => [name, row[i]]));
        if (!['true', 'false'].includes(record.published) || !['A', 'B', 'C', 'D'].includes(record.correct)) {
            throw Object.assign(Error(`Row ${index + 2}: use true or false for published and A-D for correct.`), { status: 422 });
        }
        const parsed = questionInputSchema.safeParse({
            chapter: record.chapter, published: record.published === 'true', stem: record.stem,
            options: [record.option_a, record.option_b, record.option_c, record.option_d],
            correct: record.correct.charCodeAt(0) - 65, explanation: record.explanation,
            ...(record.source ? { source: record.source } : {}),
        });
        if (!parsed.success)
            throw Object.assign(Error(`Row ${index + 2} contains invalid question details.`), { status: 422 });
        return parsed.data;
    });
}

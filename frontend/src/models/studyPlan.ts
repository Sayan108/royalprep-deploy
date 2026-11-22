export type StudyTask = { id: string; chapter: string; title: string; dueDate: string; done: boolean }
export type StudyPlan = { targetDate: string; daysPerWeek: number; hoursPerWeek: number; tasks: StudyTask[] }
export type StoredStudyPlan = { version: number; plan: StudyPlan | null }

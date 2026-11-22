import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScreenLayout } from '../components/ScreenLayout'
import { ErrorMessage } from '../components/ErrorMessage'
import type { StoredStudyPlan, StudyPlan, StudyTask } from '../models/studyPlan'
import { api } from '../services/api'
import './study-planner.css'

type Chapter = { name: string; questionCount: number }
const today = () => new Date().toISOString().slice(0, 10)

export function StudyPlanner() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [savedPlan, setSavedPlan] = useState<StudyPlan | null>(null)
  const [version, setVersion] = useState(0)
  const [targetDate, setTargetDate] = useState('')
  const [daysPerWeek, setDaysPerWeek] = useState(4)
  const [hoursPerWeek, setHoursPerWeek] = useState(8)
  const [signedIn, setSignedIn] = useState(Boolean(sessionStorage.getItem('rp-student')))
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const dirty = JSON.stringify(plan) !== JSON.stringify(savedPlan)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const catalog = await api<Chapter[]>('/public/chapters')
      setChapters(catalog)
      if (sessionStorage.getItem('rp-student')) {
        const stored = await api<StoredStudyPlan>('/student/study-plan', {}, false, true)
        setVersion(stored.version); setPlan(stored.plan); setSavedPlan(stored.plan)
        if (stored.plan) {
          setTargetDate(stored.plan.targetDate); setDaysPerWeek(stored.plan.daysPerWeek); setHoursPerWeek(stored.plan.hoursPerWeek)
        }
      }
    } catch (e) {
      setError((e as Error).message)
      setSignedIn(Boolean(sessionStorage.getItem('rp-student')))
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function generate(event: React.FormEvent) {
    event.preventDefault(); setError(''); setMessage('')
    const start = Date.parse(`${today()}T00:00:00Z`)
    const end = Date.parse(`${targetDate}T00:00:00Z`)
    if (!Number.isFinite(end) || new Date(end).toISOString().slice(0, 10) !== targetDate || end < start || end - start > 730 * 86_400_000 ||
      !Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7 || hoursPerWeek < 1 || hoursPerWeek > 168) {
      setError('Choose a valid date within two years, 1–7 study days and 1–168 hours per week.'); return
    }
    if (!chapters.length || chapters.length > 500) { setError('A plan needs 1–500 published chapters with practice questions.'); return }
    if (plan && !window.confirm('Replace the current plan with a new proposal?')) return
    const durationDays = Math.round((end - start) / 86_400_000)
    const tasks = chapters.map((chapter, index) => ({
      id: crypto.randomUUID(), chapter: chapter.name, title: `Review ${chapter.name}`,
      dueDate: new Date(start + Math.floor((index + 1) * durationDays / chapters.length) * 86_400_000).toISOString().slice(0, 10),
      done: false,
    }))
    setPlan({ targetDate, daysPerWeek, hoursPerWeek, tasks })
    setMessage('Proposal created. Review and edit the tasks before saving.')
  }
  function updateTask(id: string, changes: Partial<StudyTask>) {
    setPlan(current => current && { ...current, tasks: current.tasks.map(task => task.id === id ? { ...task, ...changes } : task) })
    setMessage('')
  }
  async function save() {
    if (!plan) return
    setBusy(true); setError(''); setMessage('')
    try {
      const saved = await api<StoredStudyPlan>('/student/study-plan', { method: 'PUT', body: JSON.stringify({ expectedVersion: version, plan }) }, false, true)
      setVersion(saved.version); setPlan(saved.plan); setSavedPlan(saved.plan); setMessage('Study plan saved.')
    } catch (e) { setError((e as Error).message); setSignedIn(Boolean(sessionStorage.getItem('rp-student'))) }
    finally { setBusy(false) }
  }
  async function reload() {
    if (dirty && !window.confirm('Discard unsaved changes and reload?')) return
    setMessage('')
    await load()
  }

  return <ScreenLayout>
    <div className="planner-heading"><p className="screen-kicker">FREE STUDY TOOL</p><h1>Study planner</h1><p>Create a schedule from the published question catalog, then edit it to fit your study routine.</p></div>
    <ErrorMessage text={error}/>{message && <p className="screen-message" role="status">{message}</p>}
    {loading ? <p role="status">Loading your planner...</p> : <>
      <form className="screen-card planner-settings" onSubmit={generate}>
        <h2>Plan your preparation</h2>
        <div className="planner-fields">
          <label>Target exam date<input type="date" required min={today()} value={targetDate} onChange={event => setTargetDate(event.target.value)}/></label>
          <label>Study days per week<input type="number" required min="1" max="7" step="1" value={daysPerWeek} onChange={event => setDaysPerWeek(Number(event.target.value))}/></label>
          <label>Hours per week<input type="number" required min="1" max="168" step="0.5" value={hoursPerWeek} onChange={event => setHoursPerWeek(Number(event.target.value))}/></label>
        </div>
        <p>One task per chapter is spaced evenly until your target date. Dates are suggestions, not a weighted syllabus or chosen weekdays.</p>
        <button className="screen-button" disabled={busy || !chapters.length}>Create proposal</button>
        {!chapters.length && <p>No published practice chapters are available yet.</p>}
      </form>
      {plan && <section className="screen-card planner-tasks">
        <div className="planner-section-heading"><div><h2>Your study tasks</h2><p>{plan.tasks.filter(task => task.done).length} of {plan.tasks.length} complete · {plan.daysPerWeek} days and {plan.hoursPerWeek} hours per week · Target {plan.targetDate}</p></div>
          <div className="planner-actions">{signedIn ? <><button className="screen-button" type="button" disabled={busy || !dirty} onClick={save}>Save plan</button><button className="outline-button" type="button" disabled={busy} onClick={reload}>Reload saved</button></> : <Link className="screen-button" to="/sign-in" state={{ from: '/tools/planner' }}>Sign in to save</Link>}</div>
        </div>
        {!signedIn && <p>Sign in before creating your plan if you want to save it; this unsaved proposal will be lost when you leave.</p>}
        {dirty && <p role="status">You have unsaved changes.</p>}
        <ul>{plan.tasks.map(task => <li key={task.id}>
          <label className="check"><input type="checkbox" disabled={busy} checked={task.done} onChange={event => updateTask(task.id, { done: event.target.checked })}/><span>Complete</span></label>
          <label>Task<input maxLength={200} required disabled={busy} value={task.title} onChange={event => updateTask(task.id, { title: event.target.value })}/><small>{task.chapter}</small></label>
          <label>Due date<input type="date" required disabled={busy} value={task.dueDate} onChange={event => updateTask(task.id, { dueDate: event.target.value })}/></label>
        </li>)}</ul>
      </section>}
    </>}
  </ScreenLayout>
}

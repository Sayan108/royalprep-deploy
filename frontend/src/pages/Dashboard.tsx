import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorMessage } from '../components/ErrorMessage'
import { ScreenLayout } from '../components/ScreenLayout'
import type { StoredStudyPlan } from '../models/studyPlan'
import { api } from '../services/api'
import './study-planner.css'

export function Dashboard() {
  const [stored, setStored] = useState<StoredStudyPlan>()
  const [error, setError] = useState('')
  const [dueCards, setDueCards] = useState<number>()
  const [cardError, setCardError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    api<StoredStudyPlan>('/student/study-plan', { signal: controller.signal }, false, true)
      .then(setStored).catch(e => { if (!controller.signal.aborted) setError((e as Error).message) })
    api<{ cards: { dueAt: number }[]; serverTime: number }>('/student/flashcards', { signal: controller.signal }, false, true)
      .then(result => setDueCards(result.cards.filter(card => card.dueAt <= result.serverTime).length))
      .catch(e => { if (!controller.signal.aborted) setCardError((e as Error).message) })
    return () => controller.abort()
  }, [])
  const next = stored?.plan?.tasks.filter(task => !task.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 3) ?? []
  return <ScreenLayout><p className="screen-kicker">YOUR STUDY WORKSPACE</p><h1>Dashboard</h1><p>Pick up your preparation and review your plan.</p>
    <div className="dashboard-grid">
      <section className="screen-card"><h2>Practice questions</h2><p>Review published questions and explanations.</p><Link className="outline-button" to="/study/library">Browse chapters</Link></section>
      <section className="screen-card"><h2>Study plan</h2><ErrorMessage text={error}/>{!stored && !error ? <p role="status">Loading study plan...</p> : stored?.plan ? <><p>{stored.plan.tasks.filter(task => task.done).length} of {stored.plan.tasks.length} tasks completed. Target: {stored.plan.targetDate}.</p>{next.length > 0 && <ul>{next.map(task => <li key={task.id}>{task.title} — {task.dueDate}</li>)}</ul>}</> : !error && <p>No study plan saved yet.</p>}<Link className="outline-button" to="/tools/planner">Open planner</Link></section>
      <section className="screen-card"><h2>Mocks and results</h2><p>Start a custom timed mock or review a submitted result.</p><Link className="outline-button" to="/app/mocks">Open mocks</Link></section>
      <section className="screen-card"><h2>Flashcards</h2><ErrorMessage text={cardError}/>{dueCards !== undefined ? <p>{dueCards} personal {dueCards === 1 ? 'card' : 'cards'} due for review.</p> : !cardError && <p role="status">Loading cards...</p>}<Link className="outline-button" to="/app/flashcards">Review flashcards</Link></section>
    </div>
  </ScreenLayout>
}

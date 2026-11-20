import { useCallback, useEffect, useState } from 'react'
import { ScreenLayout } from '../components/ScreenLayout'
import { ErrorMessage } from '../components/ErrorMessage'
import type { PracticeFeedback, PracticeQuestion } from '../models/question'
import { api } from '../services/api'

export function Practice() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number>()
  const [feedback, setFeedback] = useState<PracticeFeedback>()
  const [explain, setExplain] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [report, setReport] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setQuestions(await api<PracticeQuestion[]>('/practice/questions')); setIndex(0); setSelected(undefined); setFeedback(undefined) }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const question = questions[index]
  async function submit() {
    if (!question || selected === undefined) return
    setBusy(true); setError('')
    try { setFeedback(await api<PracticeFeedback>(`/practice/questions/${encodeURIComponent(question.id)}/answer`, { method: 'POST', body: JSON.stringify({ version: question.version, option: selected }) })) }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  async function sendReport(event: React.FormEvent) {
    event.preventDefault()
    if (!question) return
    setBusy(true); setError(''); setMessage('')
    try {
      await api(`/practice/questions/${encodeURIComponent(question.id)}/reports`, { method: 'POST', body: JSON.stringify({ version: question.version, message: report }) })
      setReport(''); setReporting(false); setMessage('Report sent. Thank you.')
    } catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  function next() {
    setIndex(value => (value + 1) % questions.length); setSelected(undefined); setFeedback(undefined)
    setExplain(false); setReporting(false); setReport(''); setMessage(''); setError('')
  }
  return <ScreenLayout>
    <div className="practice-heading"><div><p className="screen-kicker">QUESTION PRACTICE</p><h1>Practice</h1></div>{question && <span className="counter">QUESTION {index + 1} OF {questions.length}</span>}</div>
    <div className="progress-track"><div style={{ width: questions.length ? `${(index + 1) / questions.length * 100}%` : '0%' }} /></div>
    <ErrorMessage text={error}/>{error && <button className="outline-button" onClick={load} disabled={loading || busy}>Reload questions</button>}{message && <p role="status" className="screen-message">{message}</p>}
    {loading ? <p>Loading questions...</p> : !question ? <div className="screen-card"><p>No published questions are available yet.</p><button className="screen-button" onClick={load}>Try again</button></div> : <>
      <section className="screen-card question-card">
        <div className="question-meta"><span className="topic-badge">{question.chapter}</span><span>Single best answer</span></div>
        <p className="question-stem">{question.stem}</p>
        <fieldset disabled={busy || Boolean(feedback)}><legend className="sr-only">Choose one answer</legend>
          {question.options.map((option, i) => <label className={'practice-option' + (selected === i ? ' chosen' : '') + (feedback?.correct === i ? ' correct' : '')} key={i}>
            <input type="radio" name="practice-answer" checked={selected === i} onChange={() => setSelected(i)} />
            <span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span>
          </label>)}
        </fieldset>
        <button className="screen-button" disabled={selected === undefined || busy || Boolean(feedback)} onClick={submit}>Submit answer</button>
        {feedback && <p role="status" className={feedback.isCorrect ? 'answer-correct' : 'answer-incorrect'}>{feedback.isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${String.fromCharCode(65 + feedback.correct)}.`}</p>}
        {feedback && explain && <div className="explanation"><strong>Explanation</strong><p>{feedback.explanation}</p></div>}
      </section>
      <div className="practice-actions">
        <button className="outline-button" disabled={!feedback} onClick={() => setExplain(value => !value)}>{explain ? 'Hide explanation' : 'Explain this'}</button>
        <button className="outline-button" onClick={() => { setReporting(value => !value); setMessage('') }}>Report an error</button>
        <button className="screen-button" onClick={next} disabled={busy}>Next question →</button>
      </div>
      {reporting && <form className="screen-card report-form" onSubmit={sendReport}><label>What should we review?<textarea value={report} onChange={e => setReport(e.target.value)} required maxLength={500} /></label><button className="screen-button" disabled={busy}>Send report</button></form>}
    </>}
  </ScreenLayout>
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorMessage } from '../components/ErrorMessage'
import { ScreenLayout } from '../components/ScreenLayout'
import { api } from '../services/api'
import './library.css'

type Chapter = { name: string; questionCount: number }

export function ChapterLibrary({ publicCatalog = false }: { publicCatalog?: boolean }) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setChapters(await api<Chapter[]>('/public/chapters')) }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const filtered = useMemo(() => chapters.filter(chapter => chapter.name.toLowerCase().includes(query.trim().toLowerCase())), [chapters, query])

  return <ScreenLayout>
    <div className="library-heading"><p className="screen-kicker">{publicCatalog ? 'COURSE CATALOG' : 'STUDY WORKSPACE'}</p><h1>{publicCatalog ? 'Course chapters' : 'Chapter library'}</h1><p>Browse chapters with published practice questions. Chapter notes are coming soon.</p></div>
    <label className="library-search">Search chapters<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by chapter" /></label>
    <ErrorMessage text={error}/>
    {error && <button className="outline-button" type="button" onClick={load} disabled={loading}>Try again</button>}
    {loading ? <p role="status">Loading chapters...</p> : !error && (filtered.length ? <ul className="library-list">
      {filtered.map(chapter => <li key={chapter.name}><Link to={publicCatalog ? '/course/' + encodeURIComponent(chapter.name) : '/practice?chapter=' + encodeURIComponent(chapter.name)}>
        <span><strong>{chapter.name}</strong><small>Single-best-answer practice</small></span><span>{chapter.questionCount} {chapter.questionCount === 1 ? 'question' : 'questions'}</span><span aria-hidden="true">→</span>
      </Link></li>)}
    </ul> : <p>{chapters.length ? 'No chapters match your search.' : 'No published chapters are available yet.'}</p>)}
  </ScreenLayout>
}

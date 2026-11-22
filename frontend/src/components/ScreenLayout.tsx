import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import brandMark from '../assets/royalprep-mark.svg'

export function ScreenLayout({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const studentUrl = import.meta.env.VITE_STUDENT_URL as string | undefined
  const adminUrl = import.meta.env.VITE_ADMIN_URL as string | undefined
  const studentLink = import.meta.env.MODE === 'admin'
    ? studentUrl && <a className="header-link" href={studentUrl}>Student view</a>
    : <Link className="header-link" to="/practice">Student view</Link>
  const adminLink = import.meta.env.MODE === 'student'
    ? adminUrl && <a className="header-link" href={adminUrl}>Admin</a>
    : <Link className="header-link" to="/admin">Admin</Link>
  return <div className={'screen-layout' + (admin ? ' screen-admin' : '')}>
    <header className="screen-header">
      <Link to={admin ? '/admin' : '/'} className="screen-brand"><img className="brand-mark" src={brandMark} alt=""/><span>Royal<span>Prep</span></span></Link>
      <div className="screen-header-actions">{admin ? <><span className="header-badge">ADMIN</span>{studentLink}</> : <><span className="header-badge">MRCS PART A</span><Link className="header-link" to="/sign-in">Student sign-in</Link>{adminLink}</>}</div>
    </header>
    <div className="screen-body">
      <aside className="screen-sidebar">
        <p className="sidebar-label">{admin ? 'ADMIN' : 'PRACTICE'}</p>
        {admin ? <><NavLink to="/admin/dashboard">Dashboard</NavLink><NavLink to="/admin/questions">Question bank</NavLink><NavLink to="/admin/content/hero">Homepage hero</NavLink><NavLink to="/admin/communications">Reports</NavLink>{studentLink}</> : <><NavLink to="/app" end>Dashboard</NavLink><NavLink to="/course">Course chapters</NavLink><NavLink to="/study/library">Chapter library</NavLink><NavLink to="/practice">Practice</NavLink><NavLink to="/app/mocks">Mocks</NavLink><NavLink to="/app/results">Results</NavLink><NavLink to="/app/mistakes">My mistakes</NavLink><NavLink to="/app/flashcards">Flashcards</NavLink><NavLink to="/tools">Study tools</NavLink><NavLink to="/sign-in">Student sign-in</NavLink>{adminLink}</>}
      </aside>
      <main className="screen-content">{children}</main>
    </div>
  </div>
}

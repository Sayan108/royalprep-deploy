import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import brandMark from '../assets/royalprep-mark.svg'

export function ScreenLayout({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  return <div className={'screen-layout' + (admin ? ' screen-admin' : '')}>
    <header className="screen-header">
      <Link to="/" className="screen-brand"><img className="brand-mark" src={brandMark} alt=""/><span>Royal<span>Prep</span></span></Link>
      <div className="screen-header-actions">{admin ? <><span className="header-badge">ADMIN</span><Link className="header-link" to="/practice">Student view</Link></> : <><span className="header-badge">MRCS PART A</span><Link className="header-link" to="/admin">Admin</Link></>}</div>
    </header>
    <div className="screen-body">
      <aside className="screen-sidebar">
        <p className="sidebar-label">{admin ? 'ADMIN' : 'PRACTICE'}</p>
        {admin ? <><NavLink to="/admin/questions">Question bank</NavLink><NavLink to="/practice">Student view</NavLink></> : <><NavLink to="/practice">Practice</NavLink><NavLink to="/admin">Admin</NavLink></>}
      </aside>
      <main className="screen-content">{children}</main>
    </div>
  </div>
}

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ScreenLayout } from '../components/ScreenLayout'
import { ErrorMessage } from '../components/ErrorMessage'
import { api } from '../services/api'

export function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  if (sessionStorage.getItem('rp-admin')) return <Navigate to="/admin/questions" replace/>
  async function login(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const response = await api<{ token: string }>('/admin/login', { method: 'POST', body: JSON.stringify({ password }) })
      sessionStorage.setItem('rp-admin', response.token)
      navigate('/admin/questions', { replace: true })
    } catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  return <ScreenLayout admin><section className="screen-card narrow"><h1>Admin sign-in</h1><form onSubmit={login}><label>Admin password<input type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"/></label><ErrorMessage text={error}/><button className="screen-button" disabled={busy}>Sign in</button></form></section></ScreenLayout>
}

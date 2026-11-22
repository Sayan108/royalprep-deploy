import { Route } from 'react-router-dom'
import { RequireSession } from './components/RequireSession'
import { AdminLogin } from './pages/AdminLogin'
import { QuestionBank } from './pages/QuestionBank'
import { HeroEditor } from './pages/HeroEditor'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminReports } from './pages/AdminReports'

export const adminRoutes = <>
  <Route path="/admin" element={<AdminLogin/>}/>
  <Route path="/admin/dashboard" element={<RequireSession admin><AdminDashboard/></RequireSession>}/>
  <Route path="/admin/communications" element={<RequireSession admin><AdminReports/></RequireSession>}/>
  <Route path="/admin/questions" element={<RequireSession admin><QuestionBank/></RequireSession>}/>
  <Route path="/admin/content/hero" element={<RequireSession admin><HeroEditor/></RequireSession>}/>
</>

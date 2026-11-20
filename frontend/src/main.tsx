import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLogin } from './pages/AdminLogin'
import { Practice } from './pages/Practice'
import { QuestionBank } from './pages/QuestionBank'
import './style.css'
import './screens.css'

createRoot(document.getElementById('root')!).render(<BrowserRouter><Routes>
  <Route path="/practice" element={<Practice/>}/>
  <Route path="/admin" element={<AdminLogin/>}/>
  <Route path="/admin/questions" element={<QuestionBank/>}/>
  <Route path="*" element={<Navigate to="/practice" replace/>}/>
</Routes></BrowserRouter>)

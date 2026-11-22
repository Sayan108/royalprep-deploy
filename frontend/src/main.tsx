import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { adminRoutes } from './AdminRoutes'
import { studentRoutes } from './StudentRoutes'
import './style.css'
import './screens.css'

createRoot(document.getElementById('root')!).render(<BrowserRouter><Routes>
  {studentRoutes}
  {adminRoutes}
  <Route path="*" element={<main><h1>Page not found</h1><a href="/">Go home</a></main>}/>
</Routes></BrowserRouter>)

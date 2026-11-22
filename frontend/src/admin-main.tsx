import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { adminRoutes } from './AdminRoutes'
import './style.css'
import './screens.css'

createRoot(document.getElementById('root')!).render(<BrowserRouter><Routes>
  <Route path="/" element={<Navigate to="/admin" replace/>}/>
  {adminRoutes}
  <Route path="*" element={<main><h1>Page not found</h1><a href="/admin">Admin sign-in</a></main>}/>
</Routes></BrowserRouter>)

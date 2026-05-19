import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import PrototypePage from './pages/PrototypePage'
import './styles/theme.css'
import './styles/layout.css'
import './styles/preview.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/prototype" element={<PrototypePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

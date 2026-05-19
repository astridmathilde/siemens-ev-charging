import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import MobilePage from './pages/MobilePage'
import StationPage from './pages/StationPage'
import './styles/theme.css'
import './styles/layout.css'
import './styles/preview.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/mobile" element={<MobilePage />} />
        <Route path="/station" element={<StationPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
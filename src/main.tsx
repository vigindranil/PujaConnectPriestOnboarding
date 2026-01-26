import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // ADD THIS IMPORT
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/pujaConnect">  {/* ADD THIS WRAPPER */}
      <App />
    </BrowserRouter>  {/* ADD THIS CLOSING TAG */}
  </StrictMode>,
)
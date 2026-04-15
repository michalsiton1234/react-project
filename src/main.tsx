import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'   // ✅ חדש
import { store } from './store'          // ✅ חדש
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>   {/* ✅ עטיפה */}
      <App />
    </Provider>
  </StrictMode>,
)

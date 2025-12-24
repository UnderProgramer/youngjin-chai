import { Routes, Route, BrowserRouter, } from 'react-router-dom'

import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { AuthInitializer } from './components/AuthInitializer'
import { RegisterPage } from './pages/RegisterPage'
import { WebSocketPage } from './pages/WebSocketPage'

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthInitializer>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/chat' element={<WebSocketPage />} />
            </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </>
  )
}

export default App

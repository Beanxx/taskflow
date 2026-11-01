import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  )
}

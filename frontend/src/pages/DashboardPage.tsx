import { Navigate, useNavigate } from 'react-router-dom'
import { clearToken, getToken } from '../lib/auth'

export default function DashboardPage() {
  const navigate = useNavigate()

  if (!getToken()) return <Navigate to="/login" replace />

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    </main>
  )
}

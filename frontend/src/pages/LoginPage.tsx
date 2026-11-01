import { Link, useNavigate } from 'react-router-dom'
import Login, { type LoginCredentials } from '../components/Login'
import { login } from '../lib/auth'
import AuthLayout from './AuthLayout'

export default function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = async (credentials: LoginCredentials) => {
    await login(credentials)
    navigate('/dashboard')
  }

  return (
    <AuthLayout
      title="로그인"
      footer={
        <>
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:underline">
            회원가입
          </Link>
        </>
      }
    >
      <Login onLogin={handleLogin} />
    </AuthLayout>
  )
}

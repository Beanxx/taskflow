import { Link } from 'react-router-dom'
import Login from '../components/Login'
import AuthLayout from './AuthLayout'

export default function LoginPage() {
  // TODO: 백엔드 /api/auth/login 연동 (토큰 저장 후 /dashboard 이동)
  const handleLogin = () => {}

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

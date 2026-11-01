import { Link, useNavigate } from 'react-router-dom'
import Register, { type RegisterCredentials } from '../components/Register'
import { register } from '../lib/auth'
import AuthLayout from './AuthLayout'

export default function RegisterPage() {
  const navigate = useNavigate()

  const handleRegister = async (credentials: RegisterCredentials) => {
    await register(credentials)
    navigate('/dashboard')
  }

  return (
    <AuthLayout
      title="회원가입"
      footer={
        <>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            로그인
          </Link>
        </>
      }
    >
      <Register onRegister={handleRegister} />
    </AuthLayout>
  )
}

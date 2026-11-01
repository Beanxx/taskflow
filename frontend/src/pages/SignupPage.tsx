import { Link } from 'react-router-dom'
import Signup from '../components/Signup'
import AuthLayout from './AuthLayout'

export default function SignupPage() {
  // TODO: 백엔드 /api/auth/register 연동 (토큰 저장 후 /dashboard 이동)
  const handleSignup = () => {}

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
      <Signup onSignup={handleSignup} />
    </AuthLayout>
  )
}

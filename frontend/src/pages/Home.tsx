import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">TaskFlow</h1>
      <p className="mt-4 text-lg text-gray-600">
        할 일을 등록하고, 진행 상태를 한눈에 관리하세요.
      </p>
      <p className="mt-1 text-sm text-gray-500">대기 중 → 진행 중 → 완료</p>

      <div className="mt-8 flex gap-3">
        <Link
          to="/register"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          회원가입
        </Link>
        <Link
          to="/login"
          className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          로그인
        </Link>
      </div>
    </main>
  )
}

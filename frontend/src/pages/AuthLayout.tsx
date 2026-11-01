import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthLayout({ title, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <Link to="/" className="mb-6 text-2xl font-bold text-gray-900">
        TaskFlow
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-gray-800">{title}</h1>
      <div className="w-full">{children}</div>
      <p className="mt-4 text-sm text-gray-600">{footer}</p>
    </main>
  )
}

export const inputClass = (hasError: boolean) =>
  [
    'mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none',
    'focus:ring-2',
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
  ].join(' ')

export function ErrorMessage({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-red-600">
      {message}
    </p>
  )
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 8

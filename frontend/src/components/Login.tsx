import { useId, useState, type FormEvent } from 'react'
import { EMAIL_PATTERN, ErrorMessage, inputClass, MIN_PASSWORD_LENGTH } from './FormField'

export interface LoginCredentials {
  email: string
  password: string
}

interface LoginProps {
  onLogin: (credentials: LoginCredentials) => void | Promise<void>
}

type FieldErrors = Partial<Record<keyof LoginCredentials, string>>

const validate = ({ email, password }: LoginCredentials): FieldErrors => {
  const errors: FieldErrors = {}

  if (!email.trim()) errors.email = '이메일을 입력해주세요.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = '올바른 이메일 형식이 아닙니다.'

  if (!password) errors.password = '비밀번호를 입력해주세요.'
  else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`
  }

  return errors
}

export default function Login({ onLogin }: LoginProps) {
  const emailId = useId()
  const passwordId = useId()
  const [values, setValues] = useState<LoginCredentials>({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setFormError(undefined)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const credentials = { email: values.email.trim(), password: values.password }
    const fieldErrors = validate(credentials)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setSubmitting(true)
    setFormError(undefined)
    try {
      await onLogin(credentials)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"
    >
      <div>
        <label htmlFor={emailId} className="block text-sm font-medium text-gray-700">
          이메일
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className={inputClass(!!errors.email)}
        />
        <ErrorMessage id={`${emailId}-error`} message={errors.email} />
      </div>

      <div>
        <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          className={inputClass(!!errors.password)}
        />
        <ErrorMessage id={`${passwordId}-error`} message={errors.password} />
      </div>

      {formError && (
        <p role="alert" className="error-message rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        로그인
      </button>
    </form>
  )
}

import { useId, useState, type FormEvent } from 'react'
import { EMAIL_PATTERN, ErrorMessage, inputClass, MIN_PASSWORD_LENGTH } from './FormField'

export interface SignupCredentials {
  email: string
  password: string
}

interface SignupProps {
  onSignup: (credentials: SignupCredentials) => void | Promise<void>
}

interface SignupValues extends SignupCredentials {
  passwordConfirm: string
}

type FieldErrors = Partial<Record<keyof SignupValues, string>>

const validate = ({ email, password, passwordConfirm }: SignupValues): FieldErrors => {
  const errors: FieldErrors = {}

  if (!email.trim()) errors.email = '이메일을 입력해주세요.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = '올바른 이메일 형식이 아닙니다.'

  if (!password) errors.password = '비밀번호를 입력해주세요.'
  else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`
  }

  if (!passwordConfirm) errors.passwordConfirm = '비밀번호를 한 번 더 입력해주세요.'
  else if (password !== passwordConfirm) errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'

  return errors
}

export default function Signup({ onSignup }: SignupProps) {
  const emailId = useId()
  const passwordId = useId()
  const confirmId = useId()
  const [values, setValues] = useState<SignupValues>({ email: '', password: '', passwordConfirm: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: keyof SignupValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setFormError(undefined)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmed = { ...values, email: values.email.trim() }
    const fieldErrors = validate(trimmed)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setSubmitting(true)
    setFormError(undefined)
    try {
      await onSignup({ email: trimmed.email, password: trimmed.password })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (
    id: string,
    key: keyof SignupValues,
    label: string,
    type: string,
    autoComplete: string,
  ) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={values[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `${id}-error` : undefined}
        className={inputClass(!!errors[key])}
      />
      <ErrorMessage id={`${id}-error`} message={errors[key]} />
    </div>
  )

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"
    >
      {field(emailId, 'email', '이메일', 'email', 'email')}
      {field(passwordId, 'password', '비밀번호', 'password', 'new-password')}
      {field(confirmId, 'passwordConfirm', '비밀번호 확인', 'password', 'new-password')}

      {formError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        회원가입
      </button>
    </form>
  )
}

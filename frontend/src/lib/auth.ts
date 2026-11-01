const TOKEN_KEY = 'token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

interface Credentials {
  email: string
  password: string
}

// 상태 코드별 사용자 메시지. 매핑에 없으면 서버가 준 error를 그대로 보여준다.
async function authenticate(
  path: 'login' | 'register',
  credentials: Credentials,
  messages: Partial<Record<number, string>>,
) {
  const res = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(messages[res.status] ?? data?.error ?? '요청에 실패했습니다.')
  }
  setToken(data.token)
}

export const login = (credentials: Credentials) =>
  authenticate('login', credentials, {
    400: '잘못된 이메일 또는 비밀번호입니다.',
    401: '잘못된 이메일 또는 비밀번호입니다.',
  })

export const register = (credentials: Credentials) =>
  authenticate('register', credentials, { 409: '이미 가입된 이메일입니다.' })

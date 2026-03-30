/**
 * Auth API – signin and signup. Uses Vite proxy to backend /api when VITE_API_URL is not set.
 */
const BASE = import.meta.env.VITE_API_URL ?? ''

export interface SignInBody {
  email: string
  password: string
}

export interface SignUpBody {
  email: string
  password: string
  type: 'business' | 'expert'
  [key: string]: unknown
}

export interface AuthUser {
  id: string
  email: string
  type: string
  createdAt?: string
}

export interface AuthResponse {
  success: boolean
  user?: AuthUser
  token?: string
  error?: string
  errors?: string[]
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json().catch(() => ({})) as { error?: string; errors?: string[] }
  if (!res.ok) {
    const message =
      data.error ??
      (Array.isArray(data.errors) && data.errors.length > 0 ? data.errors.join('. ') : null) ??
      res.statusText
    const err = new Error(message) as Error & { data?: unknown; status?: number }
    err.data = data
    ;(err as Error & { status?: number }).status = res.status
    throw err
  }
  return data as T
}

export async function signin(body: SignInBody): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function signup(body: SignUpBody): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') window.localStorage.setItem('auth_token', token)
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('auth_token')
}

export function setAuthUser(user: AuthUser) {
  if (typeof window !== 'undefined') window.localStorage.setItem('auth_user', JSON.stringify(user))
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const s = window.localStorage.getItem('auth_user')
    return s ? (JSON.parse(s) as AuthUser) : null
  } catch {
    return null
  }
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('auth_token')
    window.localStorage.removeItem('auth_user')
  }
}

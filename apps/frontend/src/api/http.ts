import { clearAuth, getAuthToken, getAuthUser } from './auth'

const BASE = import.meta.env.VITE_API_URL ?? ''

type RequestOptions = RequestInit & {
  includeJsonContentType?: boolean
}

type ErrorPayload = {
  error?: string
  errors?: string[]
}

function redirectToSignin() {
  if (typeof window === 'undefined') return
  if (window.location.pathname === '/signin') return
  const next = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const encodedNext = encodeURIComponent(next || '/')
  window.location.assign(`/signin?next=${encodedNext}`)
}

export async function authedRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken()
  const includeJsonContentType = options.includeJsonContentType ?? true
  const headers: HeadersInit = {
    ...(options.headers ?? {}),
  }

  if (includeJsonContentType) {
    ;(headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  if (token) {
    ;(headers as Record<string, string>).Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = (await res.json().catch(() => ({}))) as ErrorPayload

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth()
      redirectToSignin()
    } else if (res.status === 403) {
      const user = getAuthUser()
      if (!user?.type) redirectToSignin()
    }
    const message =
      data.error ??
      (Array.isArray(data.errors) && data.errors.length > 0 ? data.errors.join('. ') : null) ??
      res.statusText
    throw new Error(message)
  }

  return data as T
}

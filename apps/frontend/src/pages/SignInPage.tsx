import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { signIn, clearError } from '../store/slices/authSlice'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const searchParams = new URLSearchParams(location.search)
  const nextFromQuery = searchParams.get('next')
  const nextFromState =
    location.state && typeof location.state === 'object' && 'from' in location.state
      ? String((location.state as { from?: unknown }).from ?? '')
      : ''
  const safeNextPath = (() => {
    const candidate = (nextFromQuery || nextFromState || '').trim()
    if (!candidate.startsWith('/')) return ''
    if (candidate.startsWith('//')) return ''
    if (candidate.startsWith('/signin') || candidate.startsWith('/signup')) return ''
    return candidate
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setValidationError('Email is required.')
      return
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setValidationError('Please enter a valid email address.')
      return
    }
    if (!password) {
      setValidationError('Password is required.')
      return
    }
    const result = await dispatch(signIn({ email: trimmedEmail, password }))
    if (signIn.fulfilled.match(result)) {
      const user = result.payload.user
      if (safeNextPath) {
        navigate(safeNextPath, { replace: true })
      } else if (user.type === 'business') navigate('/business/dashboard', { replace: true })
      else if (user.type === 'expert') navigate('/expert/dashboard', { replace: true })
      else navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F4F7] font-sans text-gray-600 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <Logo to="/" variant="header" className="mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight mb-1">Welcome Back</h1>
            <p className="text-sm text-gray-500">Log in to your account</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {(error || validationError) && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{validationError || error}</div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:border-transparent bg-white"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium no-underline hover:underline" style={{ color: '#2293B4' }}>
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:border-transparent bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:ring-offset-2 transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: '#2293B4' }}
            >
              {isLoading ? 'Signing in…' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-[15px] text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium no-underline hover:underline" style={{ color: '#2293B4' }}>
              Sign up
            </Link>
          </p>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-gray-600 text-sm no-underline hover:text-gray-800">
              <span aria-hidden>←</span> Back to home
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 px-6">
        <p className="text-sm text-gray-400">
          <Link to="/privacy" className="text-gray-400 no-underline hover:text-gray-600">Manage cookies or opt out</Link>
        </p>
      </footer>
    </div>
  )
}

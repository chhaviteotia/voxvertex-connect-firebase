import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { signIn, clearError } from '../store/slices/authSlice'
import { AuthMarketingShell } from '../components/auth/AuthMarketingShell'

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
    <AuthMarketingShell>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#101623] p-8 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-white">Welcome Back</h1>
            <p className="text-sm text-white/55">Log in to your account</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {(error || validationError) && (
              <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
                {validationError || error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/85">
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
                className="w-full rounded-lg border border-white/15 bg-[#0D1018] px-4 py-2.5 text-white placeholder-white/35 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/50"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-white/85">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#FF9B3D] no-underline hover:text-[#FFB15A]"
                >
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
                className="w-full rounded-lg border border-white/15 bg-[#0D1018] px-4 py-2.5 text-white placeholder-white/35 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#FFB15A] px-4 py-3 text-base font-semibold text-[#25160A] transition-[filter,opacity] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/60 focus:ring-offset-2 focus:ring-offset-[#101623] disabled:opacity-70"
            >
              {isLoading ? 'Signing in…' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-[15px] text-white/60">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-[#FF9B3D] no-underline hover:text-[#FFB15A]">
              Sign up
            </Link>
          </p>

          <div className="mt-6 border-t border-white/10 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/55 no-underline hover:text-white"
            >
              <span aria-hidden>←</span> Back to home
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4">
        <p className="text-sm text-white/35">
          <Link to="/privacy" className="text-white/45 no-underline hover:text-white/70">
            Manage cookies or opt out
          </Link>
        </p>
      </footer>
    </AuthMarketingShell>
  )
}

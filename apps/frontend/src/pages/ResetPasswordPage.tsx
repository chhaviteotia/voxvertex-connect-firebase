import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthMarketingShell } from '../components/auth/AuthMarketingShell'
import { resetPasswordWithToken } from '../api/auth'

const MIN_PASSWORD_LENGTH = 8
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => (searchParams.get('token') ?? '').trim(), [searchParams])

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [validationError, setValidationError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [doneMessage, setDoneMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    setSubmitError('')
    setDoneMessage('')

    if (!token) {
      setValidationError('This link is missing a token. Open the link from your email or request a new reset.')
      return
    }
    if (!password) {
      setValidationError('Password is required.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (!SPECIAL_CHAR_REGEX.test(password)) {
      setValidationError('Password must include at least one special character (e.g. ! @ # $ %).')
      return
    }
    if (password !== confirm) {
      setValidationError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const res = await resetPasswordWithToken({ token, password })
      setDoneMessage(res.message ?? 'Your password has been reset.')
      setPassword('')
      setConfirm('')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthMarketingShell>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#101623] p-8 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-white">Set new password</h1>
            <p className="text-sm text-white/55">Choose a strong password for your account.</p>
          </div>

          {doneMessage ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-emerald-500/35 bg-emerald-950/30 p-4 text-sm text-emerald-100">
                {doneMessage}
              </div>
              <Link
                to="/signin"
                className="block w-full rounded-lg bg-[#FFB15A] px-4 py-3 text-center text-base font-semibold text-[#25160A] no-underline transition-[filter] hover:brightness-95"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {!token && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-3 text-sm text-amber-100">
                  Invalid or expired link.{' '}
                  <Link to="/forgot-password" className="font-medium text-[#FFB15A] underline-offset-2 hover:underline">
                    Request a new reset
                  </Link>
                  .
                </div>
              )}
              {(validationError || submitError) && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
                  {validationError || submitError}
                </div>
              )}
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-white/85">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token}
                  className="w-full rounded-lg border border-white/15 bg-[#0D1018] px-4 py-2.5 text-white placeholder-white/35 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/50 disabled:opacity-50"
                />
                <p className="mt-1.5 text-xs text-white/45">
                  {MIN_PASSWORD_LENGTH}–128 characters, including one special character.
                </p>
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-white/85">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={!token}
                  className="w-full rounded-lg border border-white/15 bg-[#0D1018] px-4 py-2.5 text-white placeholder-white/35 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/50 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full rounded-lg bg-[#FFB15A] px-4 py-3 text-base font-semibold text-[#25160A] transition-[filter,opacity] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/60 focus:ring-offset-2 focus:ring-offset-[#101623] disabled:opacity-70"
              >
                {isLoading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-[15px] text-white/60">
            <Link to="/signin" className="font-medium text-[#FF9B3D] no-underline hover:text-[#FFB15A]">
              Back to sign in
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

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { AuthMarketingShell } from '../components/auth/AuthMarketingShell'
import { requestPasswordReset } from '../api/auth'
import { getFirebaseAuth, isFirebaseAuthClientConfigured } from '../config/firebaseClient'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const GENERIC_DONE =
  'If an account exists for that email, you will receive password reset instructions shortly.'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [doneMessage, setDoneMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    setSubmitError('')
    setDoneMessage('')
    const trimmed = email.trim()
    if (!trimmed) {
      setValidationError('Email is required.')
      return
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setValidationError('Please enter a valid email address.')
      return
    }
    setIsLoading(true)
    try {
      if (isFirebaseAuthClientConfigured()) {
        const auth = getFirebaseAuth()
        if (auth) {
          try {
            await sendPasswordResetEmail(auth, trimmed)
            setDoneMessage(GENERIC_DONE)
            setEmail('')
            return
          } catch (err: unknown) {
            const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: string }).code) : ''
            if (code === 'auth/invalid-email') {
              setValidationError('Please enter a valid email address.')
              return
            }
            setSubmitError('Could not send reset email. Try again or use another method.')
            return
          }
        }
      }

      const res = await requestPasswordReset({ email: trimmed })
      setDoneMessage(res.message ?? GENERIC_DONE)
      setEmail('')
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
            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-white">Forgot password</h1>
            <p className="text-sm text-white/55">
              Enter your email and we&apos;ll send you a reset link if an account exists.
            </p>
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
                Back to sign in
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {(validationError || submitError) && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
                  {validationError || submitError}
                </div>
              )}
              <div>
                <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-white/85">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#0D1018] px-4 py-2.5 text-white placeholder-white/35 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/50"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-[#FFB15A] px-4 py-3 text-base font-semibold text-[#25160A] transition-[filter,opacity] hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/60 focus:ring-offset-2 focus:ring-offset-[#101623] disabled:opacity-70"
              >
                {isLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-[15px] text-white/60">
            Remember your password?{' '}
            <Link to="/signin" className="font-medium text-[#FF9B3D] no-underline hover:text-[#FFB15A]">
              Sign in
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

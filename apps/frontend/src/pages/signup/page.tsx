import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthMarketingShell } from '../../components/auth/AuthMarketingShell'

type Role = 'business' | 'expert'

const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 128
const MAX_EMAIL_LENGTH = 254
const MAX_FULL_NAME_LENGTH = 200
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/

function validateSignupStep1(fullName: string, email: string, password: string) {
  const trimmedName = fullName.trim()
  const trimmedEmail = email.trim()
  const fullNameError = !trimmedName
    ? 'Full name is required.'
    : trimmedName.length > MAX_FULL_NAME_LENGTH
      ? `Full name must be at most ${MAX_FULL_NAME_LENGTH} characters.`
      : ''
  let emailError = ''
  if (!trimmedEmail) emailError = 'Email is required.'
  else if (trimmedEmail.length > MAX_EMAIL_LENGTH) emailError = 'Email is too long.'
  else if (!EMAIL_REGEX.test(trimmedEmail)) emailError = 'Please enter a valid email address.'
  let passwordError = ''
  if (!password) passwordError = 'Password is required.'
  else {
    if (password.length < MIN_PASSWORD_LENGTH)
      passwordError = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    else if (password.length > MAX_PASSWORD_LENGTH)
      passwordError = `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`
    else if (!SPECIAL_CHAR_REGEX.test(password))
      passwordError = 'Password must include at least one special character (e.g. ! @ # $ %).'
  }
  return { fullNameError, emailError, passwordError }
}

export function SignupPage() {
  const [role, setRole] = useState<Role>('business')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullNameError, setFullNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password
    const errs = validateSignupStep1(trimmedName, trimmedEmail, trimmedPassword)
    setFullNameError(errs.fullNameError)
    setEmailError(errs.emailError)
    setPasswordError(errs.passwordError)
    if (errs.fullNameError || errs.emailError || errs.passwordError) return
    if (role === 'business') {
      navigate('/signup/business', {
        state: { contactName: trimmedName, email: trimmedEmail, password: trimmedPassword },
      })
    } else {
      navigate('/signup/expert', {
        state: { name: trimmedName, email: trimmedEmail, password: trimmedPassword },
      })
    }
  }

  const inputBase =
    'w-full rounded-lg border px-4 py-2.5 text-white placeholder-white/35 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/50'
  const inputOk = 'border-white/15 bg-[#0D1018]'
  const inputErr = 'border-red-500/50 bg-red-950/20'

  return (
    <AuthMarketingShell>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#101623] p-8 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
          <div className="mb-6 flex flex-col items-center">
            <h1 className="text-2xl font-semibold text-white">Create Account</h1>
            <p className="mt-1 text-sm text-white/55">Get started in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">I am a</label>
              <div className="space-y-2">
                <label
                  onClick={() => setRole('business')}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    role === 'business'
                      ? 'border-[#FFB15A]/50 bg-[#FFB15A]/10'
                      : 'border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      role === 'business' ? 'bg-[#FFB15A]' : 'border border-white/30 bg-transparent'
                    }`}
                  />
                  <span className={role === 'business' ? 'font-semibold text-white' : 'text-white/75'}>
                    Business Looking for experts
                  </span>
                </label>
                <label
                  onClick={() => setRole('expert')}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    role === 'expert'
                      ? 'border-[#FFB15A]/50 bg-[#FFB15A]/10'
                      : 'border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      role === 'expert' ? 'bg-[#FFB15A]' : 'border border-white/30 bg-transparent'
                    }`}
                  />
                  <span className={role === 'expert' ? 'font-semibold text-white' : 'text-white/75'}>
                    Expert Offering services
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-white/85">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                maxLength={MAX_FULL_NAME_LENGTH}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setFullNameError('')
                }}
                className={`${inputBase} ${fullNameError ? inputErr : inputOk}`}
                aria-invalid={!!fullNameError}
                aria-describedby={fullNameError ? 'fullName-error' : undefined}
              />
              {fullNameError && (
                <p id="fullName-error" className="mt-1 text-sm text-red-300">
                  {fullNameError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/85">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                maxLength={MAX_EMAIL_LENGTH}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                className={`${inputBase} ${emailError ? inputErr : inputOk}`}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="mt-1 text-sm text-red-300">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/85">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                maxLength={MAX_PASSWORD_LENGTH}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                className={`${inputBase} ${passwordError ? inputErr : inputOk}`}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : 'password-hint'}
              />
              <p id="password-hint" className="mt-1 text-xs text-white/45">
                8–128 characters, including one special character (e.g. ! @ # $ %)
              </p>
              {passwordError && (
                <p id="password-error" className="mt-1 text-sm text-red-300">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#FFB15A] py-3 font-semibold text-[#25160A] transition-[filter] hover:brightness-95"
            >
              Create Account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-white/60">
            Already have an account?{' '}
            <Link to="/signin" className="font-medium text-[#FF9B3D] no-underline hover:text-[#FFB15A]">
              Log in
            </Link>
          </p>

          <div className="mt-6 border-t border-white/10 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/55 no-underline hover:text-white"
            >
              <span aria-hidden>←</span>
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </AuthMarketingShell>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'

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
  const fullNameError = !trimmedName ? 'Full name is required.' : trimmedName.length > MAX_FULL_NAME_LENGTH ? `Full name must be at most ${MAX_FULL_NAME_LENGTH} characters.` : ''
  let emailError = ''
  if (!trimmedEmail) emailError = 'Email is required.'
  else if (trimmedEmail.length > MAX_EMAIL_LENGTH) emailError = 'Email is too long.'
  else if (!EMAIL_REGEX.test(trimmedEmail)) emailError = 'Please enter a valid email address.'
  let passwordError = ''
  if (!password) passwordError = 'Password is required.'
  else {
    if (password.length < MIN_PASSWORD_LENGTH) passwordError = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    else if (password.length > MAX_PASSWORD_LENGTH) passwordError = `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`
    else if (!SPECIAL_CHAR_REGEX.test(password)) passwordError = 'Password must include at least one special character (e.g. ! @ # $ %).'
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

  return (
    <div className="min-h-screen bg-[#F0F4F7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <Logo to="/" variant="header" className="mb-6" />
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Get started in minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">I am a</label>
            <div className="space-y-2">
              <label
                onClick={() => setRole('business')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  role === 'business' ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${role === 'business' ? 'bg-gray-900' : 'bg-transparent border border-gray-300'}`} />
                <span className={role === 'business' ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                  Business Looking for experts
                </span>
              </label>
              <label
                onClick={() => setRole('expert')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  role === 'expert' ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${role === 'expert' ? 'bg-gray-900' : 'bg-transparent border border-gray-300'}`} />
                <span className={role === 'expert' ? 'font-semibold text-gray-900' : 'text-gray-700'}>
                  Expert Offering services
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-800 mb-1.5">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              maxLength={MAX_FULL_NAME_LENGTH}
              onChange={(e) => { setFullName(e.target.value); setFullNameError('') }}
              className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#20B2AA] focus:border-transparent ${fullNameError ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
              aria-invalid={!!fullNameError}
              aria-describedby={fullNameError ? 'fullName-error' : undefined}
            />
            {fullNameError && <p id="fullName-error" className="mt-1 text-sm text-red-600">{fullNameError}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              maxLength={MAX_EMAIL_LENGTH}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
              className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#20B2AA] focus:border-transparent ${emailError ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && <p id="email-error" className="mt-1 text-sm text-red-600">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              maxLength={MAX_PASSWORD_LENGTH}
              onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
              className={`w-full px-4 py-2.5 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#20B2AA] focus:border-transparent ${passwordError ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : 'password-hint'}
            />
            <p id="password-hint" className="mt-1 text-xs text-gray-500">8–128 characters, including one special character (e.g. ! @ # $ %)</p>
            {passwordError && <p id="password-error" className="mt-1 text-sm text-red-600">{passwordError}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#20B2AA] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#2196F3] font-medium no-underline hover:underline">
            Log in
          </Link>
        </p>

        <div className="border-t border-gray-200 mt-6 pt-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-gray-600 text-sm no-underline hover:text-gray-800">
            <span aria-hidden>←</span>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { CustomSelect } from '../../components/CustomSelect'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { signUp } from '../../store/slices/authSlice'

interface ExpertSignupState {
  name?: string
  email?: string
  password?: string
}

const STEPS = 3
const PRIMARY_DOMAINS = [
  'Leadership & Management',
  'AI & Technology',
  'Sales & Marketing',
  'Strategy & Innovation',
  'Operations & Process',
  'Finance & Compliance',
  'HR & Culture',
  'Product & Design',
]
const EXPERIENCE_RANGES = ['1-3 years', '3-5 years', '5-10 years', '10-15 years', '15+ years']

const TARGET_AUDIENCES = ['Senior Leaders', 'Middle Management', 'Individual Contributors', 'Cross-functional Teams', 'Technical Teams', 'Sales Teams', 'HR Teams', 'Executives']
const DELIVERY_MODES = ['Online', 'In-person', 'Hybrid'] as const
const FEE_MIN = 10_000
const FEE_MAX = 500_000
const FEE_STEP = 5000

const STEP3_TEAL = '#2391B1'
const STEP3_SLIDER_FILL = '#313238'

const SERVICE_OFFERINGS = [
  { id: 'speaker', title: 'Speaker', description: 'Keynotes & presentations', Icon: IconMicrophone },
  { id: 'trainer', title: 'Trainer', description: 'Workshops & training', Icon: IconGraduationCap },
  { id: 'coach', title: 'Coach', description: '1-on-1 coaching', Icon: IconPeople },
  { id: 'mentor', title: 'Mentor', description: 'Long-term mentorship', Icon: IconHeart },
] as const

const TEAL = '#008C9E'

function IconMicrophone({ className = 'w-6 h-6', stroke = TEAL }: { className?: string; stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  )
}
function IconGraduationCap({ className = 'w-6 h-6', stroke = TEAL }: { className?: string; stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10 5 10-5-10-5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  )
}
function IconPeople({ className = 'w-6 h-6', stroke = TEAL }: { className?: string; stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <circle cx="17" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v2" />
    </svg>
  )
}
function IconHeart({ className = 'w-6 h-6', stroke = TEAL }: { className?: string; stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CheckmarkCircle() {
  return (
    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#008C9E] flex items-center justify-center" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}

const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008C9E] focus:border-transparent bg-gray-50'
const labelClass = 'block text-sm font-medium text-gray-800 mb-1.5'

export function ExpertSignupPage() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isLoading: authLoading, error: authError } = useAppSelector((state) => state.auth)
  const signupState = (location.state as ExpertSignupState | null) ?? {}
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const displayError = errorMessage || authError || ''
  const loading = status === 'loading' || authLoading
  const [form, setForm] = useState({
    fullName: signupState.name ?? '',
    email: signupState.email ?? '',
    primaryDomain: '',
    experienceRange: '',
  })
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [targetAudience, setTargetAudience] = useState<string[]>([])
  const [deliveryMode, setDeliveryMode] = useState<string>('Online')
  const [feeRange, setFeeRange] = useState(50_000)

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const toggleTargetAudience = (item: string) => {
    setTargetAudience((prev) => (prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]))
  }

  const toggleService = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const isStep1Valid = () => {
    const t = (s: string) => (s || '').trim()
    return !!(t(form.fullName) && t(form.email) && t(form.primaryDomain) && t(form.experienceRange))
  }

  const handleContinue = async () => {
    setErrorMessage('')
    if (step === 1 && !isStep1Valid()) {
      setErrorMessage('Please fill in all fields.')
      setStatus('error')
      return
    }
    if (step < STEPS) {
      setStep(step + 1)
      return
    }
    const password = signupState.password
    if (!password || !form.email?.trim()) {
      setErrorMessage('Missing email or password. Please start signup from the main signup page.')
      setStatus('error')
      return
    }
    setStatus('loading')
    const result = await dispatch(signUp({
      type: 'expert',
      email: form.email.trim(),
      password,
      name: form.fullName?.trim() ?? '',
      expertise: form.primaryDomain ?? '',
      experienceRange: form.experienceRange ?? '',
    }))
    if (signUp.fulfilled.match(result)) {
      setStatus('success')
    } else {
      setErrorMessage(result.payload ?? 'Signup failed.')
      setStatus('error')
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else window.history.back()
  }

  if (status === 'success') {
    const profileStrength = 20
    return (
      <div className="min-h-screen bg-[#f7f9fc] font-sans flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#2ea6b6] bg-white flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2ea6b6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#202c44] mb-6">Welcome to Voxvertex!</h1>
            <div className="w-full flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-[#202c44] shrink-0">Profile Strength</span>
              <div className="flex-1 h-2 bg-[#e0e0e0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#202c44] rounded-full transition-all duration-500"
                  style={{ width: `${profileStrength}%` }}
                  aria-hidden
                />
              </div>
              <span className="text-sm font-semibold text-[#2ea6b6] shrink-0">{profileStrength}%</span>
            </div>
            <p className="text-[#6c757d] text-sm mb-8">
              Complete your profile to get matched with better opportunities and improve your ranking.
            </p>
            <Link
              to="/expert/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#2ea6b6] text-white font-semibold text-base no-underline hover:opacity-90 transition-opacity"
            >
              Go to Dashboard <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7F8] font-sans text-gray-600 flex flex-col">
      <header className="pt-8 pb-4">
        <div className="max-w-lg mx-auto px-6 flex flex-col items-center">
          <Logo to="/" variant="header" className="mb-6" />
          <h1 className="text-2xl font-bold text-gray-900">Expert Setup</h1>
          <p className="text-sm text-gray-500 mt-0.5">Step {step} of {STEPS}</p>
          <div className="w-full mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#008C9E] rounded-full transition-all duration-300"
              style={{ width: `${(step / STEPS) * 100}%` }}
              aria-hidden
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex justify-center px-6 pb-8">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900">Let&apos;s start with the basics</h2>
              <p className="text-sm text-gray-500 mt-0.5 mb-6">Tell us about yourself</p>
              {status === 'error' && displayError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{displayError}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className={labelClass}>Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="primaryDomain" className={labelClass}>Primary Domain</label>
                  <CustomSelect
                    id="primaryDomain"
                    value={form.primaryDomain}
                    onChange={(v) => update('primaryDomain', v)}
                    options={PRIMARY_DOMAINS}
                    placeholder="Select your domain"
                  />
                </div>
                <div>
                  <label htmlFor="experienceRange" className={labelClass}>Experience Range</label>
                  <CustomSelect
                    id="experienceRange"
                    value={form.experienceRange}
                    onChange={(v) => update('experienceRange', v)}
                    options={EXPERIENCE_RANGES}
                    placeholder="Select experience range"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span aria-hidden>←</span> Back
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!isStep1Valid()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#008C9E] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  Continue <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900">What do you offer?</h2>
              <p className="text-sm text-gray-500 mt-0.5 mb-6">Select all that apply</p>
              <div className="grid grid-cols-2 gap-4">
                {SERVICE_OFFERINGS.map(({ id, title, description, Icon }) => {
                  const isSelected = selectedServices.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleService(id)}
                      className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-colors ${
                        isSelected ? 'border-[#008C9E] bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {isSelected && <CheckmarkCircle />}
                      <span
                        className={`flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${isSelected ? 'bg-[#008C9E]' : 'bg-gray-200'}`}
                      >
                        <Icon stroke={isSelected ? 'white' : TEAL} className="w-6 h-6" />
                      </span>
                      <span className="font-bold text-gray-900 text-[15px] text-center">{title}</span>
                      <span className="text-sm text-gray-500 mt-0.5 text-center">{description}</span>
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span aria-hidden>←</span> Back
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#008C9E] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Continue <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900">Quick snapshot</h2>
              <p className="text-sm text-gray-500 mt-0.5 mb-6">Help us match you better</p>
              {status === 'error' && displayError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{displayError}</div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Target Audience (select multiple)</h3>
                <div className="flex flex-wrap gap-2">
                  {TARGET_AUDIENCES.map((item) => {
                    const isSelected = targetAudience.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleTargetAudience(item)}
                        className={`inline-flex items-center gap-2 rounded-lg text-sm font-medium border transition-colors ${
                          isSelected
                            ? 'bg-[#2391B1] text-white border-[#2391B1] pl-3 pr-2 py-2'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300 px-4 py-2'
                        }`}
                      >
                        {item}
                        {isSelected && (
                          <span className="inline-flex shrink-0 w-4 h-4 items-center justify-center rounded-full hover:bg-white/20" aria-hidden>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Delivery Mode</h3>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_MODES.map((mode) => {
                    const isSelected = deliveryMode === mode
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDeliveryMode(mode)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                          isSelected
                            ? 'bg-[#D2F2FA] text-gray-900 border-[#2391B1]'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {mode}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-800">Expected Fee Range (per engagement)</h3>
                  <span className="text-sm font-medium" style={{ color: STEP3_TEAL }}>
                    ₹{feeRange.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="px-1">
                  <input
                    type="range"
                    min={FEE_MIN}
                    max={FEE_MAX}
                    step={FEE_STEP}
                    value={feeRange}
                    onChange={(e) => setFeeRange(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, ${STEP3_SLIDER_FILL} 0%, ${STEP3_SLIDER_FILL} ${((feeRange - FEE_MIN) / (FEE_MAX - FEE_MIN)) * 100}%, #e5e7eb ${((feeRange - FEE_MIN) / (FEE_MAX - FEE_MIN)) * 100}%, #e5e7eb 100%)`,
                    }}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#313238] [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#313238]"
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>₹10,000</span>
                  <span>₹5,00,000</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 text-sm font-medium hover:bg-gray-100 rounded-lg"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#008C9E] text-white text-sm font-medium hover:opacity-90 disabled:opacity-70"
                >
                  {loading ? 'Creating account…' : 'Finish Setup'} <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          )}
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

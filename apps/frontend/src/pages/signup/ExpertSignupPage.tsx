import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CustomSelect } from '../../components/CustomSelect'
import { AuthMarketingShell } from '../../components/auth/AuthMarketingShell'
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

const STEP3_ACCENT = '#FFB15A'
const STEP3_SLIDER_FILL = '#FFB15A'

const SERVICE_OFFERINGS = [
  { id: 'speaker', title: 'Speaker', description: 'Keynotes & presentations', Icon: IconMicrophone },
  { id: 'trainer', title: 'Trainer', description: 'Workshops & training', Icon: IconGraduationCap },
  { id: 'coach', title: 'Coach', description: '1-on-1 coaching', Icon: IconPeople },
  { id: 'mentor', title: 'Mentor', description: 'Long-term mentorship', Icon: IconHeart },
] as const

const ACCENT = '#FFB15A'

function IconMicrophone({ className = 'w-6 h-6', stroke = ACCENT }: { className?: string; stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  )
}
function IconGraduationCap({ className = 'w-6 h-6', stroke = ACCENT }: { className?: string; stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10 5 10-5-10-5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  )
}
function IconPeople({ className = 'w-6 h-6', stroke = ACCENT }: { className?: string; stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <circle cx="17" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v2" />
    </svg>
  )
}
function IconHeart({ className = 'w-6 h-6', stroke = ACCENT }: { className?: string; stroke?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CheckmarkCircle() {
  return (
    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFB15A]" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}

const inputClass =
  'w-full rounded-lg border border-white/15 bg-[#0D1018] px-4 py-2.5 text-white placeholder-white/35 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/50'
const labelClass = 'mb-1.5 block text-sm font-medium text-white/85'

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
      <AuthMarketingShell>
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#101623] p-8 text-center shadow-[0_0_60px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#FFB15A]/50 bg-[#FFB15A]/10">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFB15A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="mb-6 text-2xl font-semibold text-white">Welcome to Voxvertex!</h1>
              <div className="mb-6 flex w-full items-center gap-3">
                <span className="shrink-0 text-sm font-medium text-white/85">Profile Strength</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#FFB15A] transition-all duration-500"
                    style={{ width: `${profileStrength}%` }}
                    aria-hidden
                  />
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#FFB15A]">{profileStrength}%</span>
              </div>
              <p className="mb-8 text-sm text-white/55">
                Complete your profile to get matched with better opportunities and improve your ranking.
              </p>
              <Link
                to="/expert/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFB15A] px-6 py-3 text-base font-semibold text-[#25160A] no-underline transition-[filter] hover:brightness-95"
              >
                Go to Dashboard <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </main>
      </AuthMarketingShell>
    )
  }

  return (
    <AuthMarketingShell>
      <header className="border-b border-white/10 bg-[#080C15] px-6 pb-6 pt-8">
        <div className="mx-auto flex max-w-lg flex-col items-center px-0">
          <h1 className="text-2xl font-semibold text-white">Expert Setup</h1>
          <p className="mt-0.5 text-sm text-white/55">
            Step {step} of {STEPS}
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#FFB15A] transition-all duration-300"
              style={{ width: `${(step / STEPS) * 100}%` }}
              aria-hidden
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-6 pb-8 pt-6">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <div className="rounded-xl border border-white/10 bg-[#101623] p-6 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              <h2 className="text-lg font-semibold text-white">Let&apos;s start with the basics</h2>
              <p className="mb-6 mt-0.5 text-sm text-white/55">Tell us about yourself</p>
              {status === 'error' && displayError && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">{displayError}</div>
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
                    variant="dark"
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
                    variant="dark"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
                >
                  <span aria-hidden>←</span> Back
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!isStep1Valid()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FFB15A] px-5 py-2.5 text-sm font-semibold text-[#25160A] transition-[filter] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-xl border border-white/10 bg-[#101623] p-6 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              <h2 className="text-lg font-semibold text-white">What do you offer?</h2>
              <p className="mb-6 mt-0.5 text-sm text-white/55">Select all that apply</p>
              <div className="grid grid-cols-2 gap-4">
                {SERVICE_OFFERINGS.map(({ id, title, description, Icon }) => {
                  const isSelected = selectedServices.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleService(id)}
                      className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-5 transition-colors ${
                        isSelected ? 'border-[#FFB15A] bg-[#0D1018] shadow-sm' : 'border-white/10 bg-[#0D1018] hover:border-white/20'
                      }`}
                    >
                      {isSelected && <CheckmarkCircle />}
                      <span
                        className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${isSelected ? 'bg-[#FFB15A]' : 'bg-white/10'}`}
                      >
                        <Icon stroke={isSelected ? '#25160A' : ACCENT} className="h-6 w-6" />
                      </span>
                      <span className="text-center text-[15px] font-bold text-white">{title}</span>
                      <span className="mt-0.5 text-center text-sm text-white/55">{description}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/5"
                >
                  <span aria-hidden>←</span> Back
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FFB15A] px-5 py-2.5 text-sm font-semibold text-[#25160A] transition-[filter] hover:brightness-95"
                >
                  Continue <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-xl border border-white/10 bg-[#101623] p-6 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              <h2 className="text-lg font-semibold text-white">Quick snapshot</h2>
              <p className="mb-6 mt-0.5 text-sm text-white/55">Help us match you better</p>
              {status === 'error' && displayError && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">{displayError}</div>
              )}

              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-white/85">Target Audience (select multiple)</h3>
                <div className="flex flex-wrap gap-2">
                  {TARGET_AUDIENCES.map((item) => {
                    const isSelected = targetAudience.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleTargetAudience(item)}
                        className={`inline-flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'border-[#FFB15A] bg-[#FFB15A]/20 py-2 pl-3 pr-2 text-[#FFB15A]'
                            : 'border-white/15 bg-[#0D1018] px-4 py-2 text-white/85 hover:border-white/25'
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
                <h3 className="mb-3 text-sm font-medium text-white/85">Delivery Mode</h3>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_MODES.map((mode) => {
                    const isSelected = deliveryMode === mode
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDeliveryMode(mode)}
                        className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'border-[#FFB15A] bg-[#FFB15A]/15 text-[#FFB15A]'
                            : 'border-white/15 bg-[#0D1018] text-white/85 hover:border-white/25'
                        }`}
                      >
                        {mode}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white/85">Expected Fee Range (per engagement)</h3>
                  <span className="text-sm font-medium text-[#FFB15A]">
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
                      background: `linear-gradient(to right, ${STEP3_SLIDER_FILL} 0%, ${STEP3_SLIDER_FILL} ${((feeRange - FEE_MIN) / (FEE_MAX - FEE_MIN)) * 100}%, rgba(255,255,255,0.12) ${((feeRange - FEE_MIN) / (FEE_MAX - FEE_MIN)) * 100}%, rgba(255,255,255,0.12) 100%)`,
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#FFB15A] [&::-moz-range-thumb]:bg-[#25160A] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FFB15A] [&::-webkit-slider-thumb]:bg-[#25160A] [&::-webkit-slider-thumb]:shadow"
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-white/45">
                  <span>₹10,000</span>
                  <span>₹5,00,000</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FFB15A] px-5 py-2.5 text-sm font-semibold text-[#25160A] hover:brightness-95 disabled:opacity-70"
                >
                  {loading ? 'Creating account…' : 'Finish Setup'} <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          )}
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

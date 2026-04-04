import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CustomSelect } from '../../components/CustomSelect'
import { AuthMarketingShell } from '../../components/auth/AuthMarketingShell'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { signUp } from '../../store/slices/authSlice'

interface SignupState {
  contactName?: string
  email?: string
  password?: string
}


const STEPPER_LABELS = ['Organization', 'Event Behavior', 'Preferences', 'Complete']


const ENGAGEMENT_TYPES = ['Training Programs', 'Workshops', 'Keynote Speaking', 'Coaching', 'Consulting', 'Mentorship']
const ENGAGEMENT_FREQUENCY = ['Monthly', 'Quarterly', 'Twice a year', 'Annually', 'Ad-hoc']
const BUDGET_RANGES_INR = ['₹50,000 - ₹1,00,000', '₹1,00,000 - ₹2,50,000', '₹2,50,000 - ₹5,00,000', '₹5,00,000 - ₹10,00,000', '₹10,00,000+']
const PREFERRED_REGIONS = ['Local', 'National', 'International']


const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Consulting', 'Manufacturing']
const COMPANY_SIZES = ['1-50 employees', '51-200 employees', '201-500 employees', '501-1000 employees', '1000+ employees']

const inputClass =
  'w-full px-4 py-2.5 border border-white/15 rounded-lg bg-[#0D1018] text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-[#FFB15A]/50 focus:border-transparent'
const labelClass = 'block text-sm font-medium text-white/85 mb-1.5'


export function BusinessSignupPage() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isLoading: authLoading, error: authError } = useAppSelector((state) => state.auth)
  const signupState = (location.state as SignupState | null) ?? {}

  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const loading = status === 'loading' || authLoading
  const displayError = errorMessage || authError || ''

  const [form, setForm] = useState({
    organizationName: '',
    organizationType: '',
    industry: '',
    companySize: '',
    annualBudgetBand: '',
    operatingRegion: '',
    decisionMakerRole: '',
    decisionMakerSeniority: '',
    expertEngagementsPerYear: '',
    averageBudgetPerEngagement: '',
    typicalEventTypes: [] as string[],
    typicalAudienceRole: '',
    audienceSeniority: '',
    audienceKnowledgeLevel: 3,
    preferredSessionDuration: '',
    preferredDeliveryMode: '',
    typicalOutcomes: [] as string[],
    interactivityPreference: 3,
    riskSensitivity: 'Medium' as '' | 'Low' | 'Medium' | 'High',
    experimentalOpenness: 3,
    outcomeMeasurementPreference: '',
    contactName: signupState.contactName ?? '',
    email: signupState.email ?? '',
    phone: '',
    message: '',
    website: '',
    preferredRegions: [] as string[],
  })

  const update = (key: keyof typeof form, value: string | number | string[]) => setForm((f) => ({ ...f, [key]: value }))

  const toggleEventType = (eventType: string) => {
    setForm((f) => ({
      ...f,
      typicalEventTypes: f.typicalEventTypes.includes(eventType)
        ? f.typicalEventTypes.filter((t) => t !== eventType)
        : [...f.typicalEventTypes, eventType],
    }))
  }


  const togglePreferredRegion = (region: string) => {
    setForm((f) => ({
      ...f,
      preferredRegions: f.preferredRegions.includes(region)
        ? f.preferredRegions.filter((r) => r !== region)
        : [...f.preferredRegions, region],
    }))
  }


  const isStep1Valid = () => {
    const t = (s: string) => (s || '').trim()
    return !!(t(form.organizationName) && t(form.industry) && t(form.companySize) && t(form.contactName) && t(form.email))
  }
  const isStep2Valid = () => {
    const t = (s: string) => (s || '').trim()
    return form.typicalEventTypes.length > 0 && !!t(form.expertEngagementsPerYear)
  }
  const isStep3Valid = () => {
    const t = (s: string) => (s || '').trim()
    return !!t(form.averageBudgetPerEngagement)
  }
  const isCurrentStepValid = step === 1 ? isStep1Valid() : step === 2 ? isStep2Valid() : isStep3Valid()

  const handleContinue = async () => {
    if (!isCurrentStepValid) {
      setErrorMessage('Please fill in all required fields before continuing.')
      setStatus('error')
      return
    }
    setErrorMessage('')
    setStatus('idle')
    if (step < 3) {
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
    const payload = {
      type: 'business' as const,
      email: form.email.trim(),
      password,
      contactName: form.contactName?.trim() ?? '',
      companyName: form.organizationName?.trim() ?? '',
      organizationType: form.organizationType ?? '',
      industry: form.industry ?? '',
      companySize: form.companySize ?? '',
      annualBudgetBand: form.annualBudgetBand ?? '',
      operatingRegion: form.operatingRegion ?? '',
      decisionMakerRole: form.decisionMakerRole ?? '',
      decisionMakerSeniority: form.decisionMakerSeniority ?? '',
      expertEngagementsPerYear: form.expertEngagementsPerYear ?? '',
      averageBudgetPerEngagement: form.averageBudgetPerEngagement ?? '',
      typicalEventTypes: form.typicalEventTypes ?? [],
      typicalAudienceRole: form.typicalAudienceRole ?? '',
      audienceSeniority: form.audienceSeniority ?? '',
      audienceKnowledgeLevel: form.audienceKnowledgeLevel ?? 3,
      preferredSessionDuration: form.preferredSessionDuration ?? '',
      preferredDeliveryMode: form.preferredDeliveryMode ?? '',
      typicalOutcomes: form.typicalOutcomes ?? [],
      interactivityPreference: form.interactivityPreference ?? 3,
      riskSensitivity: form.riskSensitivity ?? 'Medium',
      experimentalOpenness: form.experimentalOpenness ?? 3,
      outcomeMeasurementPreference: form.outcomeMeasurementPreference ?? '',
      phone: form.phone ?? '',
      message: form.message ?? '',
      website: form.website ?? '',
      preferredRegions: form.preferredRegions ?? [],
    }
    const result = await dispatch(signUp(payload))
    if (signUp.fulfilled.match(result)) {
      setStatus('success')
      setStep(4)
    } else {
      setErrorMessage(result.payload ?? 'Signup failed.')
      setStatus('error')
    }
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const currentStepperStep = step <= 3 ? step : 4

  return (
    <AuthMarketingShell>
      <header className="border-b border-white/10 bg-[#080C15] px-6 py-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="mt-1 text-xl font-semibold text-white">Set Up Your Account</h1>
          <p className="mt-0.5 text-sm text-white/55">Step {currentStepperStep} of 4</p>
          <div className="mt-6">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#FFB15A] transition-all duration-300"
                style={{ width: `${(currentStepperStep / 4) * 100}%` }}
                aria-hidden
              />
            </div>
            <div className="mt-4 flex justify-between">
              {STEPPER_LABELS.map((label, i) => {
                const stepNum = i + 1
                const isActive = currentStepperStep === stepNum
                const isCompleted = currentStepperStep > stepNum
                return (
                  <div key={label} className="flex flex-col items-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        isActive
                          ? 'bg-[#FFB15A] text-[#25160A]'
                          : isCompleted
                            ? 'bg-[#FF9B3D] text-[#25160A]'
                            : 'bg-white/10 text-white/45'
                      }`}
                    >
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        stepNum
                      )}
                    </span>
                    <span className={`mt-1.5 text-xs ${isActive ? 'font-medium text-[#FFB15A]' : isCompleted ? 'text-white/75' : 'text-white/45'}`}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center p-6">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <div className="rounded-lg border border-white/10 bg-[#101623] p-6 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              <h2 className="text-lg font-semibold text-white">Organization Information</h2>
              <p className="mb-5 mt-0.5 text-sm text-white/55">Tell us about your company</p>
              {status === 'error' && displayError && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">{displayError}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="organizationName" className={labelClass}>Company Name <span className="text-red-500">*</span></label>
                  <input id="organizationName" type="text" placeholder="Acme Corporation" value={form.organizationName} onChange={(e) => update('organizationName', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="industry" className={labelClass}>Industry <span className="text-red-500">*</span></label>
                  <CustomSelect
                    id="industry"
                    value={form.industry}
                    onChange={(v) => update('industry', v)}
                    options={INDUSTRIES}
                    placeholder="Select industry"
                    variant="dark"
                  />
                </div>
                <div>
                  <label htmlFor="companySize" className={labelClass}>Company Size <span className="text-red-500">*</span></label>
                  <CustomSelect
                    id="companySize"
                    value={form.companySize}
                    onChange={(v) => update('companySize', v)}
                    options={COMPANY_SIZES}
                    placeholder="Select company size"
                    variant="dark"
                  />
                </div>
                <div>
                  <label htmlFor="website" className={labelClass}>Website (Optional)</label>
                  <input id="website" type="url" placeholder="https://acme.com" value={form.website} onChange={(e) => update('website', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                <Link to="/signup" className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/85 no-underline hover:bg-white/5">Back</Link>
                <button type="button" onClick={handleContinue} disabled={!isStep1Valid()} className="rounded-lg bg-[#FFB15A] px-5 py-2.5 text-sm font-semibold text-[#25160A] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">Continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-lg border border-white/10 bg-[#101623] p-6 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              <h2 className="text-lg font-semibold text-white">Event Behavior</h2>
              <p className="mb-5 mt-0.5 text-sm text-white/55">Help us understand your needs</p>
              {status === 'error' && displayError && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">{displayError}</div>
              )}
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-white/85">What types of engagements do you typically need? (Select all that apply)</p>
                  <div className="space-y-2">
                    {ENGAGEMENT_TYPES.map((eventType) => (
                      <label key={eventType} className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={form.typicalEventTypes.includes(eventType)}
                          onChange={() => toggleEventType(eventType)}
                          className="h-4 w-4 rounded border-white/25 bg-[#0D1018] text-[#FFB15A] focus:ring-[#FFB15A]/50"
                        />
                        <span className="text-sm text-white/80">{eventType}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="expertEngagementsPerYear" className={labelClass}>How often do you engage experts?</label>
                  <CustomSelect
                    id="expertEngagementsPerYear"
                    value={form.expertEngagementsPerYear}
                    onChange={(v) => update('expertEngagementsPerYear', v)}
                    options={ENGAGEMENT_FREQUENCY}
                    placeholder="Select frequency"
                    variant="dark"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                <button type="button" onClick={handlePrevious} className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5">Back</button>
                <button type="button" onClick={handleContinue} disabled={!isStep2Valid()} className="rounded-lg bg-[#FFB15A] px-5 py-2.5 text-sm font-semibold text-[#25160A] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">Continue</button>
              </div>
              
            </div>
          )}

          {step === 3 && (
            <div className="rounded-lg border border-white/10 bg-[#101623] p-6 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              <h2 className="text-lg font-semibold text-white">Preferences</h2>
              <p className="mb-5 mt-0.5 text-sm text-white/55">Set your default preferences</p>
              {status === 'error' && displayError && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">{displayError}</div>
              )}
              <div className="space-y-6">
                <div>
                  <label htmlFor="averageBudgetPerEngagement" className={labelClass}>Typical Budget Range (per engagement)</label>
                  <CustomSelect
                    id="averageBudgetPerEngagement"
                    value={form.averageBudgetPerEngagement}
                    onChange={(v) => update('averageBudgetPerEngagement', v)}
                    options={BUDGET_RANGES_INR}
                    placeholder="Select budget range"
                    variant="dark"
                  />
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-white/85">Preferred Regions (Select all that apply)</p>
                  <div className="space-y-2">
                    {PREFERRED_REGIONS.map((region) => (
                      <label key={region} className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={form.preferredRegions.includes(region)}
                          onChange={() => togglePreferredRegion(region)}
                          className="h-4 w-4 rounded border-white/25 bg-[#0D1018] text-[#FFB15A] focus:ring-[#FFB15A]/50"
                        />
                        <span className="text-sm text-white/80">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                <button type="button" onClick={handlePrevious} className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5">Back</button>
                <button type="button" onClick={handleContinue} disabled={!isStep3Valid() || loading} className="rounded-lg bg-[#FFB15A] px-5 py-2.5 text-sm font-semibold text-[#25160A] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">
                  {loading ? 'Creating account…' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="rounded-lg border border-white/10 bg-[#101623] p-6 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFB15A]/20">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFB15A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-white">You&apos;re All Set!</h2>
                <p className="mb-8 text-sm text-white/55">Your account is ready. Start creating requirements to find the right experts.</p>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <button type="button" onClick={handlePrevious} className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5">Back</button>
                <Link to="/business/dashboard" className="rounded-lg bg-[#FFB15A] px-5 py-2.5 text-sm font-semibold text-[#25160A] no-underline hover:brightness-95">Go to Dashboard</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      {step === 4 && (
        <footer className="px-6 py-4">
          <p className="text-sm text-white/35">Manage cookies or opt out</p>
        </footer>
      )}
    </AuthMarketingShell>
  )
}

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { CustomSelect } from '../../components/CustomSelect'
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

const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008C9E] focus:border-transparent'
const labelClass = 'block text-sm font-medium text-gray-800 mb-1.5'


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
    <div className="min-h-screen bg-gray-100 font-sans text-gray-600 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-2xl mx-auto">
          <Logo variant="header" to="/" />
          <h1 className="text-xl font-bold text-gray-900 mt-4">Set Up Your Account</h1>
          <p className="text-sm text-gray-500 mt-0.5">Step {currentStepperStep} of 4</p>
          <div className="mt-6">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-300"
                style={{ width: `${(currentStepperStep / 4) * 100}%` }}
                aria-hidden
              />
            </div>
            <div className="flex justify-between mt-4">
              {STEPPER_LABELS.map((label, i) => {
                const stepNum = i + 1
                const isActive = currentStepperStep === stepNum
                const isCompleted = currentStepperStep > stepNum
                return (
                  <div key={label} className="flex flex-col items-center">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isActive ? 'bg-gray-900 text-white' : isCompleted ? 'bg-[#008C9E] text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        stepNum
                      )}
                    </span>
                    <span className={`text-xs mt-1.5 ${isActive ? 'text-gray-500' : isCompleted ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900">Organization Information</h2>
              <p className="text-sm text-gray-500 mt-0.5 mb-5">Tell us about your company</p>
              {status === 'error' && displayError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{displayError}</div>
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
                  />
                </div>
                <div>
                  <label htmlFor="website" className={labelClass}>Website (Optional)</label>
                  <input id="website" type="url" placeholder="https://acme.com" value={form.website} onChange={(e) => update('website', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="border-t border-gray-200 mt-6 pt-6 flex items-center justify-between">
                <Link to="/signup" className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium no-underline hover:bg-gray-50">Back</Link>
                <button type="button" onClick={handleContinue} disabled={!isStep1Valid()} className="px-5 py-2.5 rounded-lg bg-[#008C9E] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">Continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900">Event Behavior</h2>
              <p className="text-sm text-gray-500 mt-0.5 mb-5">Help us understand your needs</p>
              {status === 'error' && displayError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{displayError}</div>
              )}
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-3">What types of engagements do you typically need? (Select all that apply)</p>
                  <div className="space-y-2">
                    {ENGAGEMENT_TYPES.map((eventType) => (
                      <label key={eventType} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.typicalEventTypes.includes(eventType)}
                          onChange={() => toggleEventType(eventType)}
                          className="w-4 h-4 rounded border-gray-300 text-[#008C9E] focus:ring-[#008C9E]"
                        />
                        <span className="text-sm text-gray-800">{eventType}</span>
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
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 mt-6 pt-6 flex items-center justify-between">
                <button type="button" onClick={handlePrevious} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">Back</button>
                <button type="button" onClick={handleContinue} disabled={!isStep2Valid()} className="px-5 py-2.5 rounded-lg bg-[#008C9E] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">Continue</button>
              </div>
              
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900">Preferences</h2>
              <p className="text-sm text-gray-500 mt-0.5 mb-5">Set your default preferences</p>
              {status === 'error' && displayError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{displayError}</div>
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
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-3">Preferred Regions (Select all that apply)</p>
                  <div className="space-y-2">
                    {PREFERRED_REGIONS.map((region) => (
                      <label key={region} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.preferredRegions.includes(region)}
                          onChange={() => togglePreferredRegion(region)}
                          className="w-4 h-4 rounded border-gray-300 text-[#008C9E] focus:ring-[#008C9E]"
                        />
                        <span className="text-sm text-gray-800">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-6 pt-6 flex items-center justify-between">
                <button type="button" onClick={handlePrevious} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">Back</button>
                <button type="button" onClick={handleContinue} disabled={!isStep3Valid() || loading} className="px-5 py-2.5 rounded-lg bg-[#008C9E] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Creating account…' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#008C9E]/20 flex items-center justify-center mb-6">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#008C9E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re All Set!</h2>
                <p className="text-gray-500 text-sm mb-8">Your account is ready. Start creating requirements to find the right experts.</p>
              </div>
              <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
                <button type="button" onClick={handlePrevious} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">Back</button>
                <Link to="/business/dashboard" className="px-5 py-2.5 rounded-lg bg-[#008C9E] text-white text-sm font-medium no-underline hover:opacity-90">Go to Dashboard</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      {step === 4 && (
        <footer className="py-4 px-6">
          <p className="text-sm text-gray-400">Manage cookies or opt out</p>
        </footer>
      )}
    </div>
  )
}

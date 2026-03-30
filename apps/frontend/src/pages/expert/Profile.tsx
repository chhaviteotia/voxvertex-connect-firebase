import { useState, useEffect, useMemo, useRef } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarItems, expertSidebarBottomItems } from '../../config/expertNav'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import {
  getExpertProfile,
  updateExpertProfile,
  type ExperienceEntry,
  type ExpertProfileData,
} from '../../api/expertProfile'
import {
  computeExpertProfileCompletion,
  EXPERT_SECTION_LABELS,
} from '../../utils/expertProfileCompletion'
import {
  IconUser,
  IconTarget,
  IconCalendar,
  IconDollar,
  IconLock,
  IconDelivery,
} from '../../components/layout/DashboardIcons'

/** Primary green/teal for expert profile — matches “Improve Profile with AI” hover. */
const ACCENT = '#0084A3'
const SELECTED_TEAL = '#0084A3'

/** AI Suggestions mark — accent 4-point star + smaller sparkle upper-right. */
function AiSuggestionsSparkleMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill={ACCENT}
        d="M15.5 5.5l1.1 6.1 6.1 1.1-6.1 1.1-1.1 6.1-1.1-6.1-6.1-1.1 6.1-1.1 1.1-6.1z"
      />
      <path
        fill={ACCENT}
        d="M25.8 7.2l0.5 1.45 1.45 0.5-1.45 0.5-0.5 1.45-0.5-1.45-1.45-0.5 1.45-0.5 0.5-1.45z"
      />
    </svg>
  )
}

const DEFAULT_OBJECTIVES = [
  'Skill Development',
  'Revenue Generation',
  'Hiring & Talent',
  'Brand Positioning',
  'Leadership Alignment',
  'Innovation & Problem Solving',
  'Compliance & Risk',
  'Community & Networking',
  'Product Adoption',
  'Behavior Change',
]

const DEFAULT_AUDIENCES = [
  'Students',
  'Job Seekers',
  'Entry Level Employees',
  'Individual Contributors',
  'Managers',
  'Senior Managers',
  'Leaders',
  'Executives',
  'Founders',
  'Entrepreneurs',
  'Sales Team',
  'Marketing Team',
  'HR Team',
  'Tech Team',
  'Product Team',
  'Operations Team',
  'Finance Team',
  'Cross-Functional Team',
  'Customers',
  'Partners',
  'Investors',
  'Community Members',
]

const DEFAULT_INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Education',
  'Startups',
]

/** Predefined engagement types (cards). Custom types use violet chips below. */
const DEFAULT_ENGAGEMENT_TYPES: { title: string; intensity: string; outcome: string }[] = [
  { title: 'Keynote Session', intensity: 'low intensity', outcome: 'low outcome' },
  { title: 'Panel Discussion', intensity: 'low intensity', outcome: 'low outcome' },
  { title: 'Fireside Chat', intensity: 'low intensity', outcome: 'medium outcome' },
  { title: 'Workshop (Single Day)', intensity: 'high intensity', outcome: 'medium outcome' },
  { title: 'Workshop (Multi-Day)', intensity: 'high intensity', outcome: 'high outcome' },
  { title: 'Bootcamp', intensity: 'high intensity', outcome: 'high outcome' },
  { title: 'Coaching (1-on-1)', intensity: 'high intensity', outcome: 'high outcome' },
  { title: 'Coaching (Group)', intensity: 'high intensity', outcome: 'high outcome' },
  { title: 'Mentorship Program', intensity: 'medium intensity', outcome: 'high outcome' },
  { title: 'Advisory Session', intensity: 'medium intensity', outcome: 'high outcome' },
  { title: 'Strategy Offsite', intensity: 'high intensity', outcome: 'high outcome' },
  { title: 'Roundtable', intensity: 'medium intensity', outcome: 'medium outcome' },
  { title: 'Hackathon', intensity: 'high intensity', outcome: 'high outcome' },
  { title: 'Masterclass', intensity: 'medium intensity', outcome: 'high outcome' },
  { title: 'Webinar', intensity: 'low intensity', outcome: 'low outcome' },
  { title: 'Training Program', intensity: 'high intensity', outcome: 'high outcome' },
  { title: 'Implementation Sprint', intensity: 'high intensity', outcome: 'high outcome' },
]

/** Match reference UI: bold red intensity / green outcome labels */
const ENGAGEMENT_INTENSITY_STYLE = (label: string) =>
  label.includes('high')
    ? 'font-semibold text-[#D93025]'
    : label.includes('medium')
      ? 'font-semibold text-[#C2410C]'
      : 'font-medium text-gray-600'

const ENGAGEMENT_OUTCOME_STYLE = (label: string) =>
  label.includes('high')
    ? 'font-semibold text-[#1E8E3E]'
    : label.includes('medium')
      ? 'font-semibold text-[#C2410C]'
      : 'font-medium text-gray-600'

const CUSTOM_ENGAGEMENT_VIOLET = '#7C3AED'

const DEFAULT_TOPICS = [
  'Leadership Development',
  'Public Speaking',
  'Communication Skills',
  'Team Building',
  'Emotional Intelligence',
  'Change Management',
  'Strategic Planning',
  'Innovation & Creativity',
  'Project Management',
  'Agile & Scrum',
  'Digital Transformation',
  'Data Analytics',
  'Artificial Intelligence',
  'Cybersecurity',
  'Product Management',
  'Sales Strategy',
  'Marketing Strategy',
  'Customer Success',
  'Negotiation Skills',
  'Conflict Resolution',
  'Time Management',
  'Productivity',
  'Entrepreneurship',
  'Startup Strategy',
  'Fundraising',
  'Financial Planning',
  'Operations Management',
  'Supply Chain',
  'Human Resources',
  'Diversity & Inclusion',
]

const SECTIONS = [
  { id: 'identity', title: 'Identity', weight: '15%', summary: 'Bio, LinkedIn, Photo', icon: IconUser, locked: false },
  { id: 'capability', title: 'Capability', weight: '25%', summary: 'Objectives, Audience, Industries', icon: IconTarget, locked: true },
  { id: 'experience', title: 'Experience', weight: '25%', summary: 'Past engagements and outcomes', icon: IconUser, locked: true },
  { id: 'delivery', title: 'Delivery Model', weight: '15%', summary: 'Structure, Tools, Follow-up', icon: IconDelivery, locked: true },
  { id: 'pricing', title: 'Pricing', weight: '10%', summary: 'Fee bands and flexibility', icon: IconDollar, locked: true },
  { id: 'availability', title: 'Availability', weight: '10%', summary: 'Calendar and travel', icon: IconCalendar, locked: true },
] as const

export function ExpertProfile() {
  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe' : 'John Doe')

  const [expandedId, setExpandedId] = useState<string | null>('identity')
  const [bio, setBio] = useState('')
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')

  // Capability selections (no pre-selection; expert chooses)
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([])
  const [customObjectives, setCustomObjectives] = useState<string[]>([])
  const [customObjectiveInput, setCustomObjectiveInput] = useState('')

  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [customAudiences, setCustomAudiences] = useState<string[]>([])
  const [customAudienceInput, setCustomAudienceInput] = useState('')

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])

  const [selectedEngagementTypes, setSelectedEngagementTypes] = useState<string[]>([])
  const [customEngagementTypes, setCustomEngagementTypes] = useState<string[]>([])
  const [customEngagementInput, setCustomEngagementInput] = useState('')

  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState<string[]>([])
  const [customTopicInput, setCustomTopicInput] = useState('')

  // Capability: interactivity, functional alignment, depth
  const [interactivityLevel, setInteractivityLevel] = useState(50)
  const [functionalAlignment, setFunctionalAlignment] = useState<Record<string, number>>({
    technicalOrientation: 3,
    businessOrientation: 3,
    toolUsageMaturity: 3,
    processOrientation: 3,
  })
  const [depthCapacity, setDepthCapacity] = useState<number | null>(null)

  // Other sections
  const [deliveryStructure, setDeliveryStructure] = useState('')
  const [toolsPlatforms, setToolsPlatforms] = useState('')
  const [offerFollowUp, setOfferFollowUp] = useState(false)

  const [baseFee, setBaseFee] = useState('150000')
  const [priceFlexibility, setPriceFlexibility] = useState('Moderate - Some flexibility')

  const [weeklyAvailability, setWeeklyAvailability] = useState('')
  const [travelWillingness, setTravelWillingness] = useState('Select travel willingness')

  const [showExperienceForm, setShowExperienceForm] = useState(false)
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null)
  const [experienceTitle, setExperienceTitle] = useState('')
  const [experienceOutcome, setExperienceOutcome] = useState('')
  const [experienceAudience, setExperienceAudience] = useState('')
  const [experienceYear, setExperienceYear] = useState('')
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>([])

  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<{ section: string; ok: boolean } | null>(null)
  /** Skip first run after profile load so we don’t PATCH back unchanged capability. */
  const skipCapabilityAutosaveRef = useRef(true)

  const getCapabilityUpdateBody = (): Partial<ExpertProfileData> => ({
    capability: {
      selectedObjectives,
      customObjectives,
      selectedAudiences,
      customAudiences,
      selectedIndustries,
      selectedEngagementTypes,
      customEngagementTypes,
      selectedTopics,
      customTopics,
      interactivityLevel,
      functionalAlignment: Object.keys(functionalAlignment).length ? functionalAlignment : undefined,
      depthCapacity: depthCapacity ?? undefined,
    },
  })

  useEffect(() => {
    let cancelled = false
    setProfileLoading(true)
    setProfileError(null)
    getExpertProfile()
      .then((res) => {
        if (cancelled || !res.success || !res.data) return
        const d = res.data
        if (d.identity) {
          setBio(d.identity.bio ?? '')
          setLinkedInUrl(d.identity.linkedInUrl ?? '')
          setPhotoUrl(d.identity.photoUrl ?? '')
        }
        if (d.capability) {
          const c = d.capability
          const rawCustomObj = (c.customObjectives ?? []).filter(
            (x: string) => !DEFAULT_OBJECTIVES.includes(x),
          )
          const rawSelObj = c.selectedObjectives ?? []
          const inferredObj = rawSelObj.filter(
            (x: string) => !DEFAULT_OBJECTIVES.includes(x) && !rawCustomObj.includes(x),
          )
          setCustomObjectives([...rawCustomObj, ...inferredObj])
          setSelectedObjectives(rawSelObj)

          const rawCustomAud = (c.customAudiences ?? []).filter(
            (x: string) => !DEFAULT_AUDIENCES.includes(x),
          )
          const rawSelAud = c.selectedAudiences ?? []
          const inferredAud = rawSelAud.filter(
            (x: string) => !DEFAULT_AUDIENCES.includes(x) && !rawCustomAud.includes(x),
          )
          setCustomAudiences([...rawCustomAud, ...inferredAud])
          setSelectedAudiences(rawSelAud)
          setSelectedIndustries(c.selectedIndustries ?? [])
          const defaultEngagementTitles = new Set(DEFAULT_ENGAGEMENT_TYPES.map((e) => e.title))
          const rawCustomEng = (c.customEngagementTypes ?? []).filter(
            (x: string) => !defaultEngagementTitles.has(x),
          )
          const rawSelEng = c.selectedEngagementTypes ?? []
          const inferredEng = rawSelEng.filter(
            (x: string) => !defaultEngagementTitles.has(x) && !rawCustomEng.includes(x),
          )
          setCustomEngagementTypes([...rawCustomEng, ...inferredEng])
          setSelectedEngagementTypes(rawSelEng)
          const rawCustomTopics = (c.customTopics ?? []).filter(
            (x: string) => !DEFAULT_TOPICS.includes(x),
          )
          const rawSelTopics = c.selectedTopics ?? []
          const inferredTopics = rawSelTopics.filter(
            (x: string) => !DEFAULT_TOPICS.includes(x) && !rawCustomTopics.includes(x),
          )
          setCustomTopics([...rawCustomTopics, ...inferredTopics])
          setSelectedTopics(rawSelTopics)
          setInteractivityLevel(typeof c.interactivityLevel === 'number' ? c.interactivityLevel : 50)
          setFunctionalAlignment(c.functionalAlignment && typeof c.functionalAlignment === 'object' ? c.functionalAlignment : { technicalOrientation: 3, businessOrientation: 3, toolUsageMaturity: 3, processOrientation: 3 })
          setDepthCapacity(typeof c.depthCapacity === 'number' && c.depthCapacity >= 1 && c.depthCapacity <= 5 ? c.depthCapacity : null)
        }
        if (d.experience?.entries?.length) setExperienceEntries(d.experience.entries)
        if (d.delivery) {
          setDeliveryStructure(d.delivery.structure ?? '')
          setToolsPlatforms(d.delivery.toolsPlatforms ?? '')
          setOfferFollowUp(d.delivery.offerFollowUp ?? false)
        }
        if (d.pricing) {
          setBaseFee(d.pricing.baseFee ?? '150000')
          setPriceFlexibility(d.pricing.priceFlexibility ?? 'Moderate - Some flexibility')
        }
        if (d.availability) {
          setWeeklyAvailability(d.availability.weeklyAvailability ?? '')
          setTravelWillingness(d.availability.travelWillingness ?? 'Select travel willingness')
        }
      })
      .catch((err) => {
        if (!cancelled) setProfileError(err instanceof Error ? err.message : 'Failed to load profile')
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const showSaveFeedback = (section: string, ok: boolean) => {
    setSaveMessage({ section, ok })
    setTimeout(() => setSaveMessage(null), 3000)
  }

  const handleSaveIdentity = async () => {
    try {
      const res = await updateExpertProfile({
        identity: { bio, linkedInUrl, photoUrl },
      })
      if (res.success) showSaveFeedback('Identity', true)
      else showSaveFeedback('Identity', false)
    } catch {
      showSaveFeedback('Identity', false)
    }
  }

  const handleSaveCapability = async () => {
    try {
      const res = await updateExpertProfile(getCapabilityUpdateBody())
      if (res.success) showSaveFeedback('Capability', true)
      else showSaveFeedback('Capability', false)
    } catch {
      showSaveFeedback('Capability', false)
    }
  }

  // Persist objectives / audiences (and rest of capability) shortly after edits so refresh matches server.
  useEffect(() => {
    if (profileLoading) return
    if (skipCapabilityAutosaveRef.current) {
      skipCapabilityAutosaveRef.current = false
      return
    }
    const t = window.setTimeout(() => {
      updateExpertProfile(getCapabilityUpdateBody()).catch(() => {
        /* silent — user can use Save Capability if needed */
      })
    }, 500)
    return () => window.clearTimeout(t)
  }, [
    profileLoading,
    selectedObjectives,
    customObjectives,
    selectedAudiences,
    customAudiences,
    selectedIndustries,
    selectedEngagementTypes,
    customEngagementTypes,
    selectedTopics,
    customTopics,
    interactivityLevel,
    functionalAlignment,
    depthCapacity,
  ])

  const setAlignment = (key: string, value: number) => {
    setFunctionalAlignment((prev) => ({ ...prev, [key]: value }))
  }

  const canSaveExperience = showExperienceForm && experienceTitle.trim().length > 0

  const completion = useMemo(
    () =>
      computeExpertProfileCompletion({
        identity: { bio, linkedInUrl, photoUrl },
        capability: {
          selectedObjectives,
          customObjectives,
          selectedAudiences,
          customAudiences,
          selectedIndustries,
          selectedEngagementTypes,
          customEngagementTypes,
          selectedTopics,
          customTopics,
          interactivityLevel,
          functionalAlignment,
          depthCapacity: depthCapacity ?? undefined,
        },
        experience: { entries: experienceEntries },
        delivery: { structure: deliveryStructure, toolsPlatforms, offerFollowUp },
        pricing: { baseFee, priceFlexibility },
        availability: { weeklyAvailability, travelWillingness },
      }),
    [
      bio,
      linkedInUrl,
      photoUrl,
      selectedObjectives,
      customObjectives,
      selectedAudiences,
      customAudiences,
      selectedIndustries,
      selectedEngagementTypes,
      customEngagementTypes,
      selectedTopics,
      customTopics,
      interactivityLevel,
      functionalAlignment,
      depthCapacity,
      experienceEntries,
      deliveryStructure,
      toolsPlatforms,
      offerFollowUp,
      baseFee,
      priceFlexibility,
      weeklyAvailability,
      travelWillingness,
    ],
  )
  const nextMissing = completion.missingSections[0]
  const remainingCount = completion.missingSections.length
  const strengthTone =
    completion.percent === 100 ? 'complete' : completion.percent < 40 ? 'low' : completion.percent < 80 ? 'medium' : 'high'
  const strengthBannerClass =
    strengthTone === 'low'
      ? 'bg-[#FEE2E2]'
      : strengthTone === 'medium'
        ? 'bg-[#FEF3C7]'
        : strengthTone === 'high'
          ? 'bg-[#ECFDF3]'
          : 'bg-[#DCFCE7]'
  const strengthIconClass =
    strengthTone === 'low'
      ? 'bg-red-500'
      : strengthTone === 'medium'
        ? 'bg-amber-500'
        : 'bg-green-600'
  const strengthTextClass =
    strengthTone === 'low'
      ? 'text-red-600'
      : strengthTone === 'medium'
        ? 'text-amber-700'
        : 'text-green-700'
  const strengthMessage =
    completion.percent === 100
      ? 'Profile complete - you are fully optimized for matching'
      : strengthTone === 'low'
        ? `Limited visibility - complete ${remainingCount} more section${remainingCount > 1 ? 's' : ''} to improve matching`
        : strengthTone === 'medium'
          ? `Good progress - ${remainingCount} section${remainingCount > 1 ? 's are' : ' is'} still pending`
          : `Almost complete - finish ${remainingCount} more section${remainingCount > 1 ? 's' : ''}`

  const handleSaveExperience = async () => {
    if (!canSaveExperience) return
    const entry: ExperienceEntry = {
      title: experienceTitle.trim() || undefined,
      outcome: experienceOutcome.trim() || undefined,
      audience: experienceAudience.trim() || undefined,
      year: experienceYear.trim() || undefined,
    }
    const nextEntries =
      editingExperienceIndex !== null
        ? experienceEntries.map((e, i) => (i === editingExperienceIndex ? entry : e))
        : [...experienceEntries, entry]
    try {
      const res = await updateExpertProfile({ experience: { entries: nextEntries } })
      if (res.success) {
        setExperienceEntries(nextEntries)
        setExperienceTitle('')
        setExperienceOutcome('')
        setExperienceAudience('')
        setExperienceYear('')
        setEditingExperienceIndex(null)
        setShowExperienceForm(false)
        showSaveFeedback('Experience', true)
      } else showSaveFeedback('Experience', false)
    } catch {
      showSaveFeedback('Experience', false)
    }
  }

  const handleEditExperience = (index: number) => {
    const entry = experienceEntries[index]
    if (!entry) return
    setExperienceTitle(entry.title ?? '')
    setExperienceOutcome(entry.outcome ?? '')
    setExperienceAudience(entry.audience ?? '')
    setExperienceYear(entry.year ?? '')
    setEditingExperienceIndex(index)
    setShowExperienceForm(true)
  }

  const handleDeleteExperience = async (index: number) => {
    const nextEntries = experienceEntries.filter((_, i) => i !== index)
    try {
      const res = await updateExpertProfile({ experience: { entries: nextEntries } })
      if (res.success) {
        setExperienceEntries(nextEntries)
        if (editingExperienceIndex === index) {
          setShowExperienceForm(false)
          setEditingExperienceIndex(null)
          setExperienceTitle('')
          setExperienceOutcome('')
          setExperienceAudience('')
          setExperienceYear('')
        } else if (editingExperienceIndex !== null && editingExperienceIndex > index) {
          setEditingExperienceIndex(editingExperienceIndex - 1)
        }
        showSaveFeedback('Experience', true)
      } else showSaveFeedback('Experience', false)
    } catch {
      showSaveFeedback('Experience', false)
    }
  }

  const handleSaveDelivery = async () => {
    try {
      const res = await updateExpertProfile({
        delivery: { structure: deliveryStructure, toolsPlatforms, offerFollowUp },
      })
      if (res.success) showSaveFeedback('Delivery Model', true)
      else showSaveFeedback('Delivery Model', false)
    } catch {
      showSaveFeedback('Delivery Model', false)
    }
  }

  const handleSavePricing = async () => {
    try {
      const res = await updateExpertProfile({
        pricing: { baseFee, priceFlexibility },
      })
      if (res.success) showSaveFeedback('Pricing', true)
      else showSaveFeedback('Pricing', false)
    } catch {
      showSaveFeedback('Pricing', false)
    }
  }

  const handleSaveAvailability = async () => {
    try {
      const res = await updateExpertProfile({
        availability: { weeklyAvailability, travelWillingness },
      })
      if (res.success) showSaveFeedback('Availability', true)
      else showSaveFeedback('Availability', false)
    } catch {
      showSaveFeedback('Availability', false)
    }
  }

  return (
    <DashboardLayout
      sidebarItems={expertSidebarItems}
      sidebarBottomItems={expertSidebarBottomItems}
      userTypeLabel="Expert"
      userDisplayName={displayName}
      userSubLabel="Expert"
      accentColor="green"
      mainClassName="pl-5 pr-6"
    >
      <div className="max-w-3xl mx-auto pb-10" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="pt-2 pb-6">
          <h1 className="text-2xl font-bold text-gray-900">Expert Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete your profile to get better matches</p>
        </div>

        {profileLoading && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
            Loading profile…
          </div>
        )}
        {profileError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {profileError}
          </div>
        )}
        {/* Toast: fixed position so user sees it without scrolling */}
        {saveMessage && (
          <div
            role="alert"
            className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm font-medium shadow-lg transition-opacity ${
              saveMessage.ok
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {saveMessage.ok ? (
              <>Saved {saveMessage.section} successfully.</>
            ) : (
              <>Could not save {saveMessage.section}. Please try again.</>
            )}
          </div>
        )}

        {!profileLoading && !profileError && (
        <>
        {/* Profile Strength */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Profile Strength</h2>
              <p className="text-sm text-gray-500 mt-0.5">Complete all sections to maximize your opportunities</p>
            </div>
            <span className="text-lg font-semibold shrink-0" style={{ color: ACCENT }}>
              {completion.percent}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-gray-700" style={{ width: `${completion.percent}%` }} />
          </div>
          <div className={`mt-4 rounded-lg px-4 py-3 flex items-start gap-3 ${strengthBannerClass}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold ${strengthIconClass}`}>
              {completion.percent === 100 ? '✓' : '!'}
            </span>
            <p className={`text-sm font-medium ${strengthTextClass}`}>{strengthMessage}</p>
          </div>
        </div>

        {/* AI Suggestions: icon column | text column (body + CTA align with title, not under icon) */}
        <div
          className="mb-6 w-full rounded-xl border px-5 py-5 sm:px-6 sm:py-6"
          style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex shrink-0 items-start justify-center pt-0.5">
              <AiSuggestionsSparkleMark />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold leading-tight text-[#1e3a5f]">AI Suggestions</h2>
              <p className="mt-2 text-sm font-normal leading-relaxed text-[#64748b]">
                {nextMissing
                  ? `Complete "${EXPERT_SECTION_LABELS[nextMissing]}" section next to improve profile strength`
                  : 'Great work - all profile sections are complete'}
              </p>
              <button
                type="button"
                className="mt-4 rounded-md border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-bold text-[#1e293b] shadow-sm transition-colors duration-200 hover:border-[#0084A3] hover:bg-[#0084A3] hover:text-white sm:mt-5"
              >
                Improve Profile with AI
              </button>
            </div>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedId === section.id
            return (
              <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/50"
                  onClick={() => toggle(section.id)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#0084A3]">
                    <Icon />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {section.weight} weight
                      </span>
                      {section.locked && (
                        <span className="text-gray-500">
                          <IconLock />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{section.summary}</p>
                  </div>
                  <span className="text-gray-500 shrink-0">
                    {isExpanded ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                  </span>
                </button>

                {section.id === 'identity' && isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/30">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Professional Bio</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell businesses about your expertise and approach..."
                          rows={4}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">LinkedIn URL</label>
                        <input
                          type="url"
                          value={linkedInUrl}
                          onChange={(e) => setLinkedInUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Profile Photo URL</label>
                        <input
                          type="url"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveIdentity}
                        className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: ACCENT }}
                      >
                        Save Identity
                      </button>
                    </div>
                  </div>
                )}

                {section.id === 'capability' && isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/30">
                    <div className="space-y-6">
                      {/* Objectives You Support */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Objectives You Support</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {[...DEFAULT_OBJECTIVES, ...customObjectives].map((label) => {
                            const isActive = selectedObjectives.includes(label)
                            const isCustom = !DEFAULT_OBJECTIVES.includes(label)
                            return (
                              <button
                                key={label}
                                type="button"
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                                  isActive
                                    ? isCustom
                                      ? 'border-[#8B5CF6] bg-[#8B5CF6] text-white'
                                      : 'text-white'
                                    : 'border-gray-200 bg-white text-gray-800'
                                }`}
                                style={isActive && !isCustom ? { borderColor: SELECTED_TEAL, backgroundColor: SELECTED_TEAL } : undefined}
                                onClick={() => {
                                  const isDefault = DEFAULT_OBJECTIVES.includes(label)
                                  const wasSelected = selectedObjectives.includes(label)
                                  setSelectedObjectives((prev) =>
                                    prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label],
                                  )
                                  // Custom entries: removing selection drops them from the list; defaults stay available.
                                  if (!isDefault && wasSelected) {
                                    setCustomObjectives((prev) => prev.filter((v) => v !== label))
                                  }
                                }}
                              >
                                <span>{label}</span>
                                {isActive && <span className="text-xs">×</span>}
                              </button>
                            )
                          })}
                        </div>
                        <div className="mt-3 rounded-xl bg-gray-100 p-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">Add Custom Objective (Not in List Above)</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g., Branding, Marketing..."
                              value={customObjectiveInput}
                              onChange={(e) => setCustomObjectiveInput(e.target.value)}
                              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                            />
                            <button
                              type="button"
                              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg font-semibold text-white"
                              style={{ backgroundColor: SELECTED_TEAL }}
                              onClick={() => {
                                const value = customObjectiveInput.trim()
                                if (!value) return
                                if (!customObjectives.includes(value)) setCustomObjectives((prev) => [...prev, value])
                                setSelectedObjectives((prev) => (prev.includes(value) ? prev : [...prev, value]))
                                setCustomObjectiveInput('')
                              }}
                              aria-label="Add custom objective"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Target Audiences */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Target Audiences</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {[...DEFAULT_AUDIENCES, ...customAudiences].map((label) => {
                            const isActive = selectedAudiences.includes(label)
                            const isCustom = !DEFAULT_AUDIENCES.includes(label)
                            return (
                              <button
                                key={label}
                                type="button"
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                                  isActive
                                    ? isCustom
                                      ? 'border-[#8B5CF6] bg-[#8B5CF6] text-white'
                                      : 'text-white'
                                    : 'border-gray-200 bg-white text-gray-800'
                                }`}
                                style={isActive && !isCustom ? { borderColor: SELECTED_TEAL, backgroundColor: SELECTED_TEAL } : undefined}
                                onClick={() => {
                                  const isDefault = DEFAULT_AUDIENCES.includes(label)
                                  const wasSelected = selectedAudiences.includes(label)
                                  setSelectedAudiences((prev) =>
                                    prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label],
                                  )
                                  if (!isDefault && wasSelected) {
                                    setCustomAudiences((prev) => prev.filter((v) => v !== label))
                                  }
                                }}
                              >
                                <span>{label}</span>
                                {isActive && <span className="text-xs">×</span>}
                              </button>
                            )
                          })}
                        </div>
                        <div className="mt-3 rounded-xl bg-gray-100 p-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">Add Custom Audience (Not in List Above)</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g., Board Members, Volunteers..."
                              value={customAudienceInput}
                              onChange={(e) => setCustomAudienceInput(e.target.value)}
                              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                            />
                            <button
                              type="button"
                              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg font-semibold text-white"
                              style={{ backgroundColor: SELECTED_TEAL }}
                              onClick={() => {
                                const value = customAudienceInput.trim()
                                if (!value) return
                                if (!customAudiences.includes(value)) setCustomAudiences((prev) => [...prev, value])
                                setSelectedAudiences((prev) => (prev.includes(value) ? prev : [...prev, value]))
                                setCustomAudienceInput('')
                              }}
                              aria-label="Add custom audience"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Industries */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Industries</h4>
                        <div className="flex flex-wrap gap-2">
                          {DEFAULT_INDUSTRIES.map((label) => {
                            const isActive = selectedIndustries.includes(label)
                            return (
                              <button
                                key={label}
                                type="button"
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                                  isActive
                                    ? 'text-white'
                                    : 'border-gray-200 bg-white text-gray-800'
                                }`}
                                style={isActive ? { borderColor: SELECTED_TEAL, backgroundColor: SELECTED_TEAL } : undefined}
                                onClick={() => {
                                  setSelectedIndustries((prev) =>
                                    prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label],
                                  )
                                }}
                              >
                                <span>{label}</span>
                                {isActive && <span className="text-xs">×</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Engagement Types You Offer — cards for defaults, violet chips for custom */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Engagement Types You Offer</h4>
                        <p className="text-xs text-gray-500 mb-3">
                          Select the types of engagements you&apos;re open to delivering
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {DEFAULT_ENGAGEMENT_TYPES.map((item) => {
                            const isSelected = selectedEngagementTypes.includes(item.title)
                            return (
                              <button
                                key={item.title}
                                type="button"
                                className="flex flex-col items-start rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-gray-300"
                                style={{
                                  borderColor: isSelected ? SELECTED_TEAL : undefined,
                                  boxShadow: isSelected ? `0 0 0 1px ${SELECTED_TEAL}` : undefined,
                                  backgroundColor: isSelected ? '#f0fdf9' : undefined,
                                }}
                                onClick={() => {
                                  setSelectedEngagementTypes((prev) =>
                                    prev.includes(item.title) ? prev.filter((v) => v !== item.title) : [...prev, item.title],
                                  )
                                }}
                              >
                                <span className="pr-6 text-sm font-semibold text-gray-900">{item.title}</span>
                                <span className="mt-1.5 text-xs leading-snug">
                                  <span className={ENGAGEMENT_INTENSITY_STYLE(item.intensity)}>{item.intensity}</span>
                                  <span className="mx-1.5 text-gray-300">·</span>
                                  <span className={ENGAGEMENT_OUTCOME_STYLE(item.outcome)}>{item.outcome}</span>
                                </span>
                              </button>
                            )
                          })}
                        </div>

                        {customEngagementTypes.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {customEngagementTypes.map((label) => {
                              const isActive = selectedEngagementTypes.includes(label)
                              return (
                                <button
                                  key={label}
                                  type="button"
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition ${
                                    isActive ? 'text-white' : 'border-[#7C3AED] bg-white text-[#7C3AED]'
                                  }`}
                                  style={
                                    isActive
                                      ? { borderColor: CUSTOM_ENGAGEMENT_VIOLET, backgroundColor: CUSTOM_ENGAGEMENT_VIOLET }
                                      : undefined
                                  }
                                  onClick={() => {
                                    const wasSelected = selectedEngagementTypes.includes(label)
                                    setSelectedEngagementTypes((prev) =>
                                      prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label],
                                    )
                                    if (wasSelected) {
                                      setCustomEngagementTypes((prev) => prev.filter((v) => v !== label))
                                    }
                                  }}
                                >
                                  <span>{label}</span>
                                  {isActive && <span className="text-base font-normal leading-none">×</span>}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        <div className="mt-4 rounded-xl bg-[#F3F4F6] p-4">
                          <p className="text-sm font-medium text-gray-600 mb-3">
                            Add Custom Engagement Type (Not in list above)
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g., Company Retreat, Board Advisory..."
                              value={customEngagementInput}
                              onChange={(e) => setCustomEngagementInput(e.target.value)}
                              className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                            />
                            <button
                              type="button"
                              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg font-semibold text-white shadow-sm"
                              style={{ backgroundColor: SELECTED_TEAL }}
                              aria-label="Add custom engagement type"
                              onClick={() => {
                                const value = customEngagementInput.trim()
                                if (!value) return
                                const defaultTitles = new Set(DEFAULT_ENGAGEMENT_TYPES.map((e) => e.title))
                                if (defaultTitles.has(value)) return
                                if (!customEngagementTypes.includes(value)) setCustomEngagementTypes((prev) => [...prev, value])
                                setSelectedEngagementTypes((prev) => (prev.includes(value) ? prev : [...prev, value]))
                                setCustomEngagementInput('')
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Interactivity Level - black fill and pointer up to selected level */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">Interactivity Level</h4>
                          <span className="text-xs font-medium text-gray-600">{interactivityLevel}% Interactive</span>
                        </div>
                        <div className="relative mt-1 h-3 w-full rounded-full bg-gray-200">
                          <div
                            className="absolute left-0 top-0 h-full rounded-l-full bg-gray-900"
                            style={{ width: `${interactivityLevel}%` }}
                          />
                          <div
                            className="absolute top-1/2 z-10 h-4 w-4 rounded-full border-2 border-white bg-gray-900 shadow pointer-events-none"
                            style={{ left: `${interactivityLevel}%`, transform: 'translate(-50%, -50%)' }}
                          />
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={interactivityLevel}
                            onChange={(e) => setInteractivityLevel(Number(e.target.value))}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            aria-label="Interactivity level"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                          <span>Lecture-based</span>
                          <span>Highly Interactive</span>
                        </div>
                      </div>

                      {/* Functional Profile Alignment */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Functional Profile Alignment</h4>
                        <p className="text-xs text-gray-500 mb-3">
                          Rate yourself on these dimensions (1-5 scale)
                        </p>
                        {[
                          { key: 'technicalOrientation', title: 'Technical Orientation', helper: 'How technical is your content? (1 = Non-technical, 5 = Highly technical)' },
                          { key: 'businessOrientation', title: 'Business Orientation', helper: 'How business-focused is your content? (1 = Conceptual, 5 = Business outcomes)' },
                          { key: 'toolUsageMaturity', title: 'Tool Usage Maturity', helper: 'How advanced are the tools you use? (1 = Basic, 5 = Advanced platforms)' },
                          { key: 'processOrientation', title: 'Process Orientation', helper: 'How structured is your approach? (1 = Flexible, 5 = Highly structured)' },
                        ].map((row) => {
                          const value = functionalAlignment[row.key] ?? 3
                          return (
                            <div key={row.key} className="flex flex-col gap-1.5 mb-3">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{row.title}</p>
                                  <p className="text-xs text-gray-500">{row.helper}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {[1, 2, 3, 4, 5].map((n) => {
                                    const active = n === value
                                    return (
                                      <button
                                        key={n}
                                        type="button"
                                        onClick={() => setAlignment(row.key, n)}
                                        className={`h-8 w-8 rounded-md border text-xs font-semibold ${
                                          active
                                            ? 'text-white'
                                            : 'border-gray-200 bg-white text-gray-700'
                                        }`}
                                        style={active ? { borderColor: SELECTED_TEAL, backgroundColor: SELECTED_TEAL } : undefined}
                                      >
                                        {n}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Depth Capacity */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Depth Capacity</h4>
                        <p className="text-xs text-gray-500 mb-3">How deep can you go in your topics?</p>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                          {[
                            { value: 1, label: '1', sub: 'Awareness' },
                            { value: 2, label: '2', sub: 'Basic' },
                            { value: 3, label: '3', sub: 'Intermediate' },
                            { value: 4, label: '4', sub: 'Advanced' },
                            { value: 5, label: '5', sub: 'Expert' },
                          ].map((item) => {
                            const active = depthCapacity === item.value
                            return (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => setDepthCapacity(item.value)}
                                className={`flex flex-col items-center justify-center rounded-lg border px-2 py-3 text-sm font-medium ${
                                  active
                                    ? 'border-[#0084A3] bg-white text-gray-900'
                                    : 'border-gray-200 bg-white text-gray-800'
                                }`}
                              >
                                <span>{item.label}</span>
                                <span className="mt-0.5 text-[11px] text-gray-500">{item.sub}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Topics & Fields */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Topics &amp; Fields</h4>
                        <p className="text-xs text-gray-500 mb-3">Select all topics you specialize in</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {[...DEFAULT_TOPICS, ...customTopics].map((label) => {
                            const isActive = selectedTopics.includes(label)
                            const isCustom = !DEFAULT_TOPICS.includes(label)
                            return (
                              <button
                                key={label}
                                type="button"
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                                  isActive
                                    ? isCustom
                                      ? 'border-[#8B5CF6] bg-[#8B5CF6] text-white'
                                      : 'text-white'
                                    : 'border-gray-200 bg-white text-gray-800'
                                }`}
                                style={isActive && !isCustom ? { borderColor: SELECTED_TEAL, backgroundColor: SELECTED_TEAL } : undefined}
                                onClick={() => {
                                  const isDefault = DEFAULT_TOPICS.includes(label)
                                  const wasSelected = selectedTopics.includes(label)
                                  setSelectedTopics((prev) =>
                                    prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label],
                                  )
                                  if (!isDefault && wasSelected) {
                                    setCustomTopics((prev) => prev.filter((v) => v !== label))
                                  }
                                }}
                              >
                                <span>{label}</span>
                                {isActive && <span className="text-xs">×</span>}
                              </button>
                            )
                          })}
                        </div>
                        <div className="mt-3 rounded-xl bg-gray-100 p-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">Add Custom Topic (Not in list above)</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g., Blockchain, UX Design..."
                              value={customTopicInput}
                              onChange={(e) => setCustomTopicInput(e.target.value)}
                              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                            />
                            <button
                              type="button"
                              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-lg font-semibold text-white"
                              style={{ backgroundColor: SELECTED_TEAL }}
                              onClick={() => {
                                const value = customTopicInput.trim()
                                if (!value) return
                                if (!customTopics.includes(value)) setCustomTopics((prev) => [...prev, value])
                                setSelectedTopics((prev) => (prev.includes(value) ? prev : [...prev, value]))
                                setCustomTopicInput('')
                              }}
                              aria-label="Add custom topic"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveCapability}
                          className="mt-5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                          style={{ backgroundColor: SELECTED_TEAL }}
                        >
                          Save Capability
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {section.id === 'experience' && isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/30">
                    {/* List of saved experiences */}
                    {experienceEntries.length > 0 && (
                      <div className="mb-5">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Saved experiences</h4>
                        <ul className="space-y-3">
                          {experienceEntries.map((entry, index) => (
                            <li
                              key={`${entry.title}-${index}`}
                              className="rounded-xl border border-gray-200 bg-white p-4"
                            >
                              <p className="text-sm font-semibold text-gray-900">
                                {entry.title || 'Untitled engagement'}
                              </p>
                              {entry.outcome && (
                                <p className="mt-1 text-xs text-gray-600">
                                  <span className="font-medium text-gray-500">Outcome: </span>
                                  {entry.outcome}
                                </p>
                              )}
                              {(entry.audience || entry.year) && (
                                <p className="mt-0.5 text-xs text-gray-500">
                                  {[entry.audience, entry.year].filter(Boolean).join(' · ')}
                                </p>
                              )}
                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditExperience(index)}
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExperience(index)}
                                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">Add your past engagements</p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: '#0F172A' }}
                        onClick={() => {
                          setEditingExperienceIndex(null)
                          setExperienceTitle('')
                          setExperienceOutcome('')
                          setExperienceAudience('')
                          setExperienceYear('')
                          setShowExperienceForm(true)
                        }}
                      >
                        <span className="text-lg leading-none">+</span>
                        Add Experience
                      </button>
                    </div>

                    {showExperienceForm && (
                      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-base font-semibold text-gray-900">
                            {editingExperienceIndex !== null
                              ? `Edit Experience #${editingExperienceIndex + 1}`
                              : `Experience #${experienceEntries.length + 1}`}
                          </h4>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            onClick={() => {
                              setShowExperienceForm(false)
                              setEditingExperienceIndex(null)
                              setExperienceTitle('')
                              setExperienceOutcome('')
                              setExperienceAudience('')
                              setExperienceYear('')
                            }}
                            aria-label="Close experience form"
                          >
                            ×
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                            <label htmlFor="experience-title" className="w-full text-sm font-medium text-gray-700 md:w-44">
                              Engagement title
                            </label>
                            <input
                              id="experience-title"
                              type="text"
                              value={experienceTitle}
                              onChange={(e) => setExperienceTitle(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                            />
                          </div>
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                            <label htmlFor="experience-outcome" className="w-full text-sm font-medium text-gray-700 md:w-44">
                              Outcome achieved
                            </label>
                            <input
                              id="experience-outcome"
                              type="text"
                              value={experienceOutcome}
                              onChange={(e) => setExperienceOutcome(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                            />
                          </div>
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                            <label htmlFor="experience-audience" className="w-full text-sm font-medium text-gray-700 md:w-44">
                              Audience type
                            </label>
                            <input
                              id="experience-audience"
                              type="text"
                              value={experienceAudience}
                              onChange={(e) => setExperienceAudience(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                            />
                          </div>
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                            <label htmlFor="experience-year" className="w-full text-sm font-medium text-gray-700 md:w-44">
                              Year
                            </label>
                            <input
                              id="experience-year"
                              type="text"
                              value={experienceYear}
                              onChange={(e) => setExperienceYear(e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveExperience}
                          disabled={!canSaveExperience}
                          className={`mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
                            canSaveExperience
                              ? ''
                              : 'cursor-not-allowed opacity-50'
                          }`}
                          style={{ backgroundColor: canSaveExperience ? SELECTED_TEAL : '#9CA3AF' }}
                        >
                          Save Experience
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {section.id === 'delivery' && isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/30">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Delivery Structure</label>
                        <textarea
                          value={deliveryStructure}
                          onChange={(e) => setDeliveryStructure(e.target.value)}
                          placeholder="Describe your typical session structure..."
                          rows={4}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Tools &amp; Platforms You Use</label>
                        <input
                          type="text"
                          value={toolsPlatforms}
                          onChange={(e) => setToolsPlatforms(e.target.value)}
                          placeholder="e.g., Zoom, Miro, Google Workspace"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
                          <input
                            type="checkbox"
                            checked={offerFollowUp}
                            onChange={(e) => setOfferFollowUp(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span>I offer follow-up sessions</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleSaveDelivery}
                          className="mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                          style={{ backgroundColor: SELECTED_TEAL }}
                        >
                          Save Delivery Model
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {section.id === 'pricing' && isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/30">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Base Fee (₹)</label>
                        <input
                          type="number"
                          value={baseFee}
                          onChange={(e) => setBaseFee(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Price Flexibility</label>
                        <select
                          value={priceFlexibility}
                          onChange={(e) => setPriceFlexibility(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                        >
                          <option>Fixed - No negotiation</option>
                          <option>Moderate - Some flexibility</option>
                          <option>Flexible - Open to discussion</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleSavePricing}
                        className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: SELECTED_TEAL }}
                      >
                        Save Pricing
                      </button>
                    </div>
                  </div>
                )}

                {section.id === 'availability' && isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/30">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Weekly Availability</label>
                        <input
                          type="text"
                          value={weeklyAvailability}
                          onChange={(e) => setWeeklyAvailability(e.target.value)}
                          placeholder="e.g., 2-3 days per week"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">Travel Willingness</label>
                        <select
                          value={travelWillingness}
                          onChange={(e) => setTravelWillingness(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0084A3]/20 focus:border-[#0084A3]"
                        >
                          <option>Select travel willingness</option>
                          <option>No travel - Online only</option>
                          <option>Local city only</option>
                          <option>National travel</option>
                          <option>International travel</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveAvailability}
                        className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: SELECTED_TEAL }}
                      >
                        Save Availability
                      </button>
                    </div>
                  </div>
                )}

                {section.id !== 'identity' &&
                  section.id !== 'capability' &&
                  section.id !== 'experience' &&
                  section.id !== 'delivery' &&
                  section.id !== 'pricing' &&
                  section.id !== 'availability' &&
                  isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/30">
                      <p className="text-sm text-gray-500">Section content coming soon.</p>
                    </div>
                  )}
              </div>
            )
          })}
        </div>
        </>
        )}
      </div>
    </DashboardLayout>
  )
}

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarBottomItems, expertSidebarItems } from '../../config/expertNav'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import { getOpportunities, type OpportunityItem } from '../../api/expertOpportunities'
import { IconCalendar, IconClock, IconDollar, IconMapPin, IconTarget, IconUsers } from '../../components/layout/DashboardIcons'

const TEAL = '#008C9E'

type DetailVM = {
  id: string
  title: string
  company: string
  postedText: string
  location: string
  matchScore: number
  budget: string
  duration: string
  format: string
  objective: string
  targetAudience: string
  depthApproach: string
  keyOutcomes: string[]
  deliverables: string[]
  keyChallenges: string
  companyContext: string
  timeline: string
  budgetType: string
  companySize: string
  companyIndustry: string
}

const FALLBACK: DetailVM = {
  id: 'demo',
  title: 'AI Training for Sales Team',
  company: 'TechCorp India',
  postedText: 'Posted 2 days ago',
  location: 'Bangalore, India',
  matchScore: 94,
  budget: '₹1,50,000 - ₹2,50,000',
  duration: '2 full days (16 hours total)',
  format: 'In-person',
  objective: 'Build AI capability in sales team to improve productivity and efficiency in prospecting, research, and customer communication',
  targetAudience: 'Sales team of 25 people, mixed experience levels (junior to senior), currently using basic CRM tools',
  depthApproach: 'Intermediate level - team has basic tech literacy but no AI experience. Need practical, hands-on training with real sales scenarios',
  keyOutcomes: [
    'Sales team can effectively use ChatGPT and AI tools for prospecting',
    'Reduce time spent on email drafting by 40%',
    'Improve research efficiency and lead qualification',
    'Build sustainable AI adoption practices',
  ],
  deliverables: [
    'Hands-on training materials',
    'Custom AI prompts library for sales',
    'Post-training support documentation',
    'Certificate of completion',
  ],
  keyChallenges: 'Team is skeptical about AI replacing their skills. Need to emphasize AI as a productivity tool, not replacement.',
  companyContext: 'Fast-growing SaaS company, recently raised Series A funding, expanding sales team rapidly',
  timeline: 'Within next 6 weeks',
  budgetType: 'Fixed fee per engagement',
  companySize: '50-200 employees',
  companyIndustry: 'Technology',
}

function toTitleCase(text: string): string {
  return text.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function toDateLabel(raw: string): string {
  if (!raw || !raw.match(/^\d{4}-\d{2}-\d{2}/)) return ''
  const [y, m, d] = raw.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function agoText(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime()
  const mins = Math.max(1, Math.floor(ms / 60000))
  if (mins < 60) return `Posted ${mins} mins ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Posted ${hrs} hours ago`
  const days = Math.floor(hrs / 24)
  return `Posted ${days} day${days > 1 ? 's' : ''} ago`
}

function firstNonEmpty(fd: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = fd[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function arrayFrom(fd: Record<string, unknown>, key: string): string[] {
  const value = fd[key]
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0) : []
}

function mapOpportunityToVM(item: OpportunityItem): DetailVM {
  const fd = (item.formData || {}) as Record<string, unknown>
  const minBudget = typeof fd.minBudget === 'number' ? fd.minBudget : 0
  const maxBudget = typeof fd.maxBudget === 'number' ? fd.maxBudget : 0
  const engagementType = firstNonEmpty(fd, ['engagementTypeSelected'])
  const durationMinutes = Number(firstNonEmpty(fd, ['totalDurationMinutes'])) || 0
  const sessions = Number(firstNonEmpty(fd, ['totalSessions'])) || 0
  const deliveryMode = firstNonEmpty(fd, ['deliveryModeSelected'])
  const city = firstNonEmpty(fd, ['city'])
  const stateRegion = firstNonEmpty(fd, ['stateRegion', 'state'])
  const country = firstNonEmpty(fd, ['country'])
  const start = firstNonEmpty(fd, ['preferredStartDate'])
  const end = firstNonEmpty(fd, ['preferredEndDate'])
  const selectedOutcome = firstNonEmpty(fd, ['selectedOutcome'])
  const audience = arrayFrom(fd, 'audienceSelected')
  const deliverables = arrayFrom(fd, 'deliverablesSelected').map(toTitleCase)
  const keyOutcomes = arrayFrom(fd, 'secondarySelected').map(toTitleCase)

  const hours = durationMinutes >= 60 ? `${Math.round(durationMinutes / 60)} hours` : durationMinutes > 0 ? `${durationMinutes} mins` : ''
  const sessionPart = sessions > 1 ? `${sessions} sessions` : sessions === 1 ? '1 session' : ''
  const duration = [sessionPart, hours].filter(Boolean).join(' (') + (sessionPart && hours ? ')' : '') || 'As per requirement'

  let budget = 'Budget on discussion'
  if (minBudget > 0 || maxBudget > 0) {
    budget = `₹${minBudget.toLocaleString('en-IN')} - ₹${maxBudget.toLocaleString('en-IN')}`
  }

  const location = [city, stateRegion, country].filter(Boolean).join(', ') || 'Location flexible'
  const timeline =
    [toDateLabel(start), toDateLabel(end)].filter(Boolean).join(' - ') ||
    firstNonEmpty(fd, ['urgencyLevel']) ||
    'As discussed with business'

  const objective = selectedOutcome ? toTitleCase(selectedOutcome) : 'Business requirement'
  const audienceText = audience.length > 0 ? audience.join(', ') : 'Audience details shared during discussion'
  const depth = `Level ${firstNonEmpty(fd, ['engagementDepth']) || '3'} depth with ${
    firstNonEmpty(fd, ['interactivityLevel']) || '50'
  }% interactivity`

  return {
    id: item.id,
    title: objective === 'Business Requirement' ? 'Expert Requirement' : objective,
    company: item.companyName || 'Company',
    postedText: agoText(item.createdAt),
    location,
    matchScore: 94,
    budget,
    duration,
    format: deliveryMode ? toTitleCase(deliveryMode) : 'Flexible',
    objective: firstNonEmpty(fd, ['successMetrics']) || objective,
    targetAudience: audienceText,
    depthApproach: depth,
    keyOutcomes: keyOutcomes.length > 0 ? keyOutcomes : FALLBACK.keyOutcomes,
    deliverables: deliverables.length > 0 ? deliverables : FALLBACK.deliverables,
    keyChallenges: firstNonEmpty(fd, ['schedulingRestrictions', 'blackoutDates']) || FALLBACK.keyChallenges,
    companyContext: firstNonEmpty(fd, ['venueDetails']) || FALLBACK.companyContext,
    timeline,
    budgetType: firstNonEmpty(fd, ['budgetType']) || 'Fixed fee per engagement',
    companySize: firstNonEmpty(fd, ['companySize']) || FALLBACK.companySize,
    companyIndustry: firstNonEmpty(fd, ['industry']) || FALLBACK.companyIndustry,
  }
}

function MetricCard({ title, text, score }: { title: string; text: string; score: number }) {
  return (
    <div className="rounded-xl border border-[#E6EDF3] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-none text-[#0F172A]">{title}</h3>
        <span className="rounded-md border border-[#BDE7DF] bg-[#EAF8F5] px-2 py-0.5 text-xs font-semibold text-[#007A8C]">
          {score}%
        </span>
      </div>
      <p className="mt-3 text-sm text-[#64748B]">{text}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E8EEF3]">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: TEAL }} />
      </div>
    </div>
  )
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[#E6EDF3] bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F7F4] text-[#008C9E]">
          {icon}
        </span>
        <h3 className="text-lg font-bold leading-none text-[#0F172A]">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function ExpertOpportunityDetail() {
  const { opportunityId } = useParams<{ opportunityId: string }>()
  const location = useLocation()
  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe' : 'John Doe')

  const [loading, setLoading] = useState(true)
  const [vm, setVm] = useState<DetailVM | null>(null)

  useEffect(() => {
    let cancelled = false
    getOpportunities({ limit: 200, skip: 0 })
      .then((res) => {
        if (!cancelled && res.success) {
          const found = (res.data || []).find((item) => item.id === opportunityId)
          if (found) setVm(mapOpportunityToVM(found))
        }
      })
      .catch(() => {
        // fallback below
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [opportunityId])

  const detail = useMemo(() => {
    if (vm) return vm
    const stateTitle = (location.state as { title?: string; company?: string } | null)?.title
    const stateCompany = (location.state as { title?: string; company?: string } | null)?.company
    if (stateTitle || stateCompany) {
      return { ...FALLBACK, id: opportunityId || FALLBACK.id, title: stateTitle || FALLBACK.title, company: stateCompany || FALLBACK.company }
    }
    return { ...FALLBACK, id: opportunityId || FALLBACK.id }
  }, [location.state, opportunityId, vm])

  const fitCards = [
    { title: 'Expertise Match', text: `Your ${detail.title.toLowerCase()} experience is a perfect match`, score: 98 },
    { title: 'Format Preference', text: `You’ve indicated strong preference for ${detail.format.toLowerCase()} workshops`, score: 95 },
    { title: 'Industry Experience', text: `You have 5+ similar engagements in ${detail.companyIndustry.toLowerCase()} sector`, score: 92 },
    { title: 'Availability', text: 'Your calendar shows availability in their requested timeline', score: 90 },
  ]

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
      <div className="mx-auto max-w-6xl pb-8 rounded-2xl bg-[#F8FAFC] p-4 sm:p-5">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">Loading opportunity…</div>
        ) : (
          <>
            <div className="rounded-2xl border border-[#E6EDF3] bg-gray-100 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to="/expert/browse" className="mb-2 inline-flex items-center text-sm text-[#334155] no-underline hover:underline">
                    ← Back
                  </Link>
                  <h1 className="text-2xl font-bold text-[#0F172A]">{detail.title}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                      </svg>
                      {detail.company}
                    </span>
                    <span className="inline-flex items-center gap-1"><IconMapPin className="h-4 w-4" />{detail.location}</span>
                    <span className="inline-flex items-center gap-1"><IconClock className="h-4 w-4" />{detail.postedText}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium leading-none text-[#94A3B8]">Match Score</p>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <p className="text-3xl font-bold leading-none text-[#008C9E]">{detail.matchScore}%</p>
                    <span className="rounded-md bg-[#E7F9EF] px-2 py-1 text-xs font-semibold leading-none text-[#1F9D57]">
                      Excellent Fit
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-[#E6EDF3] bg-white p-4 md:grid-cols-3 lg:grid-cols-5">
                <div>
                  <p className="text-xs text-[#64748B]">Budget Range</p>
                  <p className="mt-1 text-base font-semibold text-[#0F172A]">{detail.budget}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Duration</p>
                  <p className="mt-1 text-base font-semibold text-[#0F172A]">{detail.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Format</p>
                  <p className="mt-1 text-base font-semibold text-[#0F172A]">{detail.format}</p>
                </div>
                <div className="lg:col-span-2 flex items-center justify-end gap-2">
                  <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#BDE7DF] bg-white px-4 py-2 text-sm font-semibold text-[#0F172A]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Check Availability
                  </button>
                  <Link to={`/expert/browse/${detail.id}/propose`} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white no-underline" style={{ backgroundColor: TEAL }}>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                    </svg>
                    Submit Proposal
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E6EDF3] bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F7F4] text-[#008C9E]">↗</span>
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">Why This is a Great Fit</h2>
                  <p className="text-sm text-[#64748B]">AI-powered analysis of your match with this opportunity</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {fitCards.map((card) => (
                  <MetricCard key={card.title} title={card.title} text={card.text} score={card.score} />
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr]">
              <div className="space-y-5">
                <SectionCard title="Objective" icon={<IconTarget className="h-5 w-5" />}>
                  <p className="text-sm leading-relaxed text-[#475569]">{detail.objective}</p>
                </SectionCard>
                <SectionCard title="Target Audience" icon={<IconUsers className="h-5 w-5" />}>
                  <p className="text-sm leading-relaxed text-[#475569]">{detail.targetAudience}</p>
                </SectionCard>
                <SectionCard title="Depth & Approach" icon={<IconTarget className="h-5 w-5" />}>
                  <p className="text-sm leading-relaxed text-[#475569]">{detail.depthApproach}</p>
                </SectionCard>
                <SectionCard title="Key Outcomes Expected" icon={<IconTarget className="h-5 w-5" />}>
                  <ul className="space-y-3">
                    {detail.keyOutcomes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-[#475569]">
                        <span className="mt-1 text-[#008C9E]">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
                <SectionCard
                  title="Expected Deliverables"
                  icon={
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2z" />
                      <path d="M9 8h6" />
                    </svg>
                  }
                >
                  <ul className="space-y-3 pl-1">
                    {detail.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-[#475569]">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#008C9E]">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
                <SectionCard title="Additional Context" icon={<IconTarget className="h-5 w-5" />}>
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">Key Challenges</p>
                      <p className="mt-1 text-sm text-[#475569]">{detail.keyChallenges}</p>
                    </div>
                    <div className="h-px bg-[#E6EDF3]" />
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">Company Context</p>
                      <p className="mt-1 text-sm text-[#475569]">{detail.companyContext}</p>
                    </div>
                  </div>
                </SectionCard>
              </div>

              <div className="space-y-5">
                <SectionCard title="Logistics" icon={<IconCalendar className="h-5 w-5" />}>
                  <div className="space-y-4 text-[#0F172A]">
                    <div><p className="text-sm text-[#64748B]">Format</p><p className="text-base font-semibold">{detail.format}</p></div>
                    <div className="h-px bg-[#E6EDF3]" />
                    <div><p className="text-sm text-[#64748B]">Duration</p><p className="text-base font-semibold">{detail.duration}</p></div>
                    <div className="h-px bg-[#E6EDF3]" />
                    <div><p className="text-sm text-[#64748B]">Timeline</p><p className="text-base font-semibold">{detail.timeline}</p></div>
                    <div className="h-px bg-[#E6EDF3]" />
                    <div><p className="text-sm text-[#64748B]">Location</p><p className="text-base font-semibold">{detail.location}</p></div>
                  </div>
                </SectionCard>
                <SectionCard title="Commercial" icon={<IconDollar className="h-5 w-5" />}>
                  <div className="space-y-4 text-[#0F172A]">
                    <div><p className="text-sm text-[#64748B]">Budget Range</p><p className="text-xl font-bold text-[#008C9E]">{detail.budget}</p></div>
                    <div className="h-px bg-[#E6EDF3]" />
                    <div><p className="text-sm text-[#64748B]">Budget Type</p><p className="text-base font-semibold">{detail.budgetType}</p></div>
                  </div>
                </SectionCard>
                <SectionCard
                  title="About Company"
                  icon={
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="2.5" y="7.5" width="19" height="12" rx="2" />
                      <path d="M9 7.5v-1a3 3 0 0 1 6 0v1" />
                      <path d="M2.5 12.5h19" />
                    </svg>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0F172A] text-sm font-semibold text-white">
                        {detail.company.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-[#0F172A]">{detail.company}</p>
                        <p className="text-sm text-[#64748B]">{detail.companyIndustry}</p>
                      </div>
                    </div>
                    <div className="h-px bg-[#E6EDF3]" />
                    <div><p className="text-sm text-[#64748B]">Company Size</p><p className="text-base font-semibold text-[#0F172A]">{detail.companySize}</p></div>
                    <div className="h-px bg-[#E6EDF3]" />
                    <div><p className="text-sm text-[#64748B]">Location</p><p className="text-base font-semibold text-[#0F172A]">{detail.location}</p></div>
                  </div>
                </SectionCard>
                <div className="min-h-[260px] rounded-2xl border border-[#BDE7DF] bg-[#EAF8F5] p-7">
                  <h3 className="text-lg font-bold text-[#0F172A]">Ready to Apply?</h3>
                  <p className="mt-3 text-sm text-[#64748B]">Submit a structured proposal to demonstrate your fit and approach.</p>
                  <Link
                    to={`/expert/browse/${detail.id}/propose`}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white no-underline"
                    style={{ backgroundColor: TEAL }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                    </svg>
                    Submit Proposal
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

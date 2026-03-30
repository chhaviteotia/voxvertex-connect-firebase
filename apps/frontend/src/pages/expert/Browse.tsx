import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarItems, expertSidebarBottomItems } from '../../config/expertNav'
import {
  IconTarget,
  IconUsers,
  IconCalendar,
  IconDollar,
  IconMapPin,
  IconClock,
  IconSearch,
} from '../../components/layout/DashboardIcons'
import { getOpportunities, type OpportunityItem } from '../../api/expertOpportunities'

const TEAL = '#008C9E'

/** Same as business Requirement page – so heading matches published requirement list */
const OUTCOME_TITLES: Record<string, string> = {
  'skill-development': 'Skill Development',
  'revenue-generation': 'Revenue Generation',
  'hiring-talent': 'Hiring & Talent',
  'brand-positioning': 'Brand Positioning',
  'leadership-alignment': 'Leadership Alignment',
  'innovation-problem-solving': 'Innovation & Problem Solving',
  'compliance-risk': 'Compliance & Risk',
  'community-networking': 'Community & Networking',
  'product-adoption': 'Product Adoption',
  'behavior-change': 'Behavior Change',
}

function getTitleFromFormData(formData: Record<string, unknown>): string {
  const outcome = formData?.selectedOutcome as string | undefined
  if (outcome && OUTCOME_TITLES[outcome]) return OUTCOME_TITLES[outcome]
  const audience = formData?.audienceSelected as string[] | undefined
  if (Array.isArray(audience) && audience.length > 0) return `${audience.slice(0, 2).join(', ')} engagement`
  return 'Expert requirement'
}

type Opportunity = {
  id: string
  title: string
  company: string
  match: number
  timeAgo: string
  objective: string
  audience: string
  typeDuration: string
  budget: string
  location: string
  timeline: string
  domainValue: string
  budgetValue: string
  typeValue: string
}

function timeAgo(createdAt: string): string {
  const d = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

function toTitleCase(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function mapItemToOpportunity(item: OpportunityItem): Opportunity {
  const fd = item.formData as Record<string, unknown>
  const selectedOutcome = (fd.selectedOutcome as string) || ''
  const audienceArr = (fd.audienceSelected as string[]) || []
  const engagementType = (fd.engagementTypeSelected as string) || ''
  const totalDurationMinutes = (fd.totalDurationMinutes as string) || ''
  const totalSessions = (fd.totalSessions as string) || '1'
  const minBudget = typeof fd.minBudget === 'number' ? fd.minBudget : 0
  const maxBudget = typeof fd.maxBudget === 'number' ? fd.maxBudget : 0
  const city = (fd.city as string) || ''
  const stateRegion = (fd.stateRegion as string) || ''
  const country = (fd.country as string) || ''
  const deliveryMode = (fd.deliveryModeSelected as string) || ''
  const startDate = (fd.preferredStartDate as string) || ''
  const endDate = (fd.preferredEndDate as string) || ''

  const objective = selectedOutcome ? toTitleCase(selectedOutcome) : '—'
  const audience = audienceArr.length > 0 ? audienceArr.slice(0, 3).join(', ') : '—'
  let typeDuration = engagementType ? toTitleCase(engagementType) : ''
  if (totalDurationMinutes) {
    const mins = parseInt(totalDurationMinutes, 10)
    if (Number.isFinite(mins) && mins >= 60) typeDuration += ` • ${Math.round(mins / 60)} hrs`
    else if (Number.isFinite(mins)) typeDuration += ` • ${mins} min`
  }
  if (totalSessions && totalSessions !== '1') typeDuration += ` • ${totalSessions} sessions`
  if (!typeDuration) typeDuration = '—'

  let budget = '—'
  if (minBudget > 0 || maxBudget > 0) {
    budget = `₹${minBudget.toLocaleString('en-IN')} - ₹${maxBudget.toLocaleString('en-IN')}`
  }

  let location = '—'
  if (deliveryMode) location = toTitleCase(deliveryMode)
  if (city || stateRegion || country) {
    const parts = [city, stateRegion, country].filter(Boolean)
    location = parts.length > 0 ? parts.join(', ') : location
  }

  let timeline = '—'
  if (startDate || endDate) {
    const format = (s: string) => {
      if (!s || !s.match(/^\d{4}-\d{2}-\d{2}/)) return ''
      const [y, m, d] = s.slice(0, 10).split('-')
      return `${d}/${m}/${y}`
    }
    timeline = [format(startDate), format(endDate)].filter(Boolean).join(' – ') || 'See details'
  }

  const title = getTitleFromFormData(fd)

  const budgetUpper = maxBudget > 0 ? maxBudget : minBudget
  const budgetValue =
    budgetUpper <= 0 ? 'not-specified' : budgetUpper < 100000 ? 'under-100k' : budgetUpper <= 300000 ? '100k-300k' : 'above-300k'
  const lowerType = engagementType.toLowerCase()
  const typeValue = lowerType.includes('workshop') || lowerType.includes('bootcamp') || lowerType.includes('masterclass') || lowerType.includes('implementation')
    ? 'workshop'
    : lowerType.includes('training')
      ? 'training'
      : (lowerType.includes('coaching') || lowerType.includes('mentorship') || lowerType.includes('advisory'))
        ? 'coaching'
        : (lowerType.includes('keynote') || lowerType.includes('panel') || lowerType.includes('fireside') || lowerType.includes('webinar') || lowerType.includes('speaking'))
          ? 'speaking'
          : 'other'

  return {
    id: item.id,
    title,
    company: item.companyName || 'Company',
    match: 85,
    timeAgo: timeAgo(item.createdAt),
    objective,
    audience,
    typeDuration,
    budget,
    location,
    timeline,
    domainValue: selectedOutcome.toLowerCase(),
    budgetValue,
    typeValue,
  }
}

function getMatchBadgeStyle(match: number) {
  if (match >= 85) return { bg: '#22c55e' } // green
  return { bg: '#f97316' } // orange for lower match
}

const PAGE_SIZE = 20

export function ExpertBrowse() {
  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe' : 'John Doe')

  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('all')
  const [budget, setBudget] = useState('all')
  const [type, setType] = useState('all')
  const [domainOptions, setDomainOptions] = useState<Array<{ value: string; label: string }>>([])
  const [budgetOptions, setBudgetOptions] = useState<Array<{ value: string; label: string }>>([])
  const [typeOptions, setTypeOptions] = useState<Array<{ value: string; label: string }>>([])

  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getOpportunities({ limit: PAGE_SIZE, skip: 0, search: search.trim(), domain, budget, type })
      .then((res) => {
        if (cancelled || !res.success) return
        const list = (res.data || []).map(mapItemToOpportunity)
        setOpportunities(list)
        const fallbackDomains = Array.from(new Set(list.map((o) => o.domainValue).filter(Boolean))).map((v) => ({
          value: v,
          label: toTitleCase(v),
        }))
        setDomainOptions((res.filters?.domains?.length ?? 0) > 0 ? (res.filters?.domains ?? []) : fallbackDomains)
        setBudgetOptions(
          (res.filters?.budgets?.length ?? 0) > 0
            ? (res.filters?.budgets ?? [])
            : [
                { value: 'under-100k', label: 'Under ₹1,00,000' },
                { value: '100k-300k', label: '₹1,00,000 - ₹3,00,000' },
                { value: 'above-300k', label: 'Above ₹3,00,000' },
              ],
        )
        setTypeOptions(
          (res.filters?.types?.length ?? 0) > 0
            ? (res.filters?.types ?? [])
            : [
                { value: 'workshop', label: 'Workshop' },
                { value: 'training', label: 'Training Session' },
                { value: 'coaching', label: 'Coaching' },
                { value: 'speaking', label: 'Speaking' },
              ],
        )
        setHasMore(typeof res.total === 'number' ? res.total > list.length : list.length >= PAGE_SIZE)
        setSkip(list.length)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load opportunities')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [domain, budget, type, search])

  const loadMore = () => {
    setLoadingMore(true)
    getOpportunities({ limit: PAGE_SIZE, skip, search: search.trim(), domain, budget, type })
      .then((res) => {
        if (!res.success) return
        const list = (res.data || []).map(mapItemToOpportunity)
        setOpportunities((prev) => [...prev, ...list])
        setHasMore(typeof res.total === 'number' ? res.total > skip + list.length : list.length >= PAGE_SIZE)
        setSkip((s) => s + list.length)
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }

  const filtered = opportunities.filter((opp) => {
    const q = search.trim().toLowerCase()
    if (q && !opp.company.toLowerCase().includes(q) && !opp.objective.toLowerCase().includes(q)) {
      return false
    }
    if (domain !== 'all' && opp.domainValue !== domain) return false
    if (budget !== 'all' && opp.budgetValue !== budget) return false
    if (type !== 'all' && opp.typeValue !== type) return false
    return true
  })

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
      <div className="max-w-5xl mx-auto pb-8 pt-6 px-4" style={{ backgroundColor: '#F7F7F7' }}>
        <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
        <p className="text-sm text-gray-500 mt-0.5">Requirements matched to your expertise</p>

        {loading && (
          <div className="mt-6 py-8 text-center text-gray-500 text-sm">
            Loading opportunities…
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-6 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#008C9E]/20 focus:border-[#008C9E]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#008C9E]/20 focus:border-[#008C9E]"
            >
              <option value="all">All Domains</option>
              {domainOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#008C9E]/20 focus:border-[#008C9E]"
            >
              <option value="all">All Budgets</option>
              {budgetOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#008C9E]/20 focus:border-[#008C9E]"
            >
              <option value="all">All Types</option>
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Opportunity cards */}
        <div className="space-y-4">
          {!loading && filtered.length === 0 && !error && (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
              No opportunities yet. When businesses publish requirements, they will appear here.
            </div>
          )}
          {filtered.map((opp) => {
            const matchStyle = getMatchBadgeStyle(opp.match)
            return (
              <div
                key={opp.id}
                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <h2 className="text-lg font-bold text-gray-900">{opp.title}</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="inline-flex rounded-md px-2.5 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: matchStyle.bg }}
                    >
                      {opp.match}% Match
                    </span>
                    <span className="text-sm text-gray-400">{opp.timeAgo}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">{opp.company}</p>

                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Objective</p>
                      <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                        <IconTarget className="w-4 h-4 text-gray-400 shrink-0" />
                        {opp.objective}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Audience</p>
                      <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                        <IconUsers className="w-4 h-4 text-gray-400 shrink-0" />
                        {opp.audience}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Type & Duration</p>
                      <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                        <IconCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                        {opp.typeDuration}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Budget</p>
                      <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                        <IconDollar className="w-4 h-4 text-gray-400 shrink-0" />
                        {opp.budget}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <IconMapPin className="w-4 h-4 text-gray-500 shrink-0" />
                    {opp.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <IconClock className="w-4 h-4 text-gray-500 shrink-0" />
                    {opp.timeline}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/expert/browse/${opp.id}`}
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 no-underline"
                    style={{ backgroundColor: TEAL }}
                  >
                    View Full Details
                  </Link>
                  <Link
                    to={`/expert/browse/${opp.id}/propose`}
                    state={{ title: opp.title, company: opp.company }}
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 no-underline"
                  >
                    Submit Proposal
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {!loading && hasMore && opportunities.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-70"
            >
              {loadingMore ? 'Loading…' : 'Load More Opportunities'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

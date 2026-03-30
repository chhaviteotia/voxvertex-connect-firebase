import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { businessSidebarItems, businessSidebarBottomItems } from '../../config/businessNav'
import { IconSparkles, IconUsers, IconClock, IconPlus } from '../../components/layout/DashboardIcons'
import { listRequirements, type RequirementResponse } from '../../api/requirements'
import { listProposalsByRequirement } from '../../api/proposals'

type DisplayStatus = 'Matching' | 'Active' | 'In Review' | 'Draft'

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

function getSubtitleFromFormData(formData: Record<string, unknown>): string {
  const engagement = formData?.engagementTypeSelected as string | undefined
  const delivery = formData?.deliveryModeSelected as string | undefined
  const parts: string[] = []
  if (engagement) parts.push(engagement.replace(/-/g, ' '))
  if (delivery) parts.push(delivery)
  return parts.length ? parts.join(' · ') : 'Requirement details'
}

function getBudgetFromFormData(formData: Record<string, unknown>): string {
  const min = formData?.minBudget as number | undefined
  const max = formData?.maxBudget as number | undefined
  const currency = (formData?.currency as string) || 'INR (₹)'
  const symbol = currency.includes('₹') ? '₹' : currency.includes('$') ? '$' : currency.includes('€') ? '€' : '£'
  if (typeof min === 'number' && typeof max === 'number' && (min > 0 || max > 0)) {
    return `${symbol}${min.toLocaleString('en-IN')} – ${symbol}${max.toLocaleString('en-IN')}`
  }
  if (typeof min === 'number' && min > 0) return `${symbol}${min.toLocaleString('en-IN')}+`
  if (typeof max === 'number' && max > 0) return `Up to ${symbol}${max.toLocaleString('en-IN')}`
  return 'Budget not set'
}

function formatCreated(createdAt: string): string {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (days === 0) return 'Created today'
  if (days === 1) return 'Created 1 day ago'
  if (days < 7) return `Created ${days} days ago`
  if (days < 30) return `Created ${Math.floor(days / 7)} week(s) ago`
  return `Created ${date.toLocaleDateString()}`
}

const STATUS_STYLES: Record<DisplayStatus, string> = {
  Matching: 'bg-[#2563EB] text-white',
  Active: 'bg-[#00A7B3] text-white',
  'In Review': 'bg-[#FACC15] text-[#1F2937]',
  Draft: 'bg-gray-200 text-gray-800',
}

function mapRequirementToItem(r: RequirementResponse): {
  id: string
  title: string
  subtitle: string
  status: DisplayStatus
  matches: number
  proposals: number
  created: string
  budget: string
} {
  const formData = r.formData || {}
  const displayStatus: DisplayStatus = r.status === 'draft' ? 'Draft' : 'Matching'
  return {
    id: r.id,
    title: getTitleFromFormData(formData),
    subtitle: getSubtitleFromFormData(formData),
    status: displayStatus,
    matches: 0,
    proposals: 0,
    created: formatCreated(r.createdAt),
    budget: getBudgetFromFormData(formData),
  }
}

export function Requirement() {
  const [requirements, setRequirements] = useState<RequirementResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [proposalCountByRequirementId, setProposalCountByRequirementId] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false
    listRequirements()
      .then((res) => {
        if (!cancelled && res.success && res.requirements) {
          setRequirements(res.requirements)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load requirements')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (requirements.length === 0) {
      setProposalCountByRequirementId({})
      return
    }

    let cancelled = false
    Promise.all(
      requirements.map(async (requirement) => {
        try {
          // limit=1 keeps payload tiny; we only need "total".
          const response = await listProposalsByRequirement(requirement.id, { limit: 1, skip: 0 })
          return [requirement.id, response.success ? response.total ?? 0 : 0] as const
        } catch {
          return [requirement.id, 0] as const
        }
      })
    ).then((entries) => {
      if (cancelled) return
      setProposalCountByRequirementId(Object.fromEntries(entries))
    })

    return () => {
      cancelled = true
    }
  }, [requirements])

  const listings = requirements.map((requirement) => {
    const mapped = mapRequirementToItem(requirement)
    const proposalCount = proposalCountByRequirementId[requirement.id]
    const safeCount = typeof proposalCount === 'number' ? proposalCount : 0
    return {
      ...mapped,
      proposals: safeCount,
      // No dedicated "matches" backend metric currently; keep aligned with proposals for now.
      matches: safeCount,
    }
  })

  return (
    <DashboardLayout
      sidebarItems={businessSidebarItems}
      sidebarBottomItems={businessSidebarBottomItems}
      userTypeLabel="Business"
      userDisplayName="Acme Corp"
      userSubLabel="Business Account"
      sidebarClassName="bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Requirement</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your expert requirements</p>
          </div>
          <Link
            to="/business/create-requirement"
            className="inline-flex items-center gap-2 rounded-lg bg-[#008C9E] px-4 py-2.5 text-sm font-semibold text-white no-underline hover:opacity-90"
          >
            <IconPlus />
            <span>Create Requirement</span>
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16l-6 8v6l-4 2v-8z" />
              </svg>
            </span>
            <span>Filters</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span>All Status</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-[#008C9E]" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
            <p className="text-gray-500">No requirements yet.</p>
            <p className="text-sm text-gray-400 mt-1">Create your first requirement to get matched with experts.</p>
            <Link
              to="/business/create-requirement"
              className="inline-flex items-center gap-2 rounded-lg bg-[#008C9E] px-4 py-2.5 text-sm font-semibold text-white no-underline hover:opacity-90 mt-4"
            >
              <IconPlus />
              Create Requirement
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm ${item.status !== 'Draft' ? 'hover:border-gray-300' : ''}`}
              >
                <Link
                  to={item.status === 'Draft' ? `/business/create-requirement/${item.id}` : `/business/requirement/${item.id}`}
                  className="no-underline block"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-gray-900">{item.title}</h2>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.subtitle}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="text-xs uppercase tracking-wide text-gray-400">Budget</div>
                      <div className="mt-0.5 font-semibold text-gray-900">{item.budget}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="inline-flex items-center gap-1.5">
                        <IconSparkles />
                        <span className="text-xs text-gray-500">{item.matches} matches</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <IconUsers />
                        <span className="text-xs text-gray-500">{item.proposals} proposals</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <IconClock />
                        <span className="text-xs text-gray-500">{item.created}</span>
                      </div>
                    </div>
                    {item.status === 'Draft' ? (
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[#008C9E] px-3 py-2 text-sm font-medium text-white">
                        Continue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[#008C9E] px-3 py-2 text-sm font-medium text-white">
                        View
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

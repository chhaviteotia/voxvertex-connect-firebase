import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarItems, expertSidebarBottomItems } from '../../config/expertNav'
import { IconCheckSquare, IconDocument, IconTarget, IconUsers, IconCalendar, IconDollar } from '../../components/layout/DashboardIcons'
import { getExpertProfile, type ExpertProfileData } from '../../api/expertProfile'
import { computeExpertProfileCompletion, EXPERT_SECTION_LABELS } from '../../utils/expertProfileCompletion'
import { getOpportunities, type OpportunityItem } from '../../api/expertOpportunities'
import { listMyProposals, type ProposalResponse } from '../../api/proposals'
import { formatOpportunityTimeAgo, getTitleFromOpportunityFormData, mapOpportunityItemToCard } from '../../utils/opportunityDisplay'

const TEAL = '#008C9E'

function proposalActivityText(p: ProposalResponse): string {
  const title = getTitleFromOpportunityFormData((p.requirement?.formData ?? {}) as Record<string, unknown>)
  switch (p.status) {
    case 'accepted':
      return `Proposal accepted for “${title}”`
    case 'declined':
      return `Proposal declined for “${title}”`
    case 'modification-requested':
      return `Revision requested for “${title}”`
    case 'submitted':
      return `Proposal submitted for “${title}”`
    case 'draft':
      return `Draft proposal for “${title}”`
    default:
      return `Proposal updated for “${title}”`
  }
}

export function ExpertDashboard() {
  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe')
  const firstName = displayName.split(/\s+/)[0] || 'John'
  const [profileData, setProfileData] = useState<ExpertProfileData | undefined>(undefined)
  const [proposals, setProposals] = useState<ProposalResponse[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(true)
  const [opportunityItems, setOpportunityItems] = useState<OpportunityItem[]>([])
  const [opportunitiesTotal, setOpportunitiesTotal] = useState(0)
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true)
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getExpertProfile()
      .then((res) => {
        if (!cancelled && res.success) {
          setProfileData(res.data)
        }
      })
      .catch(() => {
        // Keep card usable with fallback values if profile API fails on dashboard.
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setProposalsLoading(true)
    listMyProposals({ limit: 80, skip: 0 })
      .then((res) => {
        if (!cancelled && res.success) setProposals(res.proposals ?? [])
      })
      .catch(() => {
        if (!cancelled) setProposals([])
      })
      .finally(() => {
        if (!cancelled) setProposalsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setOpportunitiesLoading(true)
    setOpportunitiesError(null)
    getOpportunities({ limit: 5, skip: 0 })
      .then((res) => {
        if (cancelled) return
        if (res.success) {
          setOpportunityItems(res.data ?? [])
          setOpportunitiesTotal(typeof res.total === 'number' ? res.total : (res.data ?? []).length)
        } else {
          setOpportunityItems([])
          setOpportunitiesTotal(0)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setOpportunitiesError(err instanceof Error ? err.message : 'Failed to load opportunities')
          setOpportunityItems([])
        }
      })
      .finally(() => {
        if (!cancelled) setOpportunitiesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const completion = useMemo(() => computeExpertProfileCompletion(profileData), [profileData])
  const missingLabels = completion.missingSections.map((section) => EXPERT_SECTION_LABELS[section])

  const acceptedCount = useMemo(() => proposals.filter((p) => p.status === 'accepted').length, [proposals])
  const inReviewCount = useMemo(
    () => proposals.filter((p) => p.status === 'submitted' || p.status === 'modification-requested').length,
    [proposals]
  )
  const draftProposalsCount = useMemo(() => proposals.filter((p) => p.status === 'draft').length, [proposals])
  const sentProposalsCount = useMemo(() => proposals.filter((p) => p.status !== 'draft').length, [proposals])

  const statCards = useMemo(
    () => [
      {
        value: String(opportunitiesTotal),
        label: 'Open opportunities',
        secondary: 'Published requirements',
        icon: IconTarget,
      },
      {
        value: String(sentProposalsCount),
        label: 'Proposals sent',
        secondary: `${acceptedCount} accepted`,
        icon: IconUsers,
      },
      {
        value: String(inReviewCount),
        label: 'In review',
        secondary: 'Awaiting business',
        icon: IconCheckSquare,
      },
      {
        value: String(draftProposalsCount),
        label: 'Draft proposals',
        secondary: 'Not yet submitted',
        icon: IconDocument,
      },
    ],
    [opportunitiesTotal, sentProposalsCount, acceptedCount, inReviewCount, draftProposalsCount]
  )

  const recentActivityItems = useMemo(() => {
    return [...proposals]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((p) => ({
        text: proposalActivityText(p),
        time: formatOpportunityTimeAgo(p.createdAt),
      }))
  }, [proposals])

  const matchedOpportunityCards = useMemo(() => {
    const matchBasis = completion.percent > 0 ? completion.percent : 72
    return opportunityItems.map((item) => mapOpportunityItemToCard(item, { matchPercent: matchBasis }))
  }, [opportunityItems, completion.percent])

  const statsPending = proposalsLoading || opportunitiesLoading

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
      <div className="max-w-5xl mx-auto pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1e293b]">Welcome back, {firstName}!</h1>
          <p className="text-[#64748b] mt-0.5">Here&apos;s what&apos;s happening with your expert profile</p>
        </div>

        {/* Complete Your Profile card - light blue bg per design */}
        <div className="rounded-xl bg-[#E0F2F7] border border-gray-400 shadow-sm p-5 mb-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4 min-w-0 flex-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#007B8A] bg-transparent text-[#007B8A] text-sm font-normal" style={{ fontStyle: 'italic' }} aria-hidden>i</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-[#1e293b]">Complete Your Profile</h2>
                <p className="text-sm text-[#64748b] mt-0.5">
                  Profile Strength: {completion.percent}% — Boost your visibility and match rate
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-[#cbd5e1] overflow-hidden">
                  <div className="h-full rounded-full bg-[#1e293b]" style={{ width: `${completion.percent}%` }} />
                </div>
                {missingLabels.length > 0 ? (
                  <>
                    <p className="text-base font-semibold text-[#1e293b] mt-3">Missing sections:</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 items-baseline">
                      {missingLabels.map((section, i) => (
                        <span key={section} className="text-sm font-normal text-black border border-gray-200 rounded px-1.5 py-0.5" style={{ borderWidth: '1px' }}>
                          {section}
                          {i < missingLabels.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-base font-semibold text-[#166534] mt-3">All profile sections are complete.</p>
                )}
              </div>
            </div>
            <Link
              to="/expert/profile"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shrink-0 hover:opacity-90 no-underline"
              style={{ backgroundColor: '#00a7b5' }}
            >
              Complete Profile
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Four stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ value, label, secondary, icon: Icon }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 px-4 py-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-gray-600 bg-gray-100">
                  <Icon />
                </div>
                {secondary ? (
                  <span className="text-xs text-gray-500 text-right leading-tight max-w-[120px]">{secondary}</span>
                ) : null}
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{statsPending ? '—' : value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Matched Opportunities */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Matched Opportunities</h2>
                <p className="text-sm text-gray-500 mt-0.5">Requirements that match your expertise</p>
              </div>
              <Link to="/expert/browse" className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2 bg-white no-underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {opportunitiesError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{opportunitiesError}</div>
              )}
              {opportunitiesLoading ? (
                <p className="text-sm text-gray-500 py-6">Loading opportunities…</p>
              ) : matchedOpportunityCards.length === 0 ? (
                <p className="text-sm text-gray-500 py-6">No open opportunities right now. Check back soon or open Browse to see the full list.</p>
              ) : (
                matchedOpportunityCards.map((opp) => (
                  <div key={opp.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <h3 className="text-base font-semibold text-gray-900">{opp.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex rounded-md px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: TEAL }}>
                          {opp.match > 0 ? `${opp.match}% profile fit` : 'Match'}
                        </span>
                        <span className="text-xs text-gray-400">{opp.timeAgo}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{opp.company}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1.5">
                        <IconTarget className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{opp.objective}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconUsers className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{opp.audience}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{opp.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconDollar className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{opp.budget}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/expert/browse/${opp.id}`}
                        state={{ title: opp.title, company: opp.company }}
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 no-underline"
                        style={{ backgroundColor: TEAL }}
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/expert/browse/${opp.id}/propose`}
                        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 no-underline"
                      >
                        Submit Proposal
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {proposalsLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Loading activity…</div>
                ) : recentActivityItems.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No proposal activity yet. Submit a proposal to see updates here.</div>
                ) : (
                  recentActivityItems.map((item, i) => (
                    <div key={`${item.text}-${i}`} className="px-4 py-3">
                      <p className="text-sm text-gray-900">{item.text}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help icon - fixed bottom right */}
        <button
          type="button"
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008C9E]"
          style={{ backgroundColor: TEAL }}
          aria-label="Help"
        >
          ?
        </button>
      </div>
    </DashboardLayout>
  )
}

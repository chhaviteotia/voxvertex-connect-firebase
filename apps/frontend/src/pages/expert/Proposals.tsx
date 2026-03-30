import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarItems, expertSidebarBottomItems } from '../../config/expertNav'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import { listMyProposals, type ProposalResponse } from '../../api/proposals'

type UiStatus = 'under-review' | 'accepted' | 'rejected' | 'needs-changes' | 'draft'

function getTitleFromFormData(formData: Record<string, unknown> | undefined): string {
  if (!formData) return 'Proposal'
  const objective = (formData.objective as string | undefined)?.trim()
  if (objective) return objective
  const selectedOutcome = formData.selectedOutcome as string | undefined
  if (selectedOutcome) return selectedOutcome.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
  return 'Proposal'
}

function getCompanyName(proposal: ProposalResponse): string {
  return proposal.requirement?.companyName || 'Company'
}

function mapStatus(status: ProposalResponse['status']): { label: string; tone: UiStatus } {
  if (status === 'accepted') return { label: 'Accepted', tone: 'accepted' }
  if (status === 'declined') return { label: 'Rejected', tone: 'rejected' }
  if (status === 'modification-requested') return { label: 'Needs Changes', tone: 'needs-changes' }
  if (status === 'draft') return { label: 'Draft', tone: 'draft' }
  return { label: 'Under Review', tone: 'under-review' }
}

function formatTimeAgo(createdAt: string): string {
  const created = new Date(createdAt).getTime()
  const diffMs = Math.max(0, Date.now() - created)
  const dayMs = 24 * 60 * 60 * 1000
  const days = Math.floor(diffMs / dayMs)
  if (days === 0) return 'Today'
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

function formatFee(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `₹${value.toLocaleString('en-IN')}`
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return 'Not specified'
    if (/^[\d,.]+$/.test(trimmed)) return `₹${Number(trimmed.replace(/,/g, '')).toLocaleString('en-IN')}`
    return trimmed
  }
  return 'Not specified'
}

const STATUS_CLASSES: Record<UiStatus, string> = {
  'under-review': 'bg-[#FFF2E2] text-[#D97706]',
  accepted: 'bg-[#DCFCE7] text-[#16A34A]',
  rejected: 'bg-[#FEE2E2] text-[#DC2626]',
  'needs-changes': 'bg-[#FEF3C7] text-[#B45309]',
  draft: 'bg-gray-200 text-gray-700',
}

export function ExpertProposals() {
  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe' : 'John Doe')

  const [proposals, setProposals] = useState<ProposalResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listMyProposals({ limit: 50, skip: 0 })
      .then((response) => {
        if (cancelled) return
        if (response.success && Array.isArray(response.proposals)) {
          setProposals(response.proposals)
        } else {
          setProposals([])
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load proposals.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const cards = useMemo(
    () =>
      proposals.map((proposal) => {
        const status = mapStatus(proposal.status)
        const title = getTitleFromFormData(proposal.requirement?.formData || proposal.formData || {})
        return {
          id: proposal.id,
          title,
          companyName: getCompanyName(proposal),
          statusLabel: status.label,
          statusTone: status.tone,
          proposedFee: formatFee(proposal.formData?.proposedFee),
          timeAgo: formatTimeAgo(proposal.createdAt),
        }
      }),
    [proposals]
  )

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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">My Proposals</h1>
          <p className="mt-1 text-sm text-gray-500">Track your submitted proposals</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-sm text-gray-500">Loading proposals...</div>
        ) : cards.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-8 text-sm text-gray-500">No proposals submitted yet.</div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div key={card.id} className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#111827]">{card.title}</h2>
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[card.statusTone]}`}>
                        {card.statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{card.companyName}</p>
                  </div>
                  <p className="shrink-0 text-sm text-gray-400">{card.timeAgo}</p>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Proposed Fee: <span className="font-semibold text-[#111827]">{card.proposedFee}</span>
                  </p>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#0096C7] hover:bg-[#0096C7] hover:text-white"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

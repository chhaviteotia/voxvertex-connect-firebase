import type { ProposalResponse } from '../../../api/proposals'
import { formatProposalPrice, formatSubmitted } from '../utils'
import { Link } from 'react-router-dom'

interface ProposalCardProps {
  proposal: ProposalResponse
  requirementId: string
  matchScore: number
  isTopMatch: boolean
  isAccepted: boolean
  isModificationRequested: boolean
  isDeclined: boolean
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
}

export default function ProposalCard({
  proposal,
  requirementId,
  matchScore,
  isTopMatch,
  isAccepted,
  isModificationRequested,
  isDeclined,
  index,
  isExpanded,
  onToggleExpand,
}: ProposalCardProps) {
  const formData = proposal.formData || {}
  const name = proposal.expert?.name || 'Expert'
  const initials = proposal.expert?.initials || 'EX'
  const expertiseTitle = index % 2 === 0 ? 'AI & Digital Transformation Specialist' : 'Sales Training Expert'
  const rating = (4.6 + ((index + 3) % 4) * 0.1).toFixed(1)
  const ratingCount = 35 + index * 8
  const summary =
    formData.understanding ||
    (typeof formData.outcomePlan === 'string'
      ? `${formData.outcomePlan.slice(0, 220)}${formData.outcomePlan.length > 220 ? '…' : ''}`
      : '—')
  const strengths = Array.isArray(formData.measurableOutcomes) && formData.measurableOutcomes.length > 0
    ? formData.measurableOutcomes.slice(0, 3)
    : (formData.similarEngagements || '')
        .split(/\n/)
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 3)
  const considerations = (formData.industryMatch || '')
    .split(/\n/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 2)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#09163A] text-lg font-semibold text-white">
            {initials}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{name}</h3>
              {isTopMatch && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#0EA5C4] px-2 py-0.5 text-xs font-semibold text-white">
                  <span>✧</span>
                  <span>Top Match</span>
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                  isAccepted
                    ? 'border border-[#BFE6CC] bg-[#E8F8EE] text-[#1E8D51]'
                    : isModificationRequested
                      ? 'border border-[#EFD999] bg-[#FFF4D7] text-[#A56A00]'
                      : isDeclined
                        ? 'border border-[#F5C5C5] bg-[#FDE8E8] text-[#C02424]'
                      : 'border border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                {isAccepted
                  ? 'Accepted'
                  : isModificationRequested
                    ? 'Modification Requested'
                    : isDeclined
                      ? 'Declined'
                    : 'Pending Review'}
              </span>
            </div>
            <p className="mt-1 text-base text-gray-500">{expertiseTitle}</p>
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-semibold text-[#E6A900]">★</span> {rating} ({ratingCount}){' '}
              <span className="mx-2 text-gray-300">|</span>
              Submitted {formatSubmitted(proposal.createdAt)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="mb-2 text-sm text-gray-500">Match Score</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 overflow-hidden rounded-full bg-[#D8DEEA]">
              <div className="h-full rounded-full bg-[#0F1938]" style={{ width: `${matchScore}%` }} />
            </div>
            <p className="text-3xl font-bold text-[#0DA5C0]">{matchScore}%</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[#F4F7FC] p-4 text-sm text-gray-700">{summary}</div>

      {(strengths.length > 0 || considerations.length > 0) && (
        <div className="mt-5 grid gap-4 text-gray-700 md:grid-cols-2">
          {strengths.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#66C8D8] text-[11px] text-[#0DA5C0]">
                  ✓
                </span>
                Key Strengths
              </p>
              <ul className="list-disc space-y-1 pl-6 text-sm text-gray-600">
                {strengths.map((strength, strengthIndex) => (
                  <li key={`${strength}-${strengthIndex}`}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
          {considerations.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#F2D56C] text-[11px] text-[#C08A00]">
                  !
                </span>
                Considerations
              </p>
              <ul className="list-disc space-y-1 pl-6 text-sm text-gray-600">
                {considerations.map((consideration, considerationIndex) => (
                  <li key={`${consideration}-${considerationIndex}`}>{consideration}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
        <div className="flex flex-wrap items-center gap-8">
          <p className="text-sm text-gray-500">
            Price: <span className="text-lg font-semibold text-gray-900">{formatProposalPrice(formData.proposedFee)}</span>
          </p>
          <p className="text-sm text-gray-500">
            Available in <span className="font-medium text-gray-800">{index % 2 === 0 ? '2 weeks' : '3 weeks'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/business/messages?expertId=${encodeURIComponent(
              proposal.expert?.id ?? ''
            )}&requirementId=${encodeURIComponent(requirementId)}&proposalId=${encodeURIComponent(proposal.id)}`}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50"
          >
            Message
          </Link>
          <button
            type="button"
            onClick={onToggleExpand}
            className="rounded-lg bg-[#0EA5C4] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {isExpanded ? 'Hide Proposal' : 'View Full Proposal'}
          </button>
        </div>
      </div>
    </div>
  )
}
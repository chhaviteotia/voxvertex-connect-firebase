import ProposalCard from "./ProposalCard"
import ProposalDetail from './ProposalDetail'
import type { ProposalResponse } from '../../../api/proposals'
import ProposalSidebar from './ProposalSidebar'

interface ProposalListProps {
  proposals: ProposalResponse[]
  requirementId: string
  requirementSummary: {
    objective: string
    budget: string
    timeline: string
    location: string
  }
  loading: boolean
  error: string | null
  expandedProposalId: string | null
  onToggleExpand: (proposalId: string) => void
  onAcceptProposal: (proposalId: string) => Promise<void>
  onRequestModification: (proposalId: string, message: string) => Promise<void>
  onDeclineProposal: (proposalId: string, reason: string) => Promise<void>
  onRetry: () => void
}

export default function ProposalList({
  proposals,
  requirementId,
  requirementSummary,
  loading,
  error,
  expandedProposalId,
  onToggleExpand,
  onAcceptProposal,
  onRequestModification,
  onDeclineProposal,
  onRetry,
}: ProposalListProps) {
  if (loading) {
    return <p className="text-sm text-gray-500">Loading proposals…</p>
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    )
  }

  if (proposals.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No proposals yet. When experts submit proposals for this requirement, they will appear here.
      </p>
    )
  }

  const topProposal = proposals[0] ?? null
  const selectedProposal = proposals.find((proposal) => proposal.id === expandedProposalId) ?? null
  const acceptedProposals = proposals.filter((proposal) => proposal.status === 'accepted')
  const modificationRequestedProposals = proposals.filter(
    (proposal) => proposal.status === 'modification-requested'
  )
  const declinedProposals = proposals.filter((proposal) => proposal.status === 'declined')
  const pendingProposals = proposals.filter(
    (proposal) =>
      proposal.status !== 'accepted' &&
      proposal.status !== 'modification-requested' &&
      proposal.status !== 'declined'
  )

  if (selectedProposal) {
    return (
      <ProposalDetail
        proposal={selectedProposal}
        requirementId={requirementId}
        requirementSummary={requirementSummary}
        isAccepted={selectedProposal.status === 'accepted'}
        isModificationRequested={selectedProposal.status === 'modification-requested'}
        isDeclined={selectedProposal.status === 'declined'}
        onAcceptProposal={() => onAcceptProposal(selectedProposal.id)}
        onRequestModification={(message) => onRequestModification(selectedProposal.id, message)}
        onDeclineProposal={(reason) => onDeclineProposal(selectedProposal.id, reason)}
        onBack={() => onToggleExpand(selectedProposal.id)}
      />
    )
  }

  const renderSection = (
    title: string,
    sectionProposals: ProposalResponse[],
    sectionType: 'accepted' | 'pending' | 'modification' | 'declined'
  ) => {
    if (sectionProposals.length === 0) return null
    const headingClass =
      sectionType === 'accepted'
        ? 'text-[#1E8D51]'
        : sectionType === 'modification'
          ? 'text-[#A56A00]'
          : sectionType === 'declined'
            ? 'text-[#C02424]'
          : 'text-[#0B1B3D]'
    const icon =
      sectionType === 'accepted' ? '✓' : sectionType === 'modification' ? '!' : sectionType === 'declined' ? '⦸' : ''

    return (
      <section className="space-y-4">
        <h3 className={`flex items-center gap-2 text-2xl font-semibold ${headingClass}`}>
          {icon ? (
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                sectionType === 'accepted'
                  ? 'bg-[#E8F8EE] text-[#1E8D51]'
                  : sectionType === 'modification'
                    ? 'bg-[#FFF4D7] text-[#A56A00]'
                    : 'bg-[#FDE8E8] text-[#C02424]'
              }`}
            >
              {icon}
            </span>
          ) : null}
          {title} ({sectionProposals.length})
        </h3>
        {sectionProposals.map((proposal, index) => {
          const rankIndex =
            sectionType === 'accepted'
              ? index
              : sectionType === 'pending'
                ? acceptedProposals.length + index
                : sectionType === 'modification'
                  ? acceptedProposals.length + pendingProposals.length + index
                  : acceptedProposals.length + pendingProposals.length + modificationRequestedProposals.length + index
          const matchScore = Math.max(75, 95 - rankIndex * 10)
          return (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              requirementId={requirementId}
              matchScore={matchScore}
              isTopMatch={rankIndex === 0}
              isAccepted={sectionType === 'accepted'}
              isModificationRequested={sectionType === 'modification'}
              isDeclined={sectionType === 'declined'}
              index={rankIndex}
              isExpanded={false}
              onToggleExpand={() => onToggleExpand(proposal.id)}
            />
          )
        })}
      </section>
    )
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
      <div className="space-y-4">
        {renderSection('Accepted Experts', acceptedProposals, 'accepted')}
        {renderSection('Pending Review', pendingProposals, 'pending')}
        {renderSection('Modification Requested', modificationRequestedProposals, 'modification')}
        {renderSection('Declined', declinedProposals, 'declined')}
      </div>

      <ProposalSidebar
        requirementId={requirementId}
        topProposal={topProposal}
        onReviewTopMatch={() => {
          if (topProposal) onToggleExpand(topProposal.id)
        }}
      />
    </div>
  )
}
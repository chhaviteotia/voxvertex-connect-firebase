import type { ProposalResponse } from '../../../api/proposals'
import { Link } from 'react-router-dom'

interface ProposalSidebarProps {
  requirementId: string
  topProposal: ProposalResponse | null
  onReviewTopMatch: () => void
}

export default function ProposalSidebar({
  requirementId,
  topProposal,
  onReviewTopMatch,
}: ProposalSidebarProps) {
  const topProposalName = topProposal?.expert?.name || 'Top proposal'

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="mb-3 text-lg font-semibold text-gray-900">✧ AI Insights</h4>
        <p className="text-sm text-gray-500">Recommended Action</p>
        <p className="mt-2 text-sm text-gray-700">
          {topProposalName}&apos;s proposal shows the strongest fit. Their specialization and sales
          training experience align perfectly with your needs.
        </p>
        <button
          type="button"
          onClick={onReviewTopMatch}
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#0EA5C4] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Review Top Match
        </button>
      </div>

      <div className="rounded-2xl border border-[#D6DEE8] bg-[#F7FAFC] p-5">
        <h4 className="mb-4 text-lg font-semibold text-[#0B1B3D]">Quick Actions</h4>
        <Link
          to={`/business/messages?requirementId=${encodeURIComponent(requirementId)}`}
          className="mb-2 inline-flex w-full items-center gap-3 rounded-xl border border-[#D6DEE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1B3D] no-underline hover:bg-[#F8FBFF]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#0B1B3D]"
            aria-hidden
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Message All Experts
        </Link>
        <button
          type="button"
          className="inline-flex w-full items-center gap-3 rounded-xl border border-[#D6DEE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1B3D] hover:bg-[#F8FBFF]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#0B1B3D]"
            aria-hidden
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Request More Proposals
        </button>
      </div>

      <div className="rounded-2xl border border-[#CBE7EC] bg-[#F2FAFC] p-4 shadow-sm">
        <p className="text-sm font-medium text-[#17879A]">Tip</p>
        <p className="mt-1 text-xs text-[#2F5F6A]">
          Experts with match scores above 90% have historically delivered 2x better outcomes.
          Consider prioritizing your review accordingly.
        </p>
      </div>
    </aside>
  )
}

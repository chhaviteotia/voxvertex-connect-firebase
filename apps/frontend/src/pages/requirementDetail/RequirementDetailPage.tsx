import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { businessSidebarBottomItems, businessSidebarItems } from '../../config/businessNav'
import { getRequirement, type RequirementResponse } from '../../api/requirements'
import {
  listProposalsByRequirement,
  type ProposalResponse,
  updateProposalStatusForRequirement,
} from '../../api/proposals'
import RequirementHeader from './components/RequirementHeader'
import RequirementMetrics from './components/RequirementMetrics'
import RequirementTabs, { type RequirementTab } from './components/RequirementTabs'
import ProposalList from './components/ProposalList'
import RequirementDetails from './components/RequirementDetails'
import ActivityPanel from './components/ActivityPanel'
import { buildRequirementViewModel } from './utils'

export default function RequirementDetailPage() {
  const { requirementId } = useParams<{ requirementId: string }>()

  const [requirement, setRequirement] = useState<RequirementResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<RequirementTab>('details')
  const [proposals, setProposals] = useState<ProposalResponse[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [proposalsError, setProposalsError] = useState<string | null>(null)
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null)

  useEffect(() => {
    const rid = requirementId?.trim()
    if (!rid) return

    let cancelled = false
    setLoading(true)
    setError(null)

    getRequirement(rid)
      .then((res) => {
        if (!cancelled && res.success && res.requirement) {
          setRequirement(res.requirement)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load requirement')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [requirementId])

  const fetchProposals = useCallback(() => {
    const rid = requirementId?.trim()
    if (!rid) return

    setProposalsLoading(true)
    setProposalsError(null)

    listProposalsByRequirement(rid)
      .then((res) => {
        if (res.success && Array.isArray(res.proposals)) {
          setProposals(res.proposals)
        }
      })
      .catch((err) => {
        setProposalsError(err instanceof Error ? err.message : 'Failed to load proposals')
      })
      .finally(() => {
        setProposalsLoading(false)
      })
  }, [requirementId])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  useEffect(() => {
    if (!expandedProposalId) return
    const proposalStillExists = proposals.some((proposal) => proposal.id === expandedProposalId)
    if (!proposalStillExists) setExpandedProposalId(null)
  }, [expandedProposalId, proposals])

  const viewModel = useMemo(
    () => (requirement ? buildRequirementViewModel(requirement) : null),
    [requirement]
  )
  const isFullProposalView = activeTab === 'proposals' && expandedProposalId !== null

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={businessSidebarItems}
        sidebarBottomItems={businessSidebarBottomItems}
        userTypeLabel="Business"
        userDisplayName="Acme Corp"
        userSubLabel="Business Account"
        sidebarClassName="bg-gray-50"
      >
        <div className="flex items-center justify-center py-24">
          <svg
            className="h-10 w-10 animate-spin text-[#008C9E]"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !requirement || !viewModel) {
    return (
      <DashboardLayout
        sidebarItems={businessSidebarItems}
        sidebarBottomItems={businessSidebarBottomItems}
        userTypeLabel="Business"
        userDisplayName="Acme Corp"
        userSubLabel="Business Account"
        sidebarClassName="bg-gray-50"
      >
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-red-600">{error || 'Requirement not found.'}</p>
          <Link to="/business/requirement" className="mt-4 inline-block font-medium text-[#008C9E] hover:underline">
            Back to requirements
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      sidebarItems={businessSidebarItems}
      sidebarBottomItems={businessSidebarBottomItems}
      userTypeLabel="Business"
      userDisplayName="Acme Corp"
      userSubLabel="Business Account"
      sidebarClassName="bg-gray-50"
      mainClassName="bg-[#F0F2F5]"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        {!isFullProposalView && (
          <>
            <RequirementHeader
              title={viewModel.title}
              status={viewModel.status}
              createdLabel={viewModel.createdLabel}
            />

            <RequirementMetrics proposalCount={proposals.length} />

            <div className="mt-6">
              <RequirementTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                proposalCount={proposals.length}
              />
            </div>
          </>
        )}

        <div className={`${isFullProposalView ? 'mt-0' : 'mt-8'} space-y-6`}>
          {activeTab === 'proposals' && (
            <ProposalList
              proposals={proposals}
              requirementId={requirement.id}
              requirementSummary={viewModel.summary}
              loading={proposalsLoading}
              error={proposalsError}
              expandedProposalId={expandedProposalId}
              onToggleExpand={(proposalId) => {
                setExpandedProposalId((prev) => (prev === proposalId ? null : proposalId))
              }}
              onAcceptProposal={async (proposalId) => {
                const response = await updateProposalStatusForRequirement(requirement.id, proposalId, {
                  status: 'accepted',
                })
                setProposals((previous) =>
                  previous.map((proposal) => (proposal.id === proposalId ? response.proposal : proposal))
                )
                setExpandedProposalId(null)
              }}
              onRequestModification={async (proposalId, message) => {
                const response = await updateProposalStatusForRequirement(requirement.id, proposalId, {
                  status: 'modification-requested',
                  businessNote: message,
                })
                setProposals((previous) =>
                  previous.map((proposal) => (proposal.id === proposalId ? response.proposal : proposal))
                )
                setExpandedProposalId(null)
              }}
              onDeclineProposal={async (proposalId, reason) => {
                const response = await updateProposalStatusForRequirement(requirement.id, proposalId, {
                  status: 'declined',
                  businessNote: reason,
                })
                setProposals((previous) =>
                  previous.map((proposal) => (proposal.id === proposalId ? response.proposal : proposal))
                )
                setExpandedProposalId(null)
              }}
              onRetry={fetchProposals}
            />
          )}

          {activeTab === 'details' && <RequirementDetails viewModel={viewModel} />}
          {activeTab === 'activity' && <ActivityPanel />}
        </div>
      </div>
    </DashboardLayout>
  )
}
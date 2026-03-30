import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ProposalResponse } from '../../../api/proposals'
import { formatProposalPrice } from '../utils'
import { createOrGetConversation, sendMessage } from '../../../api/conversations'

const DELIVERABLES_BY_CATEGORY: { category: string; items: { id: string; label: string }[] }[] = [
  {
    category: 'Learning',
    items: [
      { id: 'knowledge-materials', label: 'Knowledge Materials' },
      { id: 'session-recordings', label: 'Session Recordings' },
      { id: 'frameworks-templates', label: 'Frameworks & Templates' },
      { id: 'custom-playbooks', label: 'Custom Playbooks' },
      { id: 'toolkits', label: 'Toolkits' },
    ],
  },
  {
    category: 'Planning',
    items: [
      { id: 'action-plan', label: 'Action Plan' },
      { id: 'implementation-roadmap', label: 'Implementation Roadmap' },
      { id: 'strategy-document', label: 'Strategy Document' },
      { id: 'decision-framework', label: 'Decision Framework' },
    ],
  },
  {
    category: 'Analysis',
    items: [
      { id: 'assessment-reports', label: 'Assessment Reports' },
      { id: 'post-session-summary', label: 'Post-Session Summary' },
      { id: 'participant-feedback', label: 'Participant Feedback' },
      { id: 'skill-assessment-scores', label: 'Skill Assessment Scores' },
      { id: 'performance-tracking', label: 'Performance Tracking' },
    ],
  },
  {
    category: 'Outputs',
    items: [
      { id: 'project-outputs', label: 'Project Outputs' },
      { id: 'prototype-solution', label: 'Prototype or Solution' },
      { id: 'coaching-notes', label: 'Coaching Notes' },
    ],
  },
  {
    category: 'Recognition',
    items: [{ id: 'certification', label: 'Certification' }],
  },
]

function formatFileSize(bytes?: number): string {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes <= 0) return 'Unknown size'
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function toForcedDownloadUrl(url?: string): string {
  if (!url) return ''
  if (url.includes('/upload/fl_attachment/')) return url
  return url.replace('/upload/', '/upload/fl_attachment/')
}

function parseDurationToMinutes(duration?: string): number {
  if (!duration) return 0
  const text = String(duration).toLowerCase().trim()
  if (!text) return 0

  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|hr|h|minutes?|mins?|min|m)\b/g)]
  if (matches.length > 0) {
    return matches.reduce((total, match) => {
      const value = Number.parseFloat(match[1])
      const unit = match[2]
      if (!Number.isFinite(value)) return total
      if (unit.startsWith('h')) return total + value * 60
      return total + value
    }, 0)
  }

  // Fallback: if user entered only a number, treat it as minutes.
  const fallbackValue = Number.parseFloat(text.replace(/[^\d.]/g, ''))
  return Number.isFinite(fallbackValue) ? fallbackValue : 0
}

function formatMinutesAsLabel(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 mins'
  const rounded = Math.round(totalMinutes)
  const hours = Math.floor(rounded / 60)
  const minutes = rounded % 60
  if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} mins`
  if (hours > 0) return `${hours} hr${hours === 1 ? '' : 's'}`
  return `${minutes} min${minutes === 1 ? '' : 's'}`
}

interface ProposalDetailProps {
  proposal: ProposalResponse
  requirementId: string
  requirementSummary: {
    objective: string
    budget: string
    timeline: string
    location: string
  }
  isAccepted: boolean
  isModificationRequested: boolean
  isDeclined: boolean
  onAcceptProposal: () => Promise<void>
  onRequestModification: (message: string) => Promise<void>
  onDeclineProposal: (reason: string) => Promise<void>
  onBack: () => void
}

export default function ProposalDetail({
  proposal,
  requirementId,
  requirementSummary,
  isAccepted,
  isModificationRequested,
  isDeclined,
  onAcceptProposal,
  onRequestModification,
  onDeclineProposal,
  onBack,
}: ProposalDetailProps) {
  const navigate = useNavigate()
  const formData = proposal.formData || {}
  const measurableOutcomes = Array.isArray(formData.measurableOutcomes)
    ? formData.measurableOutcomes
    : []
  const deliverables = Array.isArray(formData.deliverablesSelected)
    ? formData.deliverablesSelected
    : []
  const deliverableFilesMap =
    formData.deliverableFiles && typeof formData.deliverableFiles === 'object'
      ? formData.deliverableFiles
      : {}
  const sessionStructure = Array.isArray(formData.sessionStructure)
    ? formData.sessionStructure
    : []
  const expertName = proposal.expert?.name || 'Expert'
  const initials = proposal.expert?.initials || 'EX'
  const responseWindow = '< 2 hours'
  const similarEngagements = (formData.similarEngagements || '').trim()
  const industryMatch = (formData.industryMatch || '').trim()
  const price = formatProposalPrice(formData.proposedFee)
  const numberedOutcomes = measurableOutcomes.length > 0
    ? measurableOutcomes
    : ['Outcomes will be refined after kickoff workshop']
  const durationMinutes = sessionStructure.reduce(
    (total, session) => total + parseDurationToMinutes(session.duration),
    0
  )
  const sessionDurationSummary = durationMinutes > 0
    ? `${formatMinutesAsLabel(durationMinutes)} across ${sessionStructure.length} segments`
    : `${sessionStructure.length} segments`
  const deliverableLines = deliverables.length > 0
    ? deliverables.map((value) => value.replace(/-/g, ' '))
    : ['Deliverables will be shared after scope confirmation.']
  const deliverablesByCategory = DELIVERABLES_BY_CATEGORY
    .map(({ category, items }) => ({
      category,
      items: items.filter((item) => deliverables.includes(item.id)),
    }))
    .filter((group) => group.items.length > 0)
  const handlePrint = () => {
    if (typeof window === 'undefined') return
    window.print()
  }
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showModificationModal, setShowModificationModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [modificationText, setModificationText] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [messageText, setMessageText] = useState('')
  const [actionPending, setActionPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const handleAcceptClick = () => {
    if (isAccepted) return
    setActionError(null)
    setShowAcceptModal(true)
  }
  const handleConfirmAccept = async () => {
    try {
      setActionPending(true)
      setActionError(null)
      await onAcceptProposal()
      setShowAcceptModal(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to accept proposal.')
    } finally {
      setActionPending(false)
    }
  }
  const handleRequestModification = () => {
    setActionError(null)
    setShowModificationModal(true)
  }
  const handleConfirmRequestModification = async () => {
    const message = modificationText.trim()
    if (!message) return
    try {
      setActionPending(true)
      setActionError(null)
      await onRequestModification(message)
      setShowModificationModal(false)
      setModificationText('')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to request modifications.')
    } finally {
      setActionPending(false)
    }
  }
  const handleDeclineClick = () => {
    if (isDeclined) return
    setActionError(null)
    setShowDeclineModal(true)
  }
  const handleConfirmDecline = async () => {
    const reason = declineReason.trim()
    if (!reason) return
    try {
      setActionPending(true)
      setActionError(null)
      await onDeclineProposal(reason)
      setShowDeclineModal(false)
      setDeclineReason('')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to decline proposal.')
    } finally {
      setActionPending(false)
    }
  }
  const handleMessageExpertClick = () => {
    setActionError(null)
    setShowMessageModal(true)
  }
  const handleConfirmSendMessage = async () => {
    const content = messageText.trim()
    const expertId = proposal.expert?.id
    if (!content) return
    if (!expertId) {
      setActionError('Expert not found for this proposal.')
      return
    }
    try {
      setActionPending(true)
      setActionError(null)
      await createOrGetConversation({
        expertId,
        requirementId,
        proposalId: proposal.id,
      }).then((res) => sendMessage(res.conversation.id, content))
      setShowMessageModal(false)
      setMessageText('')
      navigate(
        `/business/messages?expertId=${encodeURIComponent(expertId)}&requirementId=${encodeURIComponent(
          requirementId
        )}&proposalId=${encodeURIComponent(proposal.id)}`
      )
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to send message.')
    } finally {
      setActionPending(false)
    }
  }

  return (
    <>
      <div className="space-y-5 print:hidden">
        <nav className="text-sm text-gray-500">
        <button type="button" onClick={onBack} className="mr-2 text-[#0B1B3D] hover:underline">
          Requirements
        </button>
        <span>/</span>
        <span className="mx-2">{requirementSummary.objective}</span>
        <span>/</span>
        <span className="mx-2 text-gray-700">Proposal by {expertName}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-1 inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <span>←</span>
            <span className="text-4xl font-bold text-[#0B1B3D]">Proposal Details</span>
          </button>
          <p className="text-sm text-gray-500">Submitted for {requirementSummary.objective}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
          >
            Print
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">Share</button>
        </div>
      </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px] print:block">
        <div className="space-y-5">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#09163A] text-xl font-semibold text-white">
                  {initials}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#0B1B3D]">{expertName}</h3>
                  <p className="text-sm text-gray-500">AI & Digital Transformation Specialist</p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-semibold text-[#E6A900]">★</span> 4.9 (47 reviews)
                    <span className="mx-2 text-gray-300">|</span>125 projects completed
                    <span className="mx-2 text-gray-300">|</span>Responds in {responseWindow}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="mb-2 text-sm text-gray-500">Match Score</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-[#D8DEEA]">
                    <div className="h-2 rounded-full bg-[#0F1938]" style={{ width: '95%' }} />
                  </div>
                  <p className="text-3xl font-bold text-[#0EA5C4]">95%</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h4 className="text-2xl font-semibold text-[#0B1B3D]">Understanding of Your Requirement</h4>
            <p className="text-sm text-gray-500">How the expert understands your needs</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-800">
              {formData.understanding || '—'}
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h4 className="text-2xl font-semibold text-[#0B1B3D]">Outcome Plan</h4>
            <p className="text-sm text-gray-500">What will change and how</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-800">{formData.outcomePlan || '—'}</p>
            <h5 className="mt-6 text-xl font-semibold text-[#0B1B3D]">Measurable Outcomes</h5>
            <ul className="mt-3 space-y-3">
              {numberedOutcomes.map((outcome, index) => (
                <li key={`${outcome}-${index}`} className="flex items-start gap-3 text-sm text-gray-800">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#E7F6FA] text-xs font-semibold text-[#0EA5C4]">
                    {index + 1}
                  </span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </section>

          {sessionStructure.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h4 className="text-2xl font-semibold text-[#0B1B3D]">Session Structure</h4>
              <p className="text-sm text-gray-500">Detailed breakdown of how sessions will be organized</p>
              <div className="mt-4 space-y-3">
                {sessionStructure.map((session, index) => (
                  <div key={`${session.segmentTitle || index}`} className="rounded-xl border border-gray-200 bg-[#FAFBFC] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0EA5C4] text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-[#0B1B3D]">{session.segmentTitle || `Session ${index + 1}`}</p>
                        <p className="text-sm text-gray-500">
                          {session.duration || '—'} {session.type ? ` • ${session.type}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-[#A9DAE6] bg-[#F2FAFC] px-4 py-3 text-lg font-medium text-[#087A94]">
                Total Duration: {sessionDurationSummary}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h4 className="text-2xl font-semibold text-[#0B1B3D]">Deliverables</h4>
            <p className="text-sm text-gray-500">Tangible outputs and materials you&apos;ll receive</p>
            {deliverablesByCategory.length > 0 ? (
              <div className="mt-5 space-y-6">
                {deliverablesByCategory.map((group) => (
                  <div key={group.category}>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#A8DCE6]" />
                      <p className="text-2xl font-semibold text-[#0E94B0]">{group.category}</p>
                      <div className="h-px flex-1 bg-[#A8DCE6]" />
                    </div>

                    <div className="space-y-3">
                      {group.items.map((item) => {
                        const files = Array.isArray(deliverableFilesMap[item.id]) ? deliverableFilesMap[item.id] : []
                        return (
                          <div key={item.id} className="rounded-xl border border-[#D7DEE8] bg-[#F8FBFD] p-4">
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCF2F7] text-sm font-semibold text-[#0A9BBB]">
                                ✓
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-2xl font-semibold text-[#0B1B3D]">{item.label}</p>
                                {files.length > 0 ? (
                                  <p className="text-sm text-gray-500">{files.length} sample file(s) attached</p>
                                ) : (
                                  <p className="text-sm text-gray-500">Will be provided after engagement</p>
                                )}
                              </div>
                            </div>

                            {files.length > 0 && (
                              <div className="mt-3 space-y-2 pl-12">
                                {files.map((file, fileIndex) => (
                                  <div
                                    key={`${file.url}-${fileIndex}`}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D7DEE8] bg-white px-4 py-3"
                                  >
                                    <div className="min-w-0 flex items-center gap-3">
                                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCF2F7] text-[#0A9BBB]">
                                        📄
                                      </span>
                                      <div className="min-w-0">
                                        <p className="truncate text-xl font-semibold text-[#0B1B3D]">
                                          {file.originalName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {formatFileSize(file.size)} • Sample
                                        </p>
                                      </div>
                                    </div>

                                    <a
                                      href={file.downloadUrl || toForcedDownloadUrl(file.url) || file.url}
                                      rel="noreferrer"
                                      download={file.originalName}
                                      className="inline-flex items-center gap-2 text-xl font-semibold text-[#0B1B3D] hover:underline"
                                    >
                                      <span className="text-lg">⇩</span>
                                      Download
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-gray-200 bg-[#FAFBFC] px-4 py-3">
                <p className="text-sm text-gray-600">Deliverables will be shared after scope confirmation.</p>
              </div>
            )}
          </section>

          {(similarEngagements || industryMatch) && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h4 className="text-2xl font-semibold text-[#0B1B3D]">Experience Relevance</h4>
              <p className="text-sm text-gray-500">Why this expert is the right fit</p>
              {similarEngagements && (
                <div className="mt-5">
                  <h5 className="text-xl font-semibold text-[#0B1B3D]">Similar Engagements</h5>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-800">{similarEngagements}</p>
                </div>
              )}
              {industryMatch && (
                <div className="mt-4">
                  <h5 className="text-xl font-semibold text-[#0B1B3D]">Industry Match</h5>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-800">{industryMatch}</p>
                </div>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h4 className="text-2xl font-semibold text-[#0B1B3D]">Pricing</h4>
            <p className="text-sm text-gray-500">Investment required for this engagement</p>
            <div className="mt-4 rounded-xl border border-[#AEDDEA] bg-[#F2FAFC] px-4 py-4">
              <p className="text-sm text-gray-600">Proposed Fee</p>
              <p className="text-5xl font-bold text-[#0C95B0]">{price}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#DDF3E4] px-3 py-1 text-sm font-semibold text-[#1E8D51]">Within Budget</span>
                <span className="text-sm text-gray-600">Your budget: {requirementSummary.budget}</span>
              </div>
            </div>
            {formData.feeBreakdown && (
              <div className="mt-4">
                <h5 className="mb-2 text-xl font-semibold text-[#0B1B3D]">Fee Breakdown</h5>
                <div className="rounded-xl border border-gray-200 bg-[#FAFBFC] px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800">{formData.feeBreakdown}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 print:hidden">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h4 className="mb-3 text-xl font-semibold text-[#0B1B3D]">Take Action</h4>
            <button
              type="button"
              disabled={isAccepted}
              onClick={handleAcceptClick}
              className={`mb-2 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white ${
                isAccepted ? 'cursor-not-allowed bg-[#1E8D51]' : 'bg-[#0EA5C4] hover:opacity-90'
              }`}
            >
              {isAccepted ? 'Accepted' : 'Accept Proposal'}
            </button>
            <button
              type="button"
              onClick={handleMessageExpertClick}
              className="mb-2 inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#0B1B3D] hover:bg-gray-50"
            >
              Message Expert
            </button>
            <button
              type="button"
              onClick={handleRequestModification}
              className="mb-2 inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#0B1B3D] hover:bg-gray-50"
            >
              {isModificationRequested ? 'Modification Requested' : 'Request Modifications'}
            </button>
            <button
              type="button"
              disabled={isDeclined}
              onClick={handleDeclineClick}
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#E6C8C8] bg-white px-3 py-2 text-sm font-medium text-[#B34E4E] hover:bg-red-50"
            >
              {isDeclined ? 'Declined' : 'Decline'}
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h4 className="mb-2 text-lg font-semibold text-[#0B1B3D]">Your Requirement</h4>
            <dl className="space-y-2 text-sm text-gray-600">
              <div>
                <dt className="font-medium text-[#0B1B3D]">Objective</dt>
                <dd>{requirementSummary.objective}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#0B1B3D]">Budget</dt>
                <dd>{requirementSummary.budget}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#0B1B3D]">Timeline</dt>
                <dd>{requirementSummary.timeline}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#0B1B3D]">Location</dt>
                <dd>{requirementSummary.location}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h4 className="mb-2 text-lg font-semibold text-[#0B1B3D]">Key Strengths</h4>
            <ul className="space-y-2">
              {numberedOutcomes.slice(0, 4).map((outcome, index) => (
                <li key={`${outcome}-${index}`} className="text-sm text-gray-700">
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#CBE7EC] bg-[#F2FAFC] p-4">
            <h4 className="mb-2 text-lg font-semibold text-[#0B1B3D]">AI Insight</h4>
            <p className="text-sm text-[#3E6A73]">
              This proposal demonstrates strong alignment with your requirements. Outcomes are
              specific, measurable, and achievable within your timeline.
            </p>
          </div>
        </aside>
        </div>
      </div>

      <article className="hidden print:block print:text-black">
        <h1 className="mb-4 text-2xl font-bold">Proposal Details</h1>
        <p className="mb-6 text-sm">Proposal by {expertName}</p>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Understanding of Your Requirement</h2>
          <p className="whitespace-pre-wrap text-sm leading-6">{formData.understanding || '—'}</p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Outcome Plan</h2>
          <p className="whitespace-pre-wrap text-sm leading-6">{formData.outcomePlan || '—'}</p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Measurable Outcomes</h2>
          <ul className="list-decimal space-y-1 pl-5 text-sm leading-6">
            {numberedOutcomes.map((outcome, index) => (
              <li key={`${outcome}-${index}`}>{outcome}</li>
            ))}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Session Structure</h2>
          {sessionStructure.length > 0 ? (
            <>
              <ul className="list-decimal space-y-1 pl-5 text-sm leading-6">
                {sessionStructure.map((session, index) => (
                  <li key={`${session.segmentTitle || index}`}>
                    <span className="font-medium">{session.segmentTitle || `Session ${index + 1}`}</span>
                    <span className="text-gray-700">
                      {' '}
                      - {session.duration || '—'}
                      {session.type ? ` (${session.type})` : ''}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-medium">Total Duration: {sessionDurationSummary}</p>
            </>
          ) : (
            <p className="text-sm">—</p>
          )}
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Deliverables</h2>
          {deliverables.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
              {deliverables.map((deliverable) => (
                <li key={deliverable}>
                  {deliverable.replace(/-/g, ' ')}
                  {Array.isArray(deliverableFilesMap[deliverable]) &&
                    deliverableFilesMap[deliverable].length > 0 && (
                      <ul className="ml-5 mt-1 list-disc">
                        {deliverableFilesMap[deliverable].map((file, fileIndex) => (
                          <li key={`${file.url}-${fileIndex}`}>
                            {file.originalName} ({file.url})
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
              {deliverableLines.map((line, index) => (
                <li key={`${line}-${index}`}>{line}</li>
              ))}
            </ul>
          )}
        </section>

        {(similarEngagements || industryMatch) && (
          <section className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Experience Relevance</h2>
            {similarEngagements && (
              <div className="mb-3">
                <h3 className="font-medium">Similar Engagements</h3>
                <p className="whitespace-pre-wrap text-sm leading-6">{similarEngagements}</p>
              </div>
            )}
            {industryMatch && (
              <div>
                <h3 className="font-medium">Industry Match</h3>
                <p className="whitespace-pre-wrap text-sm leading-6">{industryMatch}</p>
              </div>
            )}
          </section>
        )}

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Pricing</h2>
          <p className="text-sm">
            <span className="font-medium">Proposed Fee:</span> {price}
          </p>
          <p className="text-sm">
            <span className="font-medium">Your budget:</span> {requirementSummary.budget}
          </p>
          {formData.feeBreakdown && (
            <div className="mt-3">
              <h3 className="font-medium">Fee Breakdown</h3>
              <p className="whitespace-pre-wrap text-sm leading-6">{formData.feeBreakdown}</p>
            </div>
          )}
        </section>
      </article>

      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-xl font-semibold text-[#0B1B3D]">Accept Proposal</h3>
              <button
                type="button"
                onClick={() => setShowAcceptModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to accept this proposal from {expertName}?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAcceptModal(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                disabled={actionPending}
                className="rounded-lg bg-[#0F1938] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {actionPending ? 'Accepting...' : 'Accept'}
              </button>
            </div>
            {actionError && <p className="mt-2 text-sm text-red-600">{actionError}</p>}
          </div>
        </div>
      )}

      {showModificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-xl font-semibold text-[#0B1B3D]">Request Modifications</h3>
              <button
                type="button"
                onClick={() => setShowModificationModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Specify the modifications you&apos;d like to request from {expertName}.
            </p>
            <label htmlFor="modification-details" className="mt-3 block text-sm font-medium text-[#0B1B3D]">
              Modification Details
            </label>
            <textarea
              id="modification-details"
              value={modificationText}
              onChange={(event) => setModificationText(event.target.value)}
              placeholder="Type your modification details here..."
              className="mt-2 h-32 w-full resize-none rounded-lg border border-[#66C8D8] px-3 py-2 text-sm text-gray-700 outline-none ring-0 focus:border-[#0EA5C4]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModificationModal(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRequestModification}
                disabled={!modificationText.trim() || actionPending}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  modificationText.trim() && !actionPending
                    ? 'bg-[#0F1938] hover:opacity-90'
                    : 'cursor-not-allowed bg-[#9AA3B2]'
                }`}
              >
                {actionPending ? 'Submitting...' : 'Request Modifications'}
              </button>
            </div>
            {actionError && <p className="mt-2 text-sm text-red-600">{actionError}</p>}
          </div>
        </div>
      )}

      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-xl font-semibold text-[#0B1B3D]">Decline Proposal</h3>
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Provide a reason for declining this proposal from {expertName}.
            </p>
            <label htmlFor="decline-reason" className="mt-3 block text-sm font-medium text-[#0B1B3D]">
              Reason for Declining
            </label>
            <textarea
              id="decline-reason"
              value={declineReason}
              onChange={(event) => setDeclineReason(event.target.value)}
              placeholder="Type your reason for declining here..."
              className="mt-2 h-32 w-full resize-none rounded-lg border border-[#66C8D8] px-3 py-2 text-sm text-gray-700 outline-none ring-0 focus:border-[#0EA5C4]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={!declineReason.trim() || actionPending}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  declineReason.trim() && !actionPending
                    ? 'bg-[#0F1938] hover:opacity-90'
                    : 'cursor-not-allowed bg-[#9AA3B2]'
                }`}
              >
                {actionPending ? 'Declining...' : 'Decline'}
              </button>
            </div>
            {actionError && <p className="mt-2 text-sm text-red-600">{actionError}</p>}
          </div>
        </div>
      )}

      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-xl font-semibold text-[#0B1B3D]">Message Expert</h3>
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Send a message to {expertName} regarding this proposal.
            </p>
            <label htmlFor="message-expert" className="mt-3 block text-sm font-medium text-[#0B1B3D]">
              Message
            </label>
            <textarea
              id="message-expert"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Type your message here..."
              className="mt-2 h-32 w-full resize-none rounded-lg border border-[#66C8D8] px-3 py-2 text-sm text-gray-700 outline-none ring-0 focus:border-[#0EA5C4]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSendMessage}
                disabled={!messageText.trim() || actionPending}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  messageText.trim() && !actionPending
                    ? 'bg-[#0F1938] hover:opacity-90'
                    : 'cursor-not-allowed bg-[#9AA3B2]'
                }`}
              >
                {actionPending ? 'Sending...' : 'Send'}
              </button>
            </div>
            {actionError && <p className="mt-2 text-sm text-red-600">{actionError}</p>}
          </div>
        </div>
      )}
    </>
  )
}
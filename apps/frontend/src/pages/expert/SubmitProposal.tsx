import { useRef, useState } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarItems, expertSidebarBottomItems } from '../../config/expertNav'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import { submitProposal } from '../../api/proposals'

const TEAL = '#008C9E'

const SESSION_TYPE_OPTIONS = [
  'Lecture',
  'Interactive Workshop',
  'Group Discussion',
  'Case Study',
  'Hands-on Practice',
  'Q&A Session',
  'Assessment',
  'Breakout Session',
  'Role-playing',
  'Simulation',
]

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

type SessionSegment = { segmentTitle: string; duration: string; type: string }
type DeliverableFilesById = Record<string, File[]>

export function SubmitProposal() {
  const { opportunityId } = useParams<{ opportunityId: string }>()
  const location = useLocation()
  const state = (location.state as { title?: string; company?: string }) || {}
  const opportunityTitle = state.title || 'Opportunity'
  const companyName = state.company || 'Company'

  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe' : 'John Doe')

  const [understanding, setUnderstanding] = useState('')
  const [outcomePlan, setOutcomePlan] = useState('')
  const [measurableOutcomeInput, setMeasurableOutcomeInput] = useState('')
  const [measurableOutcomes, setMeasurableOutcomes] = useState<string[]>([])
  const [currentSessionSegment, setCurrentSessionSegment] = useState<SessionSegment>({ segmentTitle: '', duration: '', type: '' })
  const [addedSessionSegments, setAddedSessionSegments] = useState<SessionSegment[]>([])
  const [deliverablesSelected, setDeliverablesSelected] = useState<Set<string>>(new Set())
  const [deliverableFilesById, setDeliverableFilesById] = useState<DeliverableFilesById>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [similarEngagements, setSimilarEngagements] = useState('')
  const [industryMatch, setIndustryMatch] = useState('')
  const [proposedFee, setProposedFee] = useState('200000')
  const [feeBreakdown, setFeeBreakdown] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()

  const buildFormData = () => ({
    understanding: understanding || undefined,
    outcomePlan: outcomePlan || undefined,
    measurableOutcomes: measurableOutcomes.length > 0 ? measurableOutcomes : undefined,
    sessionStructure: addedSessionSegments.length > 0 ? addedSessionSegments : undefined,
    deliverablesSelected: deliverablesSelected.size > 0 ? Array.from(deliverablesSelected) : undefined,
    similarEngagements: similarEngagements || undefined,
    industryMatch: industryMatch || undefined,
    proposedFee: proposedFee || undefined,
    feeBreakdown: feeBreakdown || undefined,
  })

  const handleSaveOrSubmit = async (status: 'draft' | 'submitted') => {
    if (!opportunityId) {
      setSubmitError('Opportunity not found.')
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      const res = await submitProposal({
        requirementId: opportunityId,
        status,
        formData: buildFormData(),
        deliverableFilesById,
      })
      if (res.success && res.proposal) {
        if (status === 'submitted') {
          navigate('/expert/browse', { state: { message: 'Proposal submitted successfully.' } })
        } else {
          setSubmitError(null)
          // Stay on page; draft saved
          setSubmitting(false)
        }
      } else {
        setSubmitError((res as { error?: string }).error ?? 'Failed to save.')
        setSubmitting(false)
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save proposal.')
      setSubmitting(false)
    }
  }

  const addMeasurableOutcome = () => {
    const value = measurableOutcomeInput.trim()
    if (!value) return
    setMeasurableOutcomes((prev) => [...prev, value])
    setMeasurableOutcomeInput('')
  }

  const removeMeasurableOutcome = (index: number) => {
    setMeasurableOutcomes((prev) => prev.filter((_, i) => i !== index))
  }

  const addSessionSegment = () => {
    const { segmentTitle, duration, type } = currentSessionSegment
    if (!segmentTitle.trim() && !duration.trim() && !type) return
    setAddedSessionSegments((prev) => [...prev, { segmentTitle: segmentTitle || 'Segment', duration: duration || '—', type: type || '—' }])
    setCurrentSessionSegment({ segmentTitle: '', duration: '', type: '' })
  }

  const removeSessionSegment = (index: number) => {
    setAddedSessionSegments((prev) => prev.filter((_, i) => i !== index))
  }

  const updateCurrentSessionSegment = (field: keyof SessionSegment, value: string) => {
    setCurrentSessionSegment((prev) => ({ ...prev, [field]: value }))
  }

  const toggleDeliverable = (id: string) => {
    setDeliverablesSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setDeliverableFilesById((current) => {
          const nextFiles = { ...current }
          delete nextFiles[id]
          return nextFiles
        })
      } else next.add(id)
      return next
    })
  }
  const openFilePicker = (deliverableId: string) => {
    fileInputRefs.current[deliverableId]?.click()
  }
  const addDeliverableFiles = (deliverableId: string, incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return
    const files = Array.from(incoming)
    setDeliverableFilesById((current) => {
      const existing = current[deliverableId] ?? []
      const seen = new Set(existing.map((file) => `${file.name}::${file.size}::${file.lastModified}`))
      const merged = [...existing]
      files.forEach((file) => {
        const key = `${file.name}::${file.size}::${file.lastModified}`
        if (seen.has(key)) return
        seen.add(key)
        merged.push(file)
      })
      return { ...current, [deliverableId]: merged }
    })
  }
  const removeDeliverableFile = (deliverableId: string, fileIndex: number) => {
    setDeliverableFilesById((current) => {
      const existing = current[deliverableId] ?? []
      const nextList = existing.filter((_, index) => index !== fileIndex)
      if (nextList.length === 0) {
        const nextMap = { ...current }
        delete nextMap[deliverableId]
        return nextMap
      }
      return { ...current, [deliverableId]: nextList }
    })
  }

  const cardClass = 'bg-white rounded-2xl shadow-md p-6'
  const inputClass = 'w-full rounded-lg border border-gray-200 bg-[#F8FAFC] px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008C9E]/20 focus:border-[#008C9E]'
  const labelClass = 'block text-sm font-semibold text-gray-900 mb-1.5'
  const iconWrapClass = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full'
  const iconWrapStyle = { backgroundColor: '#E0F7FA' }
  const iconColorStyle = { color: '#2293B4' }

  return (
    <DashboardLayout
      sidebarItems={expertSidebarItems}
      sidebarBottomItems={expertSidebarBottomItems}
      userTypeLabel="Expert"
      userDisplayName={displayName}
      userSubLabel="Expert"
      accentColor="green"
      mainClassName="px-0 bg-[#F0F2F5]"
    >
      {/* Full-width light grey background: single scroll with main content area */}
      <div className="w-full pb-24 bg-[#F0F2F5]">
        <div className="max-w-3xl mx-auto px-6">
        {/* Page title */}
        <div className="pt-6 mb-6">
          <Link
            to={opportunityId ? `/expert/browse` : '/expert/browse'}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <span className="text-lg">←</span>
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Submit Proposal</h1>
          <p className="text-sm text-gray-500 mt-0.5">{opportunityTitle} • {companyName}</p>
        </div>

        {/* Understanding of Requirement */}
        <div className={`${cardClass} mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={iconWrapClass} style={iconWrapStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconColorStyle}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-gray-900">Understanding of Requirement</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Briefly explain how you understand the client&apos;s needs</p>
          <textarea
            value={understanding}
            onChange={(e) => setUnderstanding(e.target.value)}
            placeholder="I understand that you're looking to..."
            rows={4}
            className={inputClass}
          />
        </div>

        {/* Outcome Plan */}
        <div className={`${cardClass} mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={iconWrapClass} style={iconWrapStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconColorStyle}>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-gray-900">Outcome Plan</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">What will change? Describe the transformation</p>
          <textarea
            value={outcomePlan}
            onChange={(e) => setOutcomePlan(e.target.value)}
            placeholder="After this engagement, your team will be able to..."
            rows={4}
            className={`${inputClass} mb-5`}
          />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Measurable Outcomes</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={measurableOutcomeInput}
              onChange={(e) => setMeasurableOutcomeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMeasurableOutcome())}
              placeholder="e.g., 30% increase in productivity"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addMeasurableOutcome}
              className="shrink-0 w-10 h-10 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-gray-800 font-medium text-lg"
            >
              +
            </button>
          </div>
          {measurableOutcomes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {measurableOutcomes.map((value, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-[#e8e8e8] px-3 py-1.5 text-sm font-medium text-gray-900"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => removeMeasurableOutcome(index)}
                    className="ml-0.5 rounded p-0.5 text-gray-600 hover:bg-gray-300 hover:text-gray-900"
                    aria-label="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Session Structure */}
        <div className={`${cardClass} mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={iconWrapClass} style={iconWrapStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconColorStyle}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-gray-900">Session Structure</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Break down how you&apos;ll structure the sessions.</p>
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div className="flex-1 min-w-[140px]">
              <label className={labelClass}>Segment title</label>
              <input
                type="text"
                value={currentSessionSegment.segmentTitle}
                onChange={(e) => updateCurrentSessionSegment('segmentTitle', e.target.value)}
                placeholder="Segment title"
                className={inputClass}
              />
            </div>
            <div className="w-40">
              <label className={labelClass}>Duration</label>
              <input
                type="text"
                value={currentSessionSegment.duration}
                onChange={(e) => updateCurrentSessionSegment('duration', e.target.value)}
                placeholder="Duration (e.g., 2 hours)"
                className={inputClass}
              />
            </div>
            <div className="w-44">
              <label className={labelClass}>Type</label>
              <select
                value={currentSessionSegment.type}
                onChange={(e) => updateCurrentSessionSegment('type', e.target.value)}
                className={inputClass}
              >
                <option value="">Type</option>
                {SESSION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={addSessionSegment}
              className="shrink-0 w-10 h-10 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-gray-800 font-medium text-lg mb-0.5"
            >
              +
            </button>
          </div>
          {addedSessionSegments.length > 0 && (
            <div className="space-y-3">
              {addedSessionSegments.map((seg, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: TEAL }}>
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{seg.segmentTitle}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{seg.duration} • {seg.type}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSessionSegment(index)}
                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Remove segment"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deliverables */}
        <div className={`${cardClass} mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={iconWrapClass} style={iconWrapStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconColorStyle}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-gray-900">Deliverables</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">What tangible outputs do you provide to your clients? (Select all that apply).</p>
          {DELIVERABLES_BY_CATEGORY.map(({ category, items }) => (
            <div key={category} className="mb-5">
              <div className="border-b border-gray-200 mb-3">
                <h3 className="text-sm font-semibold pb-2 inline-block" style={{ color: '#2293B4' }}>{category}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map(({ id, label }) => {
                  const isSelected = deliverablesSelected.has(id)
                  return (
                    <div
                      key={id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleDeliverable(id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleDeliverable(id)
                        }
                      }}
                      className={`inline-flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-colors select-none ${
                        isSelected
                          ? 'border-[#008C9E] bg-[#E0F7FA] text-[#006B7D]'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                        isSelected ? 'border-[#008C9E] bg-[#008C9E]' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Upload Sample Deliverables - only when at least one deliverable is selected */}
        {deliverablesSelected.size > 0 && (
          <div className={`${cardClass} mb-6`}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Upload Sample Deliverables</h2>
            <p className="text-sm text-gray-600 mb-5">Upload examples or templates of the deliverables you&apos;ll provide to help the client understand what to expect.</p>
            <div className="space-y-4">
              {DELIVERABLES_BY_CATEGORY.flatMap(({ items }) => items).filter(({ id }) => deliverablesSelected.has(id)).map(({ id, label }) => (
                <div key={id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={iconWrapClass} style={iconWrapStyle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconColorStyle}>
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">
                          {(deliverableFilesById[id]?.length ?? 0)} file{(deliverableFilesById[id]?.length ?? 0) === 1 ? '' : 's'} uploaded
                        </p>
                      </div>
                    </div>
                    <input
                      ref={(el) => {
                        fileInputRefs.current[id] = el
                      }}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        addDeliverableFiles(id, e.target.files)
                        e.currentTarget.value = ''
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => openFilePicker(id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Upload Files
                    </button>
                  </div>
                  {deliverableFilesById[id]?.length ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-3">
                      <ul className="space-y-2">
                        {deliverableFilesById[id].map((file, fileIndex) => (
                          <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-[#F8FAFC] px-3 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
                              <p className="text-xs text-gray-500">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDeliverableFile(id, fileIndex)}
                              className="shrink-0 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-8 px-4 text-center">
                      <svg className="mx-auto mb-2 w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700">No files uploaded yet</p>
                      <p className="text-xs text-gray-500 mt-1">Click &apos;Upload Files&apos; to add examples</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Relevance */}
        <div className={`${cardClass} mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={iconWrapClass} style={iconWrapStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconColorStyle}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-gray-900">Experience Relevance</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Show why you&apos;re the right fit</p>
          <div className="mb-4">
            <label className={labelClass}>Similar Engagements</label>
            <textarea
              value={similarEngagements}
              onChange={(e) => setSimilarEngagements(e.target.value)}
              placeholder="Describe 2-3 similar projects you've completed..."
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Industry Match</label>
            <textarea
              value={industryMatch}
              onChange={(e) => setIndustryMatch(e.target.value)}
              placeholder="How your experience aligns with their industry..."
              rows={3}
              className={inputClass}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className={`${cardClass} mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={iconWrapClass} style={iconWrapStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconColorStyle}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-gray-900">Pricing</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Your proposed fee for this engagement</p>
          <div className="mb-4">
            <label className={labelClass}>Proposed Fee (₹)</label>
            <input
              type="number"
              value={proposedFee}
              onChange={(e) => setProposedFee(e.target.value)}
              className={inputClass}
              min={0}
            />
          </div>
          <div>
            <label className={labelClass}>Fee Breakdown (optional)</label>
            <input
              type="text"
              value={feeBreakdown}
              onChange={(e) => setFeeBreakdown(e.target.value)}
              placeholder="e.g., Session fees: ₹150,000 | Materials: ₹30,000 | Follow-up: ₹20,000"
              className={inputClass}
            />
          </div>
        </div>

        </div>
        {/* Footer actions */}
        <div className="fixed bottom-0 left-56 right-0 border-t border-gray-200 bg-white py-4 z-40">
          <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
            {submitError && (
              <p className="w-full text-sm text-red-600 mb-1" role="alert">{submitError}</p>
            )}
            <button
              type="button"
              disabled={submitting || !opportunityId}
              onClick={() => handleSaveOrSubmit('draft')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? 'Saving…' : 'Save as Draft'}
            </button>
            <button
              type="button"
              disabled={submitting || !opportunityId}
              onClick={() => handleSaveOrSubmit('submitted')}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
              style={{ backgroundColor: TEAL }}
            >
              Submit Proposal
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

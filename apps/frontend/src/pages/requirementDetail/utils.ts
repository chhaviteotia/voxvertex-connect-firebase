import type { RequirementResponse } from '../../api/requirements'

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

export type RequirementStatusLabel = 'Draft' | 'Active'

export interface RequirementViewModel {
  title: string
  status: RequirementStatusLabel
  createdLabel: string
  summary: {
    objective: string
    budget: string
    timeline: string
    location: string
  }
  objective: {
    primaryFocus: string
    problemStatement: string
    desiredTransformation: string
    measurableOutcomes: string[]
  }
  audience: {
    roles: string
    seniority: string
    size: string
    industry: string
  }
  logistics: {
    type: string
    mode: string
    duration: string
    sessions: string
    timeline: string
    location: string
  }
  commercial: {
    budget: string
    flexibility: string
    paymentTerms: string
  }
}

interface SessionSegment {
  segmentTitle?: string
  duration?: string
  type?: string
}

interface RequirementFormData {
  selectedOutcome?: string
  audienceSelected?: string[]
  successMetrics?: string
  problemStatement?: string
  problemType?: string
  skillType?: string
  skillDomain?: string
  desiredTransformation?: string
  targetBehavior?: string
  measurableOutcomes?: string[]
  senioritySelected?: string[]
  audienceSize?: string
  industrySelected?: string[]
  engagementTypeSelected?: string
  totalDurationMinutes?: string
  totalSessions?: string
  preferredStartDate?: string
  preferredEndDate?: string
  deliveryModeSelected?: string
  city?: string
  stateRegion?: string
  state?: string
  country?: string
  minBudget?: number
  maxBudget?: number
  paymentTermSelected?: string
  budgetFlexibility?: string
  sessionStructure?: SessionSegment[]
}

function toTitleCase(value: string): string {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatCreated(createdAt: string): string {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (days === 0) return 'Created today'
  if (days === 1) return 'Created 1 day ago'
  if (days < 7) return `Created ${days} days ago`
  return `Created ${date.toLocaleDateString()}`
}

export function formatSubmitted(createdAt: string): string {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / (60 * 60 * 1000))
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

export function formatProposalPrice(proposedFee?: string): string {
  if (!proposedFee) return '—'
  const numeric = Number(proposedFee)
  if (Number.isNaN(numeric)) return proposedFee
  return `₹${numeric.toLocaleString('en-IN')}`
}

function formatDateInput(value: string): string {
  if (!value || !value.match(/^\d{4}-\d{2}-\d{2}/)) return ''
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

function getTitleFromFormData(formData: RequirementFormData): string {
  const outcome = formData.selectedOutcome
  if (outcome && OUTCOME_TITLES[outcome]) return OUTCOME_TITLES[outcome]
  if (Array.isArray(formData.audienceSelected) && formData.audienceSelected.length > 0) {
    return `${formData.audienceSelected.slice(0, 2).join(', ')} engagement`
  }
  return 'Expert requirement'
}

function parseDurationLabel(totalDurationMinutes?: string): string {
  if (!totalDurationMinutes) return '—'
  const minutes = parseInt(totalDurationMinutes, 10)
  if (Number.isNaN(minutes) || minutes <= 0) return '—'
  if (minutes >= 480) return 'Full day (8 hours)'
  if (minutes >= 60) return `${Math.round(minutes / 60)} hours`
  return `${minutes} min`
}

export function buildRequirementViewModel(requirement: RequirementResponse): RequirementViewModel {
  const formData = (requirement.formData || {}) as RequirementFormData
  const title = getTitleFromFormData(formData)
  const status: RequirementStatusLabel = requirement.status === 'draft' ? 'Draft' : 'Active'
  const createdLabel = formatCreated(requirement.createdAt)

  const successMetrics = formData.successMetrics || ''
  const measurableOutcomes =
    Array.isArray(formData.measurableOutcomes) && formData.measurableOutcomes.length > 0
      ? formData.measurableOutcomes
      : successMetrics
        ? successMetrics
            .split(/\n/)
            .map((value) => value.trim())
            .filter(Boolean)
        : []

  const primaryFocus =
    formData.selectedOutcome && OUTCOME_TITLES[formData.selectedOutcome]
      ? OUTCOME_TITLES[formData.selectedOutcome]
      : '—'

  const problemStatement =
    formData.problemStatement ||
    formData.problemType ||
    (formData.skillType
      ? `Skill type: ${formData.skillType}${formData.skillDomain ? `, Domain: ${formData.skillDomain}` : ''}`
      : '') ||
    (successMetrics
      ? successMetrics.slice(0, 300) + (successMetrics.length > 300 ? '…' : '')
      : '') ||
    '—'

  const desiredTransformation =
    formData.desiredTransformation ||
    formData.targetBehavior ||
    formData.skillDomain ||
    successMetrics ||
    '—'

  const timeline = [formatDateInput(formData.preferredStartDate || ''), formatDateInput(formData.preferredEndDate || '')]
    .filter(Boolean)
    .join(' – ') || '—'

  const location = [formData.city, formData.stateRegion || formData.state, formData.country]
    .filter(Boolean)
    .join(', ') || '—'

  const minBudget = typeof formData.minBudget === 'number' ? formData.minBudget : 0
  const maxBudget = typeof formData.maxBudget === 'number' ? formData.maxBudget : 0
  const budget =
    minBudget > 0 || maxBudget > 0
      ? `₹${Number(minBudget).toLocaleString('en-IN')} - ₹${Number(maxBudget).toLocaleString('en-IN')}`
      : '—'

  return {
    title,
    status,
    createdLabel,
    summary: {
      objective: primaryFocus,
      budget,
      timeline,
      location,
    },
    objective: {
      primaryFocus,
      problemStatement,
      desiredTransformation,
      measurableOutcomes,
    },
    audience: {
      roles: (formData.audienceSelected || []).join(', ') || '—',
      seniority: (formData.senioritySelected || []).join(', ') || '—',
      size: formData.audienceSize || '—',
      industry: (formData.industrySelected || []).join(', ') || '—',
    },
    logistics: {
      type: formData.engagementTypeSelected ? toTitleCase(formData.engagementTypeSelected) : '—',
      mode: formData.deliveryModeSelected ? toTitleCase(formData.deliveryModeSelected) : '—',
      duration: parseDurationLabel(formData.totalDurationMinutes),
      sessions: formData.totalSessions || '1',
      timeline,
      location,
    },
    commercial: {
      budget,
      flexibility: formData.budgetFlexibility ? toTitleCase(formData.budgetFlexibility) : '—',
      paymentTerms: formData.paymentTermSelected ? formData.paymentTermSelected.replace(/-/g, ' ') : '—',
    },
  }
}

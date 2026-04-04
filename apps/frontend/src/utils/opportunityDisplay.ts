import type { OpportunityItem } from '../api/expertOpportunities'

/** Shared with business requirement / expert browse for consistent titles */
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

export function getTitleFromOpportunityFormData(formData: Record<string, unknown>): string {
  const outcome = formData?.selectedOutcome as string | undefined
  if (outcome && OUTCOME_TITLES[outcome]) return OUTCOME_TITLES[outcome]
  const objective = (formData?.objective as string | undefined)?.trim()
  if (objective) return objective
  const audience = formData?.audienceSelected as string[] | undefined
  if (Array.isArray(audience) && audience.length > 0) return `${audience.slice(0, 2).join(', ')} engagement`
  return 'Expert requirement'
}

function toTitleCase(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatOpportunityTimeAgo(createdAt: string): string {
  const d = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

/** Fields needed for expert dashboard “matched opportunity” cards and browse-style rows */
export function mapOpportunityItemToCard(
  item: OpportunityItem,
  options?: { matchPercent?: number }
): {
  id: string
  title: string
  company: string
  match: number
  timeAgo: string
  objective: string
  audience: string
  type: string
  budget: string
} {
  const fd = item.formData as Record<string, unknown>
  const selectedOutcome = (fd.selectedOutcome as string) || ''
  const audienceArr = (fd.audienceSelected as string[]) || []
  const engagementType = (fd.engagementTypeSelected as string) || ''
  const totalDurationMinutes = (fd.totalDurationMinutes as string) || ''
  const totalSessions = (fd.totalSessions as string) || '1'
  const minBudget = typeof fd.minBudget === 'number' ? fd.minBudget : 0
  const maxBudget = typeof fd.maxBudget === 'number' ? fd.maxBudget : 0

  const objective = selectedOutcome ? toTitleCase(selectedOutcome) : '—'
  const audience = audienceArr.length > 0 ? audienceArr.slice(0, 3).join(', ') : '—'
  let type = engagementType ? toTitleCase(engagementType) : '—'
  if (totalDurationMinutes) {
    const mins = parseInt(totalDurationMinutes, 10)
    if (Number.isFinite(mins) && mins >= 60) type += ` • ${Math.round(mins / 60)} hrs`
    else if (Number.isFinite(mins)) type += ` • ${mins} min`
  }
  if (totalSessions && totalSessions !== '1') type += ` • ${totalSessions} sessions`

  let budget = '—'
  if (minBudget > 0 || maxBudget > 0) {
    budget = `₹${minBudget.toLocaleString('en-IN')} - ₹${maxBudget.toLocaleString('en-IN')}`
  }

  const title = getTitleFromOpportunityFormData(fd)
  const match =
    typeof options?.matchPercent === 'number' && Number.isFinite(options.matchPercent)
      ? Math.min(99, Math.max(0, Math.round(options.matchPercent)))
      : 0

  return {
    id: item.id,
    title,
    company: item.companyName || 'Company',
    match,
    timeAgo: formatOpportunityTimeAgo(item.createdAt),
    objective,
    audience,
    type,
    budget,
  }
}

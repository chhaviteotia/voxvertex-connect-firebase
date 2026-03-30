import type { ExpertProfileData } from '../api/expertProfile'

export type ExpertSectionId =
  | 'identity'
  | 'capability'
  | 'experience'
  | 'delivery'
  | 'pricing'
  | 'availability'

export const EXPERT_SECTION_WEIGHTS: Record<ExpertSectionId, number> = {
  identity: 15,
  capability: 25,
  experience: 25,
  delivery: 15,
  pricing: 10,
  availability: 10,
}

export const EXPERT_SECTION_LABELS: Record<ExpertSectionId, string> = {
  identity: 'Identity',
  capability: 'Capability',
  experience: 'Experience',
  delivery: 'Delivery Model',
  pricing: 'Pricing',
  availability: 'Availability',
}

export type ExpertCompletion = {
  percent: number
  completed: Record<ExpertSectionId, boolean>
  missingSections: ExpertSectionId[]
}

const hasText = (value?: string) => Boolean(value && value.trim())
const hasAny = (list?: string[]) => (list?.length ?? 0) > 0

export function computeExpertProfileCompletion(data?: ExpertProfileData): ExpertCompletion {
  const profile = data ?? {}
  const identity = profile.identity ?? {}
  const capability = profile.capability ?? {}
  const delivery = profile.delivery ?? {}
  const pricing = profile.pricing ?? {}
  const availability = profile.availability ?? {}
  const experienceEntries = profile.experience?.entries ?? []

  const completed: Record<ExpertSectionId, boolean> = {
    identity: hasText(identity.bio) || hasText(identity.linkedInUrl) || hasText(identity.photoUrl),
    capability:
      hasAny(capability.selectedObjectives) ||
      hasAny(capability.selectedAudiences) ||
      hasAny(capability.selectedIndustries) ||
      hasAny(capability.selectedEngagementTypes) ||
      hasAny(capability.selectedTopics) ||
      hasAny(capability.customObjectives) ||
      hasAny(capability.customAudiences) ||
      hasAny(capability.customEngagementTypes) ||
      hasAny(capability.customTopics) ||
      typeof capability.interactivityLevel === 'number' ||
      typeof capability.depthCapacity === 'number',
    experience: experienceEntries.length > 0,
    delivery: hasText(delivery.structure) || hasText(delivery.toolsPlatforms) || Boolean(delivery.offerFollowUp),
    pricing: hasText(pricing.baseFee) && hasText(pricing.priceFlexibility),
    availability:
      hasText(availability.weeklyAvailability) ||
      (hasText(availability.travelWillingness) && availability.travelWillingness !== 'Select travel willingness'),
  }

  const percent = (Object.keys(completed) as ExpertSectionId[]).reduce(
    (sum, section) => sum + (completed[section] ? EXPERT_SECTION_WEIGHTS[section] : 0),
    0,
  )

  const missingSections = (Object.keys(completed) as ExpertSectionId[]).filter(
    (section) => !completed[section],
  )

  return { percent, completed, missingSections }
}

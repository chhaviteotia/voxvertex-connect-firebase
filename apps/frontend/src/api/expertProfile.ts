import { authedRequest } from './http'

export interface ExpertProfileIdentity {
  bio?: string
  linkedInUrl?: string
  photoUrl?: string
}

export interface ExpertProfileCapability {
  selectedObjectives?: string[]
  customObjectives?: string[]
  selectedAudiences?: string[]
  customAudiences?: string[]
  selectedIndustries?: string[]
  selectedEngagementTypes?: string[]
  customEngagementTypes?: string[]
  selectedTopics?: string[]
  customTopics?: string[]
  interactivityLevel?: number
  functionalAlignment?: Record<string, number>
  depthCapacity?: number
}

export interface ExperienceEntry {
  title?: string
  outcome?: string
  audience?: string
  year?: string
}

export interface ExpertProfileData {
  identity?: ExpertProfileIdentity
  capability?: ExpertProfileCapability
  experience?: { entries?: ExperienceEntry[] }
  delivery?: { structure?: string; toolsPlatforms?: string; offerFollowUp?: boolean }
  pricing?: { baseFee?: string; priceFlexibility?: string }
  availability?: { weeklyAvailability?: string; travelWillingness?: string }
}

export interface GetExpertProfileResponse {
  success: boolean
  data: ExpertProfileData
  error?: string
}

export interface UpdateExpertProfileResponse {
  success: boolean
  data: ExpertProfileData
  error?: string
}

export async function getExpertProfile() {
  return authedRequest<GetExpertProfileResponse>('/api/expert/profile', { method: 'GET' })
}

export async function updateExpertProfile(payload: Partial<ExpertProfileData>) {
  return authedRequest<UpdateExpertProfileResponse>('/api/expert/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

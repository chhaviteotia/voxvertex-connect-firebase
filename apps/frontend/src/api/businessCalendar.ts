import { authedRequest } from './http'

export async function scheduleSessionsForRequirement(payload: {
  requirementId: string
  sessionType?: string
  scheduledDate: string
  startTime?: string
  endTime?: string
  location?: string
  note?: string
}): Promise<{ success: boolean; data: { createdCount: number } }> {
  return authedRequest('/api/business/calendar/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface BusinessScheduledSession {
  id: string
  requirementId: string
  requirementTitle: string
  companyName: string
  expertName: string
  sessionType: string
  status: 'pending' | 'confirmed'
  scheduledDate: string
  startTime: string
  endTime: string
  location: string
}

export async function getBusinessScheduledSessions(): Promise<{
  success: boolean
  data: BusinessScheduledSession[]
}> {
  return authedRequest('/api/business/calendar/sessions', { method: 'GET' })
}

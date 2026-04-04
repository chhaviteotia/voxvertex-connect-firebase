import { authedRequest } from './http'

export interface AvailabilityWindow {
  id: string
  startDate: string
  endDate: string
  note: string
}

export interface ScheduledSession {
  id: string
  requirementId?: string
  requirementTitle?: string
  companyName: string
  sessionType: string
  status: 'pending' | 'confirmed'
  scheduledDate: string
  startTime: string
  endTime: string
  location: string
  note?: string
}

export interface CalendarStats {
  activeWindows: number
  upcomingSessions: number
  pending: number
  confirmed: number
  completed: number
}

const request = authedRequest

export async function getAvailability(): Promise<{
  success: boolean
  data: AvailabilityWindow[]
}> {
  return request<{ success: boolean; data: AvailabilityWindow[] }>(
    '/api/expert/calendar/availability',
    { method: 'GET' }
  )
}

export async function createAvailability(payload: {
  startDate: string
  endDate: string
  note?: string
}): Promise<{ success: boolean; data: AvailabilityWindow }> {
  return request<{ success: boolean; data: AvailabilityWindow }>(
    '/api/expert/calendar/availability',
    { method: 'POST', body: JSON.stringify(payload) }
  )
}

export async function deleteAvailability(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/api/expert/calendar/availability/${id}`,
    { method: 'DELETE' }
  )
}

export async function getSessions(): Promise<{
  success: boolean
  data: ScheduledSession[]
}> {
  return request<{ success: boolean; data: ScheduledSession[] }>(
    '/api/expert/calendar/sessions',
    { method: 'GET' }
  )
}

export async function createSession(payload: {
  companyName: string
  sessionType?: string
  status?: 'pending' | 'confirmed'
  scheduledDate: string
  startTime?: string
  endTime?: string
  location?: string
}): Promise<{ success: boolean; data: ScheduledSession }> {
  return request<{ success: boolean; data: ScheduledSession }>(
    '/api/expert/calendar/sessions',
    { method: 'POST', body: JSON.stringify(payload) }
  )
}

export async function updateSessionStatus(
  id: string,
  status: 'pending' | 'confirmed'
): Promise<{ success: boolean; data: { id: string; status: string } }> {
  return request(
    `/api/expert/calendar/sessions/${id}`,
    { method: 'PATCH', body: JSON.stringify({ status }) }
  )
}

export async function getCalendarStats(): Promise<{
  success: boolean
  data: CalendarStats
}> {
  return request<{ success: boolean; data: CalendarStats }>(
    '/api/expert/calendar/stats',
    { method: 'GET' }
  )
}

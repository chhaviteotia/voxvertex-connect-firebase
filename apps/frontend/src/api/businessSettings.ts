import { authedRequest } from './http'

interface OrganizationSettings {
  companyName: string
  industry: string
  companySize: string
  website: string
  address: string
}

interface ProfileSettings {
  firstName: string
  lastName: string
  fullName?: string
  avatarUrl?: string
  email: string
  phone: string
  jobTitle: string
}

interface NotificationSettings {
  expertMatches: boolean
  proposals: boolean
  messages: boolean
  weeklyDigest: boolean
}

export interface BusinessSettingsResponse {
  success: boolean
  data: {
    organization: OrganizationSettings
    profile: ProfileSettings
    notifications: NotificationSettings
  }
  error?: string
}

export async function fetchBusinessSettings() {
  return authedRequest<BusinessSettingsResponse>('/api/business/settings', {
    method: 'GET',
  })
}

export async function updateOrganizationSettings(payload: Partial<OrganizationSettings>) {
  return authedRequest<{ success: boolean; data: OrganizationSettings }>('/api/business/settings/organization', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function updateProfileSettings(payload: Partial<ProfileSettings>) {
  return authedRequest<{ success: boolean; data: ProfileSettings }>('/api/business/settings/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function updateNotificationSettings(payload: Partial<NotificationSettings>) {
  return authedRequest<{ success: boolean; data: NotificationSettings }>('/api/business/settings/notifications', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function changeBusinessPassword(currentPassword: string, newPassword: string) {
  return authedRequest<{ success: boolean }>('/api/business/settings/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function uploadBusinessAvatar(file: File): Promise<{ success: boolean; avatarUrl: string }> {
  const formData = new FormData()
  formData.append('photo', file)

  const data = await authedRequest<{ success?: boolean; avatarUrl?: string; error?: string }>(
    '/api/business/settings/avatar',
    { method: 'POST', body: formData, includeJsonContentType: false }
  )
  if (!data.success || !data.avatarUrl) {
    throw new Error(data.error ?? 'Upload failed')
  }
  return { success: true, avatarUrl: data.avatarUrl }
}


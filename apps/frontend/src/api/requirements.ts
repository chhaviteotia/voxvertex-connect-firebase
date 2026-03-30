import { authedRequest } from './http'

export interface CreateRequirementPayload {
  status?: 'draft' | 'published'
  formData: Record<string, unknown>
}

export interface RequirementResponse {
  id: string
  status: string
  formData: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}

export interface CreateRequirementResponse {
  success: boolean
  requirement: RequirementResponse
  error?: string
}

export interface ListRequirementsResponse {
  success: boolean
  requirements: RequirementResponse[]
  total: number
  error?: string
}

export async function createRequirement(payload: CreateRequirementPayload): Promise<CreateRequirementResponse> {
  return authedRequest<CreateRequirementResponse>('/api/business/requirements', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listRequirements(params?: { status?: string; limit?: number; skip?: number }): Promise<ListRequirementsResponse> {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.skip != null) search.set('skip', String(params.skip))
  const q = search.toString()
  return authedRequest<ListRequirementsResponse>(`/api/business/requirements${q ? `?${q}` : ''}`)
}

export async function getRequirement(id: string): Promise<{ success: boolean; requirement: RequirementResponse }> {
  return authedRequest<{ success: boolean; requirement: RequirementResponse }>(`/api/business/requirements/${id}`)
}

export interface UpdateRequirementPayload {
  status?: 'draft' | 'published'
  formData?: Record<string, unknown>
}

export async function updateRequirement(id: string, payload: UpdateRequirementPayload): Promise<CreateRequirementResponse> {
  return authedRequest<CreateRequirementResponse>(`/api/business/requirements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

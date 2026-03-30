import { authedRequest } from './http'

/** Payload from Submit Proposal form */
export interface ProposalFormData {
  understanding?: string
  outcomePlan?: string
  measurableOutcomes?: string[]
  sessionStructure?: { segmentTitle: string; duration: string; type: string }[]
  deliverablesSelected?: string[]
  deliverableFiles?: Record<
    string,
    {
      originalName: string
      url: string
      downloadUrl?: string
      mimeType: string
      size: number
      publicId?: string
      uploadedAt?: string
    }[]
  >
  similarEngagements?: string
  industryMatch?: string
  proposedFee?: string
  feeBreakdown?: string
}

export interface SubmitProposalPayload {
  requirementId: string
  status?: 'draft' | 'submitted'
  formData: ProposalFormData
  deliverableFilesById?: Record<string, File[]>
}

export type ProposalStatus =
  | 'draft'
  | 'submitted'
  | 'accepted'
  | 'modification-requested'
  | 'declined'

export interface ProposalResponse {
  id: string
  requirementId: string
  status: ProposalStatus
  businessNote?: string
  formData: ProposalFormData
  createdAt: string
  requirement?: {
    companyName?: string
    formData?: Record<string, unknown>
  }
  expert?: {
    id: string
    name: string
    initials: string
    email?: string
  }
}

export interface SubmitProposalResponse {
  success: boolean
  proposal: ProposalResponse
  error?: string
}

export interface ListProposalsResponse {
  success: boolean
  proposals: ProposalResponse[]
  total: number
  error?: string
}

export interface UpdateProposalStatusPayload {
  status: Extract<ProposalStatus, 'submitted' | 'accepted' | 'modification-requested' | 'declined'>
  businessNote?: string
}

export interface UpdateProposalStatusResponse {
  success: boolean
  proposal: ProposalResponse
  error?: string
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData
  return authedRequest<T>(path, {
    ...options,
    includeJsonContentType: !isFormDataBody,
  })
}

/** Expert: submit a proposal for an opportunity (requirementId = opportunityId from browse). */
export async function submitProposal(payload: SubmitProposalPayload): Promise<SubmitProposalResponse> {
  const hasFiles = Object.values(payload.deliverableFilesById ?? {}).some(
    (files) => Array.isArray(files) && files.length > 0
  )
  if (hasFiles) {
    const multipart = new FormData()
    multipart.append('requirementId', payload.requirementId)
    multipart.append('status', payload.status ?? 'submitted')
    multipart.append('formData', JSON.stringify(payload.formData ?? {}))

    Object.entries(payload.deliverableFilesById ?? {}).forEach(([deliverableId, files]) => {
      files.forEach((file) => {
        multipart.append(`deliverableFiles__${deliverableId}`, file)
      })
    })

    return request<SubmitProposalResponse>('/api/expert/proposals', {
      method: 'POST',
      body: multipart,
    })
  }

  return request<SubmitProposalResponse>('/api/expert/proposals', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Expert: list proposals submitted by current expert. */
export async function listMyProposals(
  params?: { status?: string; limit?: number; skip?: number }
): Promise<ListProposalsResponse> {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.skip != null) search.set('skip', String(params.skip))
  const q = search.toString()
  return request<ListProposalsResponse>(`/api/expert/proposals${q ? `?${q}` : ''}`)
}

/** Business: list proposals for a requirement (owner only). */
export async function listProposalsByRequirement(
  requirementId: string,
  params?: { status?: string; limit?: number; skip?: number }
): Promise<ListProposalsResponse> {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.skip != null) search.set('skip', String(params.skip))
  const q = search.toString()
  return request<ListProposalsResponse>(
    `/api/business/requirements/${requirementId}/proposals${q ? `?${q}` : ''}`
  )
}

/** Business: update proposal status for a requirement (owner only). */
export async function updateProposalStatusForRequirement(
  requirementId: string,
  proposalId: string,
  payload: UpdateProposalStatusPayload
): Promise<UpdateProposalStatusResponse> {
  return request<UpdateProposalStatusResponse>(
    `/api/business/requirements/${requirementId}/proposals/${proposalId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  )
}

import { authedRequest } from './http'

export interface OtherParticipant {
  id: string
  name: string
  role: string
  email?: string
}

export interface ConversationResponse {
  id: string
  businessUserId: string
  expertUserId: string
  requirementId: string | null
  requirementTitle?: string | null
  otherParticipant: OtherParticipant
  updatedAt: string
  createdAt: string
}

export interface MessageResponse {
  id: string
  conversationId: string
  senderId: string
  senderType: 'business' | 'expert'
  content: string
  createdAt: string
}

export async function listConversations(): Promise<{
  success: boolean
  conversations: ConversationResponse[]
}> {
  return authedRequest<{ success: boolean; conversations: ConversationResponse[] }>('/api/conversations')
}

export async function createOrGetConversation(params: {
  expertId?: string
  businessId?: string
  requirementId?: string
  proposalId?: string
}): Promise<{ success: boolean; conversation: ConversationResponse }> {
  return authedRequest<{ success: boolean; conversation: ConversationResponse }>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function getConversation(id: string): Promise<{
  success: boolean
  conversation: ConversationResponse
}> {
  return authedRequest<{ success: boolean; conversation: ConversationResponse }>(`/api/conversations/${id}`)
}

export async function listMessages(
  conversationId: string,
  params?: { limit?: number; skip?: number }
): Promise<{ success: boolean; messages: MessageResponse[] }> {
  const search = new URLSearchParams()
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.skip != null) search.set('skip', String(params.skip))
  const q = search.toString()
  return authedRequest<{ success: boolean; messages: MessageResponse[] }>(
    `/api/conversations/${conversationId}/messages${q ? `?${q}` : ''}`
  )
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ success: boolean; message: MessageResponse }> {
  return authedRequest<{ success: boolean; message: MessageResponse }>(
    `/api/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content: content.trim() }),
    }
  )
}

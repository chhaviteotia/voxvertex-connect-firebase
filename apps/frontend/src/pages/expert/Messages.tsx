import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarItems, expertSidebarBottomItems } from '../../config/expertNav'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import {
  listConversations,
  createOrGetConversation,
  listMessages,
  sendMessage,
  type ConversationResponse,
  type MessageResponse,
} from '../../api/conversations'

export function ExpertMessages() {
  const [searchParams] = useSearchParams()
  const businessIdParam = searchParams.get('businessId')
  const requirementIdParam = searchParams.get('requirementId')
  const proposalIdParam = searchParams.get('proposalId')

  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe' : 'John Doe')

  const [conversations, setConversations] = useState<ConversationResponse[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [composerText, setComposerText] = useState('')
  const [sending, setSending] = useState(false)

  const activeConversation = conversations.find((c) => c.id === activeId) || null

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true)
    try {
      const res = await listConversations()
      if (res.success && res.conversations) setConversations(res.conversations)
    } catch {
      setConversations([])
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (!businessIdParam) return
    let cancelled = false
    createOrGetConversation({
      businessId: businessIdParam,
      requirementId: requirementIdParam ?? undefined,
      proposalId: proposalIdParam ?? undefined,
    })
      .then((res) => {
        if (cancelled || !res.success || !res.conversation) return
        setActiveId(res.conversation.id)
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === res.conversation.id)
          if (exists) return prev.map((c) => (c.id === res.conversation.id ? res.conversation : c))
          return [res.conversation, ...prev]
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [businessIdParam, requirementIdParam, proposalIdParam])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    let cancelled = false
    setMessagesLoading(true)
    setMessages([])
    listMessages(activeId)
      .then((res) => {
        if (!cancelled && res.success && res.messages) setMessages(res.messages)
      })
      .catch(() => {
        if (!cancelled) setMessages([])
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false)
      })
    return () => { cancelled = true }
  }, [activeId])

  const handleSend = async () => {
    const text = composerText.trim()
    if (!text || !activeId || sending) return
    setSending(true)
    setComposerText('')
    try {
      const res = await sendMessage(activeId, text)
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message])
      }
    } finally {
      setSending(false)
    }
  }

  function formatTime(createdAt: string) {
    const d = new Date(createdAt)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <DashboardLayout
      sidebarItems={expertSidebarItems}
      sidebarBottomItems={expertSidebarBottomItems}
      userTypeLabel="Expert"
      userDisplayName={displayName}
      userSubLabel="Expert"
      accentColor="green"
      mainClassName="pl-0 pr-0"
    >
      <div className="flex h-[calc(100vh-80px)] bg-white">
        <aside className="w-72 border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-900">Messages</h1>
            <p className="text-xs text-gray-500 mt-0.5">Business Communications</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading && (
              <p className="px-4 py-3 text-sm text-gray-500">Loading…</p>
            )}
            {!conversationsLoading && conversations.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-500">No conversations yet. When a business messages you from a proposal, they will appear here.</p>
            )}
            {!conversationsLoading &&
              conversations.map((conv) => {
                const isActive = conv.id === activeId
                const other = conv.otherParticipant
                const lastPreview = conv.requirementTitle
                  ? `Re: ${conv.requirementTitle}`
                  : other.name
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveId(conv.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 ${
                      isActive ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700 shrink-0">
                      {other.name
                        .split(/\s+/)
                        .map((p) => p[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'CO'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{other.name}</p>
                      <p className="text-xs text-gray-500 truncate">{other.role}</p>
                      <p className="mt-0.5 text-xs text-gray-400 truncate">{lastPreview}</p>
                    </div>
                  </button>
                )
              })}
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          {!activeConversation && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7A8.38 8.38 0 0 1 8.7 19L3 20.5 4.5 15.8A8.38 8.38 0 0 1 3.5 12a8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">Select a conversation</h2>
                <p className="mt-1 text-sm text-gray-500">Choose a business from the left panel to view and reply to messages.</p>
              </div>
            </div>
          )}

          {activeConversation && (
            <div className="flex flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {activeConversation.otherParticipant.name
                      .split(/\s+/)
                      .map((p) => p[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'CO'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{activeConversation.otherParticipant.name}</p>
                    <p className="text-xs text-gray-500">{activeConversation.otherParticipant.role}</p>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[#F9FAFB]">
                {messagesLoading && (
                  <p className="text-sm text-gray-500">Loading messages…</p>
                )}
                {!messagesLoading && messages.length === 0 && (
                  <p className="text-sm text-gray-500">No messages yet. Send one below to start the conversation.</p>
                )}
                {!messagesLoading &&
                  messages.map((m) => {
                    const isMe = m.senderType === 'expert'
                    return (
                      <div key={m.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-700 shrink-0">
                          {isMe ? 'You' : activeConversation.otherParticipant.name.split(/\s+/).map((p) => p[0]).join('').toUpperCase().slice(0, 2) || 'CO'}
                        </div>
                        <div className={isMe ? 'flex flex-col items-end' : ''}>
                          <div
                            className={`inline-block max-w-md rounded-2xl px-4 py-2 text-sm shadow-sm ${
                              isMe ? 'bg-[#111827] text-white' : 'bg-white text-gray-900'
                            }`}
                          >
                            {m.content}
                          </div>
                          <p className="mt-1 text-xs text-gray-400">{formatTime(m.createdAt)}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>

              <footer className="border-t border-gray-200 px-6 py-3 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008C9E]/20 focus:border-[#008C9E]"
                    disabled={sending}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !composerText.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111827] text-white hover:bg-black disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Send message"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">Press Enter to send</p>
              </footer>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

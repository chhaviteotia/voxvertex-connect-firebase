/** Best-effort label for nav / account UI (name, contact, company, or email local-part). */
export function getUserDisplayName(user: unknown): string {
  if (!user || typeof user !== 'object') return ''
  const u = user as Record<string, unknown>
  const preferred = [u.name, u.fullName, u.contactName, u.companyName].find(
    (value) => typeof value === 'string' && value.trim().length > 0
  )
  if (typeof preferred === 'string') return preferred.trim()
  const email = typeof u.email === 'string' ? u.email.trim() : ''
  if (email.includes('@')) return email.split('@')[0]
  return email
}

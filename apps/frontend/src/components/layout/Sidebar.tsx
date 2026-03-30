import { Link, useLocation } from 'react-router-dom'
import { Logo } from '../Logo'

/**
 * Shared sidebar component for dashboard layouts.
 * Dark theme: navy background, teal active state, logo + nav + user at bottom.
 */
export interface SidebarItem {
  to: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  items: SidebarItem[]
  bottomItems?: SidebarItem[]
  /** User display name shown at bottom (e.g. "John Doe", "Acme Corp") */
  userDisplayName: string
  /** Optional line under name (e.g. "Expert") */
  userSubLabel?: string
  accentColor?: 'blue' | 'green'
  footer?: React.ReactNode
  className?: string
}

const SIDEBAR_BG = '#1A2036'

export function Sidebar({
  items,
  bottomItems = [],
  userDisplayName,
  userSubLabel,
  footer,
  className = '',
}: SidebarProps) {
  const location = useLocation()

  const linkClass = (to: string) => {
    const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium no-underline transition-colors ${
      isActive ? 'bg-[#008C9E] text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`
  }

  const initials = (() => {
    const parts = (userDisplayName || '').trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    if (parts[0]?.length >= 2) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0]?.[0] ?? 'U').toUpperCase()
  })()

  return (
    <aside
      className={`w-56 shrink-0 flex flex-col h-full overflow-hidden ${className}`}
      style={{ backgroundColor: SIDEBAR_BG }}
    >
      <div className="p-4 shrink-0">
        <Logo to="/" variant="sidebar" />
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <nav className="flex flex-col gap-0.5 px-3 pt-2">
          {items.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={linkClass(to)}>
              <span className="shrink-0 w-5 h-5 flex items-center justify-center text-current">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        {bottomItems.length > 0 && (
          <nav className="flex flex-col gap-0.5 px-3 mt-2">
            {bottomItems.map(({ to, label, icon }) => (
              <Link key={to} to={to} className={linkClass(to)}>
                <span className="shrink-0 w-5 h-5 flex items-center justify-center text-current">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="shrink-0 pt-4 border-t border-white/10 px-3 pb-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <span className="w-9 h-9 rounded-full bg-[#008C9E] text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-gray-300 text-sm font-medium truncate">{userDisplayName}</p>
            {userSubLabel && <p className="text-gray-400 text-xs truncate">{userSubLabel}</p>}
          </div>
        </div>
      </div>
      {footer != null && (
        <div className="px-3 pb-3">
          <p className="text-xs text-gray-500">{footer}</p>
        </div>
      )}
    </aside>
  )
}

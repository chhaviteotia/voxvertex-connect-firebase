import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconBell } from './DashboardIcons'
import { useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'

/**
 * Dashboard header: notification bell with dot, user avatar (initials) with dropdown.
 * Used by business and expert layouts.
 */
interface HeaderProps {
  /** e.g. "Acme Corp" or "Dr. Sarah Chen" - used for avatar initials */
  userDisplayName: string
  /** Show teal dot on bell (unread notifications) */
  showNotificationDot?: boolean
}

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  if (parts[0]?.length >= 2) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0]?.[0] ?? 'U').toUpperCase()
}

export function Header({
  userDisplayName,
  showNotificationDot = true,
}: HeaderProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const initials = getInitials(userDisplayName)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const dashboardHref = location.pathname.startsWith('/expert') ? '/expert/dashboard' : '/business/dashboard'

  const handleLogout = () => {
    dispatch(logout())
    setOpen(false)
    navigate('/', { replace: true })
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-end px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          aria-label="Notifications"
        >
          <IconBell />
          {showNotificationDot && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#008C9E]" aria-hidden />
          )}
        </button>
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008C9E] focus:ring-offset-2"
            aria-expanded={open}
            aria-haspopup="true"
            aria-label="User menu"
          >
            {initials}
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 no-underline"
              >
                Home
              </Link>
              <Link
                to={dashboardHref}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 no-underline"
              >
                Dashboard
              </Link>
              {location.pathname.startsWith('/expert') && (
                <Link
                  to="/expert/settings"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 no-underline"
                >
                  Settings
                </Link>
              )}
              <div className="my-1 border-t border-gray-200" />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 bg-transparent border-0 text-left cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-500">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { useAppSelector } from '../store/hooks'
import { selectUser } from '../store/selectors/authSelectors'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import { getUserDisplayName } from '../utils/userDisplayName'

export function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const displayName = getUserDisplayName(user)
  const isLoggedIn = Boolean(user && displayName)
  const userType = user?.type === 'expert' ? 'expert' : user?.type === 'business' ? 'business' : null
  const dashboardPath = userType === 'expert' ? '/expert/dashboard' : '/business/dashboard'
  const settingsPath = userType === 'expert' ? '/expert/settings' : '/business/settings'

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    setMenuOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <header className="bg-white py-4 border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Logo variant="header" to="/" />
        <nav className="flex items-center gap-8">
          <a href="#businesses" className="text-gray-800 text-[15px] font-medium no-underline hover:text-gray-600">For Businesses</a>
          <a href="#experts" className="text-gray-800 text-[15px] font-medium no-underline hover:text-gray-600">For Experts</a>
          <a href="#features" className="text-gray-800 text-[15px] font-medium no-underline hover:text-gray-600">Pricing</a>
        </nav>
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 text-gray-800 text-[15px] font-medium bg-transparent border-0 cursor-pointer hover:text-gray-600"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                {displayName}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
                  <Link
                    to={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 no-underline"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={settingsPath}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 no-underline"
                  >
                    Settings
                  </Link>
                  <div className="my-1 border-t border-gray-200" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 bg-transparent border-0 cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin" className="text-gray-800 text-[15px] font-medium no-underline hover:text-gray-600">Log in</Link>
          )}
          <Link to="/signup" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#008C9E] text-white text-[15px] font-medium no-underline hover:opacity-90">Get Started</Link>
        </div>
      </div>
    </header>
  )
}

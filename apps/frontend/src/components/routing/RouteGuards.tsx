import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAuthToken, getAuthUser } from '../../api/auth'

type AllowedRole = 'business' | 'expert'

function normalizeUserType(value?: string): AllowedRole | null {
  if (!value) return null
  const v = value.toLowerCase()
  if (v === 'business' || v === 'expert') return v
  return null
}

function defaultRouteForRole(role: AllowedRole): string {
  return role === 'business' ? '/business/dashboard' : '/expert/dashboard'
}

export function ProtectedRoute({ allowedRole }: { allowedRole?: AllowedRole }) {
  const location = useLocation()
  const token = getAuthToken()
  const user = getAuthUser()
  const userType = normalizeUserType(user?.type)

  if (!token || !userType) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  if (allowedRole && userType !== allowedRole) {
    return <Navigate to={defaultRouteForRole(userType)} replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const token = getAuthToken()
  const user = getAuthUser()
  const userType = normalizeUserType(user?.type)

  if (token && userType) {
    return <Navigate to={defaultRouteForRole(userType)} replace />
  }

  return <Outlet />
}

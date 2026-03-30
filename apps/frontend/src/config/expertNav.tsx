import type { SidebarItem } from '../components/layout/Sidebar'
import { IconDashboard, IconTarget, IconDocument, IconMessage, IconCalendar, IconUser, IconChart } from '../components/layout/DashboardIcons'

/** Expert dashboard sidebar config: Dashboard, Opportunities, Proposals, Messages, Calendar, Profile, Analytics. */
const base = '/expert'

export const expertSidebarItems: SidebarItem[] = [
  { to: `${base}/dashboard`, label: 'Dashboard', icon: <IconDashboard /> },
  { to: `${base}/browse`, label: 'Opportunities', icon: <IconTarget /> },
  { to: `${base}/proposals`, label: 'Proposals', icon: <IconDocument /> },
  { to: `${base}/messages`, label: 'Messages', icon: <IconMessage /> },
  { to: `${base}/calendar`, label: 'Calendar', icon: <IconCalendar /> },
  { to: `${base}/profile`, label: 'Profile', icon: <IconUser /> },
  { to: `${base}/analytics`, label: 'Analytics', icon: <IconChart /> },
]

export const expertSidebarBottomItems: SidebarItem[] = []

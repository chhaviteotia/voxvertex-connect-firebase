import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import type { SidebarItem } from '../components/layout/Sidebar'

/**
 * Shared layout: dark sidebar (logo + nav + user) + white header (search + notifications + avatar) + main content.
 * Used by business and expert dashboards.
 */
interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems: SidebarItem[]
  sidebarBottomItems?: SidebarItem[]
  userTypeLabel?: string
  userDisplayName: string
  userSubLabel?: string
  accentColor?: 'blue' | 'green'
  sidebarFooter?: React.ReactNode
  sidebarClassName?: string
  /** Extra class for main content area (e.g. expert: "pl-10" for more left padding) */
  mainClassName?: string
}

export function DashboardLayout({
  children,
  sidebarItems,
  sidebarBottomItems,
  userDisplayName,
  userSubLabel,
  accentColor = 'blue',
  sidebarFooter,
  sidebarClassName,
  mainClassName,
}: DashboardLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 print:block print:h-auto">
      <div className="print:hidden">
        <Sidebar
          items={sidebarItems}
          bottomItems={sidebarBottomItems}
          userDisplayName={userDisplayName}
          userSubLabel={userSubLabel}
          accentColor={accentColor}
          footer={sidebarFooter}
          className={sidebarClassName}
        />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden print:block print:min-h-0 print:overflow-visible">
        <div className="print:hidden">
          <Header userDisplayName={userDisplayName} />
        </div>
        <main
          className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-6 px-6 min-w-0 print:overflow-visible print:px-0 print:py-0 ${mainClassName ?? ''}`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

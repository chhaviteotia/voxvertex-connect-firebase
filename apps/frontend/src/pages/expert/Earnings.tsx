import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarItems, expertSidebarBottomItems } from '../../config/expertNav'

export function ExpertEarnings() {
  return (
    <DashboardLayout
      sidebarItems={expertSidebarItems}
      sidebarBottomItems={expertSidebarBottomItems}
      userTypeLabel="Expert"
      userDisplayName="Dr. Sarah Chen"
      userSubLabel="Expert"
      accentColor="green"
      mainClassName="pl-5 pr-6"
      sidebarFooter={<a href="/privacy" className="text-gray-500 hover:text-gray-700">Manage cookies or opt out</a>}
    >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600 mt-1">View your earnings and payouts.</p>
      </div>
    </DashboardLayout>
  )
}

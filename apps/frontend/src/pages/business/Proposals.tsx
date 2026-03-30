import { DashboardLayout } from '../../layouts/DashboardLayout'
import { businessSidebarItems, businessSidebarBottomItems } from '../../config/businessNav'

export function Proposals() {
  return (
    <DashboardLayout
      sidebarItems={businessSidebarItems}
      sidebarBottomItems={businessSidebarBottomItems}
      userTypeLabel="Business"
      userDisplayName="Acme Corp"
      userSubLabel="Business Account"
      sidebarClassName="bg-gray-50"
    >
      <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
      <p className="text-gray-500 mt-1">Review and manage expert proposals.</p>
    </DashboardLayout>
  )
}

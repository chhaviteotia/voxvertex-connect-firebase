import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarBottomItems, expertSidebarItems } from '../../config/expertNav'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import {
  IconEye,
  IconDocument,
  IconCheckSquare,
  IconTarget,
  IconUser,
  IconTrendingUp,
} from '../../components/layout/DashboardIcons'

const TEAL = '#0096C7'

const METRICS = [
  { label: 'Profile Views', value: '342', delta: '+24%', icon: IconEye },
  { label: 'Proposals Submitted', value: '18', delta: '+12%', icon: IconDocument },
  { label: 'Acceptance Rate', value: '72%', delta: '+8%', icon: IconCheckSquare },
  { label: 'Avg. Match Score', value: '85%', delta: '+3%', icon: IconTarget },
  { label: 'Completed Engagements', value: '12', delta: '+4', icon: IconUser },
  { label: 'Ranking Score', value: '8.2/10', delta: '+0.5', icon: IconTrendingUp },
]

const INDUSTRIES = [
  { name: 'Technology', matches: '12 matches' },
  { name: 'Finance', matches: '24 matches' },
  { name: 'Healthcare', matches: '36 matches' },
]

export function ExpertAnalytics() {
  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe' : 'John Doe')

  return (
    <DashboardLayout
      sidebarItems={expertSidebarItems}
      sidebarBottomItems={expertSidebarBottomItems}
      userTypeLabel="Expert"
      userDisplayName={displayName}
      userSubLabel="Expert"
      accentColor="green"
      mainClassName="pl-5 pr-6"
    >
      <div className="mx-auto max-w-6xl pb-8">
        <div className="mb-5">
          <h1 className="text-4xl font-bold text-[#0F172A]">Analytics</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">Track your performance and growth</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {METRICS.map(({ label, value, delta, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-[#E6EDF3] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">
                  <Icon />
                </span>
                <span className="text-sm font-semibold text-[#16A34A]">{delta}</span>
              </div>
              <p className="mt-6 text-4xl font-bold text-[#0F172A]">{value}</p>
              <p className="mt-1 text-sm text-[#64748B]">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-[#E6EDF3] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0F172A]">Performance Over Time</h2>
          <div className="mt-4 flex h-[280px] items-center justify-center rounded-lg bg-[#F8FAFC] text-[#94A3B8]">
            Chart visualization would go here
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[#E6EDF3] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0F172A]">Top Matched Industries</h2>
          <div className="mt-5 space-y-3">
            {INDUSTRIES.map((row) => (
              <div key={row.name} className="flex items-center justify-between text-base">
                <span className="text-[#0F172A]">{row.name}</span>
                <span className="font-semibold" style={{ color: TEAL }}>
                  {row.matches}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

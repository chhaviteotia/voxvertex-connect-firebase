import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarItems, expertSidebarBottomItems } from '../../config/expertNav'
import { IconEye, IconCheckSquare, IconTrendingUp, IconChart, IconTarget, IconUsers, IconCalendar, IconDollar } from '../../components/layout/DashboardIcons'
import { getExpertProfile, type ExpertProfileData } from '../../api/expertProfile'
import { computeExpertProfileCompletion, EXPERT_SECTION_LABELS } from '../../utils/expertProfileCompletion'

const TEAL = '#008C9E'

const STAT_CARDS = [
  { value: '42', label: 'Profile Views', change: '+12%', changePositive: true, icon: IconUsers },
  { value: '85%', label: 'Acceptance Rate', change: '+5%', changePositive: true, icon: IconCheckSquare },
  { value: '2.4h', label: 'Avg. Response Time', change: '-15%', changePositive: false, icon: IconTrendingUp },
  { value: '7.8/10', label: 'Ranking Score', change: '+0.3', changePositive: true, icon: IconTarget },
]

const MATCHED_OPPORTUNITIES = [
  {
    id: '1',
    title: 'AI Training for Sales Team',
    company: 'TechCorp India',
    match: 92,
    timeAgo: '1d ago',
    objective: 'Skill Development',
    audience: 'Sales Teams',
    type: 'Workshop',
    budget: '₹1,50,000 - ₹2,50,000',
  },
  {
    id: '2',
    title: 'Leadership Development Program',
    company: 'Manufacturing Ltd',
    match: 88,
    timeAgo: '2d ago',
    objective: 'Leadership Development',
    audience: 'Middle Management',
    type: 'Training Series',
    budget: '₹2,00,000 - ₹3,50,000',
  },
]

const RECENT_ACTIVITY = [
  { text: "Your proposal for 'AI Training for Sales Team' is under review", time: '2 hours ago' },
  { text: "New opportunity matched: 'Leadership Development Program'", time: '1 day ago' },
  { text: 'Your profile was viewed by TechCorp India', time: '2 days ago' },
]

export function ExpertDashboard() {
  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe')
  const firstName = displayName.split(/\s+/)[0] || 'John'
  const [profileData, setProfileData] = useState<ExpertProfileData | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    getExpertProfile()
      .then((res) => {
        if (!cancelled && res.success) {
          setProfileData(res.data)
        }
      })
      .catch(() => {
        // Keep card usable with fallback values if profile API fails on dashboard.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const completion = useMemo(() => computeExpertProfileCompletion(profileData), [profileData])
  const missingLabels = completion.missingSections.map((section) => EXPERT_SECTION_LABELS[section])

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
      <div className="max-w-5xl mx-auto pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1e293b]">Welcome back, {firstName}!</h1>
          <p className="text-[#64748b] mt-0.5">Here&apos;s what&apos;s happening with your expert profile</p>
        </div>

        {/* Complete Your Profile card - light blue bg per design */}
        <div className="rounded-xl bg-[#E0F2F7] border border-gray-400 shadow-sm p-5 mb-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4 min-w-0 flex-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#007B8A] bg-transparent text-[#007B8A] text-sm font-normal" style={{ fontStyle: 'italic' }} aria-hidden>i</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-[#1e293b]">Complete Your Profile</h2>
                <p className="text-sm text-[#64748b] mt-0.5">
                  Profile Strength: {completion.percent}% — Boost your visibility and match rate
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-[#cbd5e1] overflow-hidden">
                  <div className="h-full rounded-full bg-[#1e293b]" style={{ width: `${completion.percent}%` }} />
                </div>
                {missingLabels.length > 0 ? (
                  <>
                    <p className="text-base font-semibold text-[#1e293b] mt-3">Missing sections:</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 items-baseline">
                      {missingLabels.map((section, i) => (
                        <span key={section} className="text-sm font-normal text-black border border-gray-200 rounded px-1.5 py-0.5" style={{ borderWidth: '1px' }}>
                          {section}
                          {i < missingLabels.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-base font-semibold text-[#166534] mt-3">All profile sections are complete.</p>
                )}
              </div>
            </div>
            <Link
              to="/expert/profile"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shrink-0 hover:opacity-90 no-underline"
              style={{ backgroundColor: '#00a7b5' }}
            >
              Complete Profile
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Four stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ value, label, change, changePositive, icon: Icon }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-gray-600 bg-gray-100">
                  <Icon />
                </div>
                <span className={`text-sm font-medium ${changePositive ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Matched Opportunities */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Matched Opportunities</h2>
                <p className="text-sm text-gray-500 mt-0.5">Requirements that match your expertise</p>
              </div>
              <Link to="/expert/browse" className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-2 bg-white no-underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {MATCHED_OPPORTUNITIES.map((opp) => (
                <div key={opp.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-semibold text-gray-900">{opp.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex rounded-md px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: TEAL }}>
                        {opp.match}% Match
                      </span>
                      <span className="text-xs text-gray-400">{opp.timeAgo}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{opp.company}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <IconTarget className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{opp.objective}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconUsers className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{opp.audience}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{opp.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconDollar className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{opp.budget}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/expert/browse/${opp.id}`}
                      state={{ title: opp.title, company: opp.company }}
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 no-underline"
                      style={{ backgroundColor: TEAL }}
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/expert/browse/${opp.id}/propose`}
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 no-underline"
                    >
                      Submit Proposal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {RECENT_ACTIVITY.map((item, i) => (
                  <div key={i} className="px-4 py-3">
                    <p className="text-sm text-gray-900">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Help icon - fixed bottom right */}
        <button
          type="button"
          className="fixed bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-medium shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008C9E]"
          style={{ backgroundColor: TEAL }}
          aria-label="Help"
        >
          ?
        </button>
      </div>
    </DashboardLayout>
  )
}

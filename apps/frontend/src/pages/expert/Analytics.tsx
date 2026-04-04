import { useEffect, useMemo, useState } from 'react'
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
import { getExpertAnalytics, type ExpertAnalyticsResponse } from '../../api/expertAnalytics'

const TEAL = '#0096C7'

const METRIC_ORDER = [
  { key: 'businessConversations' as const, icon: IconEye },
  { key: 'proposalsSubmitted' as const, icon: IconDocument },
  { key: 'acceptanceRate' as const, icon: IconCheckSquare },
  { key: 'avgMatchScore' as const, icon: IconTarget },
  { key: 'completedEngagements' as const, icon: IconUser },
  { key: 'performanceScore' as const, icon: IconTrendingUp },
]

function deltaClass(delta: string): string {
  if (delta === '—') return 'text-[#94A3B8]'
  if (delta.trim().startsWith('-')) return 'text-[#DC2626]'
  return 'text-[#16A34A]'
}

export function ExpertAnalytics() {
  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName =
    user?.name ||
    (prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe' : 'John Doe')

  const [data, setData] = useState<ExpertAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getExpertAnalytics()
      .then((res) => {
        if (cancelled) return
        if (res.success && res.metrics) setData(res)
        else setError(res.error || 'Could not load analytics.')
      })
      .catch(() => {
        if (!cancelled) setError('Could not load analytics.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const chartMax = useMemo(() => {
    const rows = data?.performanceOverTime || []
    const m = Math.max(1, ...rows.map((r) => r.count))
    return m
  }, [data])

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

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading &&
            METRIC_ORDER.map(({ key, icon: Icon }) => (
              <div key={key} className="rounded-xl border border-[#E6EDF3] bg-white p-4 shadow-sm animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] opacity-40">
                    <Icon />
                  </span>
                  <span className="h-4 w-12 rounded bg-[#E2E8F0]" />
                </div>
                <div className="mt-6 h-9 w-20 rounded bg-[#E2E8F0]" />
                <div className="mt-2 h-4 w-28 rounded bg-[#F1F5F9]" />
              </div>
            ))}

          {!loading &&
            data &&
            METRIC_ORDER.map(({ key, icon: Icon }) => {
              const m = data.metrics[key]
              return (
                <div key={key} className="rounded-xl border border-[#E6EDF3] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">
                      <Icon />
                    </span>
                    <span className={`text-sm font-semibold ${deltaClass(m.delta)}`}>{m.delta}</span>
                  </div>
                  <p className="mt-6 text-4xl font-bold text-[#0F172A]">{m.value}</p>
                  <p className="mt-1 text-sm text-[#64748B]">{m.label}</p>
                </div>
              )
            })}
        </div>

        <div className="mt-5 rounded-xl border border-[#E6EDF3] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0F172A]">Proposals over time</h2>
          <p className="mt-1 text-sm text-[#64748B]">Non-draft proposals submitted per month (last 6 months)</p>
          {loading ? (
            <div className="mt-4 flex h-[280px] items-center justify-center rounded-lg bg-[#F8FAFC] text-[#94A3B8]">
              Loading…
            </div>
          ) : data && data.performanceOverTime.length > 0 ? (
            <div className="mt-6 flex h-[260px] items-end justify-between gap-2 border-b border-[#E2E8F0] pb-2 pl-1 pr-1">
              {data.performanceOverTime.map((row) => {
                const maxBarPx = 200
                const barPx = Math.max(6, Math.round((row.count / chartMax) * maxBarPx))
                return (
                  <div key={row.label} className="flex h-full min-h-0 flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs font-semibold text-[#0F172A]">{row.count}</span>
                    <div
                      className="w-full max-w-[48px] rounded-t-md bg-[#0096C7]/85 shrink-0 transition-all"
                      style={{ height: barPx }}
                      title={`${row.label}: ${row.count}`}
                    />
                    <span className="text-center text-[11px] font-medium text-[#64748B] leading-tight">{row.label}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-4 flex h-[280px] items-center justify-center rounded-lg bg-[#F8FAFC] text-[#94A3B8]">
              No proposal history yet
            </div>
          )}
        </div>

        <div className="mt-5 rounded-xl border border-[#E6EDF3] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0F172A]">Top matched industries</h2>
          <p className="mt-1 text-sm text-[#64748B]">From requirements you have proposed on (published form data)</p>
          {loading ? (
            <div className="mt-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-[#F1F5F9]" />
              ))}
            </div>
          ) : data && data.topIndustries.length > 0 ? (
            <div className="mt-5 space-y-3">
              {data.topIndustries.map((row) => (
                <div key={row.name} className="flex items-center justify-between text-base">
                  <span className="text-[#0F172A]">{row.name}</span>
                  <span className="font-semibold" style={{ color: TEAL }}>
                    {row.count} {row.count === 1 ? 'proposal' : 'proposals'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg bg-[#F8FAFC] py-8 text-center text-sm text-[#94A3B8]">
              Submit proposals on opportunities with industry tags to see this breakdown
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

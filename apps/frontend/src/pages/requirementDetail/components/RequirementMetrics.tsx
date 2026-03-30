import type { ReactNode } from 'react'
import { IconDocument, IconSparkles, IconTrendingUp } from '../../../components/layout/DashboardIcons'

interface RequirementMetricsProps {
  proposalCount: number
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: ReactNode
}) {
  return (
    <div className="flex min-h-[80px] items-center justify-between gap-4 rounded-xl border border-[#E7EDF4] bg-white px-6 py-3.5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-[#8A97A8]">{label}</p>
        <p className="mt-1 text-[32px] font-semibold leading-none text-[#0F172A]">{value}</p>
      </div>
      <span className="text-[#00A0C6] [&>svg]:h-9 [&>svg]:w-9" aria-hidden>
        {icon}
      </span>
    </div>
  )
}

export default function RequirementMetrics({ proposalCount }: RequirementMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <MetricCard
        label="Expert Matches"
        value={8}
        icon={<IconSparkles />}
      />
      <MetricCard
        label="Proposals Received"
        value={proposalCount}
        icon={<IconDocument />}
      />
      <MetricCard
        label="Profile Views"
        value={24}
        icon={<IconTrendingUp />}
      />
    </div>
  )
}

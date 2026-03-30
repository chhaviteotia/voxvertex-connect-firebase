export type RequirementTab = 'proposals' | 'details' | 'activity'

interface RequirementTabsProps {
  activeTab: RequirementTab
  onChange: (tab: RequirementTab) => void
  proposalCount: number
}

export default function RequirementTabs({ activeTab, onChange, proposalCount }: RequirementTabsProps) {
  const tabs: { id: RequirementTab; label: string }[] = [
    { id: 'proposals', label: `Proposals (${proposalCount})` },
    { id: 'details', label: 'Details' },
    { id: 'activity', label: 'Activity' },
  ]

  return (
    <div className="rounded-full bg-[#E9EDF5] px-2 py-2.5">
      <div className="flex items-stretch gap-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 min-w-0 py-2.5 text-center text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'rounded-full bg-white text-[#2C3E50] shadow-sm'
                : 'bg-transparent text-[#2C3E50] hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
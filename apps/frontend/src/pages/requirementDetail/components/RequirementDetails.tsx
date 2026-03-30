import type { ReactNode } from 'react'
import type { RequirementViewModel } from '../utils'

interface RequirementDetailsProps {
  viewModel: RequirementViewModel
}

function DetailGrid({
  items,
}: {
  items: { label: string; value: string }[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="font-medium text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

function DetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

export default function RequirementDetails({ viewModel }: RequirementDetailsProps) {
  return (
    <>
      <DetailSection title="Objective">
        <p className="mb-1 text-sm text-gray-500">Primary Focus</p>
        <p className="mb-4 font-medium text-gray-900">{viewModel.objective.primaryFocus}</p>
        <p className="mb-1 text-sm text-gray-500">Problem Statement</p>
        <p className="mb-4 text-gray-900">{viewModel.objective.problemStatement}</p>
        <p className="mb-1 text-sm text-gray-500">Desired Transformation</p>
        <p className="mb-4 text-gray-900">{viewModel.objective.desiredTransformation}</p>
        <p className="mb-2 text-sm text-gray-500">Measurable Outcomes</p>
        {viewModel.objective.measurableOutcomes.length > 0 ? (
          <ul className="space-y-2">
            {viewModel.objective.measurableOutcomes.map((outcome, index) => (
              <li key={`${outcome}-${index}`} className="text-gray-900">
                {outcome}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">—</p>
        )}
      </DetailSection>

      <DetailSection title="Audience">
        <DetailGrid
          items={[
            { label: 'Roles', value: viewModel.audience.roles },
            { label: 'Seniority', value: viewModel.audience.seniority },
            { label: 'Size', value: viewModel.audience.size },
            { label: 'Industry', value: viewModel.audience.industry },
          ]}
        />
      </DetailSection>

      <DetailSection title="Logistics">
        <DetailGrid
          items={[
            { label: 'Type', value: viewModel.logistics.type },
            { label: 'Mode', value: viewModel.logistics.mode },
            { label: 'Duration', value: viewModel.logistics.duration },
            { label: 'Sessions', value: viewModel.logistics.sessions },
            { label: 'Timeline', value: viewModel.logistics.timeline },
            { label: 'Location', value: viewModel.logistics.location },
          ]}
        />
      </DetailSection>

      <DetailSection title="Commercial">
        <DetailGrid
          items={[
            { label: 'Budget', value: viewModel.commercial.budget },
            { label: 'Flexibility', value: viewModel.commercial.flexibility },
            { label: 'Payment Terms', value: viewModel.commercial.paymentTerms },
          ]}
        />
      </DetailSection>
    </>
  )
}

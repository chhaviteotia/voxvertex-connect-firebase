import { Link } from 'react-router-dom'

interface RequirementHeaderProps {
  title: string
  status: 'Draft' | 'Active'
  createdLabel: string
}

const STATUS_COLORS: Record<RequirementHeaderProps['status'], string> = {
  Draft: '#7C879B',
  Active: '#008C9E',
}

export default function RequirementHeader({ title, status, createdLabel }: RequirementHeaderProps) {
  return (
    <>
      <nav className="mb-2 text-sm text-gray-600">
        <Link to="/business/requirement" className="no-underline hover:text-gray-900">
          Requirements
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{title}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <span
            className="inline-flex rounded-md px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: STATUS_COLORS[status] }}
          >
            {status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Share
          </button>
        </div>
      </div>

      <p className="mb-6 text-sm text-gray-500">{createdLabel}</p>
    </>
  )
}

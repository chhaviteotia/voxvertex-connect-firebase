import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../../layouts/DashboardLayout'
import { businessSidebarItems, businessSidebarBottomItems } from '../../../config/businessNav'
import { useCreateRequirementForm } from './useCreateRequirementForm'
import { TEAL } from './constants'
import { Step1Objective } from './Step1Objective'
import { Step2Audience } from './Step2Audience'
import { Step3DepthEngagement } from './Step3DepthEngagement'
import { Step4FormatLogistics } from './Step4FormatLogistics'

export function CreateRequirementPage() {
  const form = useCreateRequirementForm()
  const { step, setStep, lastSaved } = form

  return (
    <DashboardLayout
      sidebarItems={businessSidebarItems}
      sidebarBottomItems={businessSidebarBottomItems}
      userTypeLabel="Business"
      userDisplayName="Acme Corp"
      userSubLabel="Business Account"
      sidebarClassName="bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Requirement</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {step === 1 ? 'Step 1: Define Your Objective' : step === 2 ? 'Step 2: Describe Your Audience' : step === 3 ? 'Step 3: Set Depth & Engagement' : 'Step 4: Format & Logistics'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Last saved: {lastSaved}</span>
                <Link
                  to="/business/requirement"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-8">
              <div className="h-full rounded-full bg-[#2293B4]" style={{ width: step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%' }} />
            </div>

            {step === 1 && <Step1Objective form={form} />}
            {step === 2 && <Step2Audience form={form} />}
            {step === 3 && <Step3DepthEngagement form={form} />}
            {step === 4 && <Step4FormatLogistics form={form} />}
          </div>

          <aside className="w-full lg:w-80 shrink-0 space-y-4">
            <div className="flex items-center gap-2">
              <span style={{ color: TEAL }} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3z" />
                </svg>
              </span>
              <h3 className="text-base font-bold text-gray-900">AI Insights</h3>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirement Summary</h4>
              <p className="text-sm text-gray-600">Leadership workshop for middle managers</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Suggested Expert Type</h4>
              <span className="inline-flex rounded-full px-3 py-1 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>
                Training Specialist
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Estimated Matches</h4>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                8 experts
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Budget Fit</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full bg-[#2293B4]" style={{ width: '70%' }} />
                </div>
                <span className="text-sm font-medium text-gray-700">Good</span>
              </div>
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-200 text-sky-700 text-sm font-bold">i</span>
                <p className="text-sm text-sky-900">
                  Providing more details about measurable outcomes increases match quality by 40%.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="fixed bottom-0 left-0 right-0 sm:left-56 border-t border-gray-200 bg-white py-4 z-40">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => { if (step === 2) setStep(1); if (step === 3) setStep(2); if (step === 4) setStep(3); }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8 15 3" />
              </svg>
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => { if (step === 1) setStep(2); if (step === 2) setStep(3); if (step === 3) setStep(4); }}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: TEAL }}
            >
              Continue
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </footer>

        <div className="h-20 shrink-0" aria-hidden />
      </div>
    </DashboardLayout>
  )
}

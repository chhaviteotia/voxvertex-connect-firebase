import type { CreateRequirementForm } from './useCreateRequirementForm'

export function Step3DepthEngagement({ form }: { form: CreateRequirementForm }) {
  void form
  return (
    <div className="space-y-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Set Depth &amp; Engagement</h2>
      <p className="text-gray-600">Step 3 content — set depth and engagement.</p>
    </div>
  )
}

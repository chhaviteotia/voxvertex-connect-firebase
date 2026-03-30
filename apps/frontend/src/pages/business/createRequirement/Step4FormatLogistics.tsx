import type { CreateRequirementForm } from './useCreateRequirementForm'

export function Step4FormatLogistics({ form }: { form: CreateRequirementForm }) {
  void form
  return (
    <div className="space-y-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Format &amp; Logistics</h2>
      <p className="text-gray-600">Step 4 content — format and logistics.</p>
    </div>
  )
}

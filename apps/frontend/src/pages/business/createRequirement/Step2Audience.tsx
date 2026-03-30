import type { CreateRequirementForm } from './useCreateRequirementForm'

export function Step2Audience({ form }: { form: CreateRequirementForm }) {
  void form
  return (
    <div className="space-y-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Who is your audience?</h2>
      <p className="text-gray-600">Step 2 content — describe your audience.</p>
    </div>
  )
}

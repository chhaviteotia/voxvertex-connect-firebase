import type { CreateRequirementForm } from './useCreateRequirementForm'

export function Step1Objective({ form }: { form: CreateRequirementForm }) {
  void form
  return (
    <>
      <h2 className="text-lg font-bold text-gray-900 mb-4">What&apos;s your primary outcome?</h2>
      <p className="text-gray-600">Step 1 content — select an outcome above to continue.</p>
    </>
  )
}

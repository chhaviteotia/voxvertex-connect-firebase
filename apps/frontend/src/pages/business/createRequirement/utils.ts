export function formatTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

export function levelSliderBg(value: number): string {
  return `linear-gradient(to right, #1e293b 0%, #1e293b ${((value - 1) / 4) * 100}%, #e5e7eb ${((value - 1) / 4) * 100}%)`
}

export function percentSliderBg(value: number): string {
  return `linear-gradient(to right, #1e293b 0%, #1e293b ${value}%, #e5e7eb ${value}%)`
}

export function getDurationCategory(totalDurationMinutes: string): string {
  const n = parseInt(totalDurationMinutes, 10)
  if (!Number.isFinite(n) || n < 1) return ''
  if (n < 30) return 'under 30 min'
  if (n <= 60) return 'micro (30-60 min)'
  if (n <= 120) return 'short (1-2 hrs)'
  if (n <= 240) return 'medium (2-4 hrs)'
  return 'long (4+ hrs)'
}

export const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F7F9FC] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2293B4] focus:border-transparent'
export const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

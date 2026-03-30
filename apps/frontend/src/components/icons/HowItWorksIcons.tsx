/**
 * How It Works step icons - solid blue rounded square, white outline icons.
 * 1. Document with folded corner + horizontal lines (text/data)
 * 2. Line graph / waveform (trend)
 * 3. Document with signature / flourish
 */

const wrapperClass = 'flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl text-white shadow-sm'

export function IconDocumentLines() {
  return (
    <span className={wrapperClass} aria-hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M8 10h8" />
        <path d="M8 14h8" />
        <path d="M8 10h4" />
        <path d="M8 14h4" />
      </svg>
    </span>
  )
}

/** Step 02: Upward-trending line graph / zigzag (growth, progression) */
export function IconChartWave() {
  return (
    <span className={wrapperClass} aria-hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 19V5" />
        <path d="M3 19l4-4 4 2 5-8 5 6" />
      </svg>
    </span>
  )
}

/** Step 03: Stylized brain / thought process (review & compare) */
export function IconBrain() {
  return (
    <span className={wrapperClass} aria-hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Brain: two lobes, wavy center */}
        <path d="M12 5c-2.5 0-4.5 2-4.5 4.5 0 1.2.5 2.3 1.3 3-.3.8-.5 1.6-.5 2.5 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-.9-.2-1.7-.5-2.5.8-.7 1.3-1.8 1.3-3C16.5 7 14.5 5 12 5z" />
        <path d="M9 10h6" />
        <path d="M9.5 14h5" />
      </svg>
    </span>
  )
}

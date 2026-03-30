/**
 * Service section icons - blue outline, each shown inside a light blue rounded square.
 * 1. Microphone (Book a Speaker)
 * 2. Open book (Hire a Trainer)
 * 3. Group of three people (Find a Coach)
 * 4. Lightbulb with rays (Connect with a Mentor)
 */

const iconClass = 'text-blue-600'

export function IconMicrophone({ className = '' }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass + ' ' + className}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  )
}

/** Open book outline - Hire a Trainer */
export function IconOpenBook({ className = '' }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass + ' ' + className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h6" />
    </svg>
  )
}

/** Find a Coach: central larger figure in front, two smaller behind to the sides; circular heads, trapezoidal bodies, connected at base */
export function IconGroupThree({ className = '' }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={iconClass + ' ' + className}>
      {/* Left figure (behind, smaller) - circle head + trapezoid body */}
      <circle cx="5.5" cy="6" r="1.6" />
      <path d="M3.5 8.5 L7.5 8.5 L6.5 21 L4.5 21 Z" />
      {/* Right figure (behind, smaller) - circle head + trapezoid body */}
      <circle cx="18.5" cy="6" r="1.6" />
      <path d="M16.5 8.5 L20.5 8.5 L19.5 21 L17.5 21 Z" />
      {/* Center figure (in front, larger) - circle head + trapezoid body, overlaps at base */}
      <circle cx="12" cy="5.5" r="2.1" />
      <path d="M8.5 9.5 L15.5 9.5 L14 22 L10 22 Z" />
    </svg>
  )
}

/** Lightbulb with rays emanating from top - Connect with a Mentor (idea/insight) */
export function IconLightbulb({ className = '' }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass + ' ' + className}>
      {/* Prominent rays from top of bulb */}
      <path d="M12 1v2.5" />
      <path d="M5.5 4.5l1.4 1.4" />
      <path d="M18.5 4.5l-1.4 1.4" />
      <path d="M4 9h2" />
      <path d="M18 9h2" />
      <path d="M6.2 6.2l1.4 1.4" />
      <path d="M16.4 6.2l-1.4 1.4" />
      <path d="M8.5 4l1 1.2" />
      <path d="M14.5 4l-1 1.2" />
      {/* Bulb */}
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}

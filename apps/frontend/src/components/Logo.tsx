import { Link } from 'react-router-dom'

/**
 * Brand logo. Variants:
 * - header: dark blue square + white V, "Voxvertex Connect"
 * - footer: same icon, "Voxvertex Connect" in white
 * - sidebar: white square + dark V, "Voxvertex" in white (for dark sidebar)
 */
export function Logo({ className = '', href = '/', to, variant = 'header', iconOnly = false }: { className?: string; href?: string; to?: string; variant?: 'header' | 'footer' | 'sidebar'; iconOnly?: boolean }) {
  const isFooter = variant === 'footer'
  const isSidebar = variant === 'sidebar'
  const linkClass = `inline-flex items-center gap-2 no-underline ${!iconOnly && (isFooter || isSidebar ? 'text-white' : 'text-gray-800 font-bold text-xl')} ${className}`
  const sidebarLabel = !iconOnly && isSidebar ? <span className="text-white font-bold text-lg">Voxvertex</span> : null
  const content = (
    <>
      <span className="flex shrink-0" aria-hidden>
        {isSidebar ? (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="white" />
            <path d="M10 12 L20 28 L30 12" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        ) : (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#1e3a5f" />
            <path d="M10 12 L20 28 L30 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
      </span>
      {sidebarLabel}
      {!iconOnly && !isSidebar && <span className={isFooter ? 'text-lg font-bold text-white' : ''}>Voxvertex Connect</span>}
    </>
  )
  if (to !== undefined) {
    return <Link to={to} className={linkClass}>{content}</Link>
  }
  return <a href={href} className={linkClass}>{content}</a>
}

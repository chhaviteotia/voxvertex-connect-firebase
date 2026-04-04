import { useState, useRef, useEffect } from 'react'

interface CustomSelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  className?: string
  /** Optional: hide native arrow (e.g. when using custom chevron) */
  showChevron?: boolean
  /** Dark panel styling for marketing/auth pages (default: light) */
  variant?: 'light' | 'dark'
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  className = '',
  showChevron = true,
  variant = 'light',
}: CustomSelectProps) {
  const isDark = variant === 'dark'
  const [open, setOpen] = useState(false)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = value || placeholder
  const isPlaceholder = !value

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setHoverIndex(null)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg text-left cursor-pointer focus:outline-none focus:ring-2 focus:border-transparent flex items-center justify-between gap-2 ${className} ${
          isDark
            ? `border border-white/15 bg-[#0D1018] focus:ring-[#FFB15A]/40 ${isPlaceholder ? 'text-white/45' : 'text-white'}`
            : `border border-gray-200 focus:ring-[#008C9E] focus:border-transparent ${isPlaceholder ? 'text-gray-400' : 'text-gray-800'} bg-gray-50`
        }`}
      >
        <span className="truncate">{displayValue}</span>
        {showChevron && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform ${isDark ? 'text-white/45' : 'text-gray-500'} ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>
      {open && (
        <ul
          role="listbox"
          className={`absolute z-50 mt-1 w-full rounded-lg py-1 shadow-lg max-h-60 overflow-auto ${
            isDark ? 'border border-white/15 bg-[#1A2130]' : 'border border-gray-200 bg-white'
          }`}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <li
            role="option"
            aria-selected={!value}
            onMouseEnter={() => setHoverIndex(-1)}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
            className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
              isDark
                ? hoverIndex === -1
                  ? 'bg-[#FFB15A]/25 text-[#FFB15A]'
                  : 'bg-transparent text-white/90'
                : hoverIndex === -1
                  ? 'bg-[#2293b4] text-white'
                  : 'bg-white text-gray-800'
            }`}
          >
            {placeholder}
          </li>
          {options.map((opt, i) => {
            const isSelected = value === opt
            return (
              <li
                key={opt}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHoverIndex(i)}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 ${
                  isDark
                    ? isSelected || hoverIndex === i
                      ? 'bg-[#FFB15A] text-[#25160A]'
                      : 'bg-transparent text-white/90'
                    : isSelected
                      ? 'bg-[#2293B4] text-white'
                      : hoverIndex === i
                        ? 'bg-[#2293B4] text-white'
                        : 'bg-white text-gray-800'
                }`}
              >
                <span>{opt}</span>
                {isSelected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

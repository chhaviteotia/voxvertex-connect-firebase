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
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  className = '',
  showChevron = true,
}: CustomSelectProps) {
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
        className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#008C9E] focus:border-transparent flex items-center justify-between gap-2 ${className} ${
          isPlaceholder ? 'text-gray-400' : 'text-gray-800'
        } bg-gray-50`}
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
            className={`shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg max-h-60 overflow-auto"
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
              hoverIndex === -1 ? 'bg-[#2293b4] text-white' : 'bg-white text-gray-800'
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
                  isSelected ? 'bg-[#2293B4] text-white' : hoverIndex === i ? 'bg-[#2293B4] text-white' : 'bg-white text-gray-800'
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

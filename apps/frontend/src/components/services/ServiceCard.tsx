import { IconMicrophone, IconOpenBook, IconGroupThree, IconLightbulb } from '../icons/ServiceIcons'

export type ServiceCardId = 'speaker' | 'trainer' | 'coach' | 'mentor'

const iconMap = {
  speaker: IconMicrophone,
  trainer: IconOpenBook,
  coach: IconGroupThree,
  mentor: IconLightbulb,
}

/** Light blue rounded square wrapper for service icon (matches attached design) */
const iconWrapperClass = 'flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl text-blue-600 shadow-sm mb-4'

export interface ServiceCardProps {
  id: ServiceCardId
  title: string
  description: string
  duration: string
  ctaText: string
  ctaHref: string
}

export function ServiceCard({ id, title, description, duration, ctaText, ctaHref }: ServiceCardProps) {
  const Icon = iconMap[id]
  return (
    <article className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-start text-left">
      <span className={iconWrapperClass} aria-hidden>
        <Icon />
      </span>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-[15px] leading-normal text-gray-600 mb-3 flex-grow">{description}</p>
      <span className="text-xs text-gray-500 mb-4">{duration}</span>
      <a href={ctaHref} className="text-[15px] font-medium text-blue-600 no-underline hover:underline">
        {ctaText} →
      </a>
    </article>
  )
}

import { ServiceCard } from './ServiceCard'

const services = [
  { id: 'speaker' as const, title: 'Book a Speaker', description: 'One-time event presentations, keynotes, and panel discussions', duration: 'Typical: 1-3 hours', ctaText: 'Post Speaker Request', ctaHref: '/post-speaker-request' },
  { id: 'trainer' as const, title: 'Hire a Trainer', description: 'Workshops, bootcamps, and hands-on skill development programs', duration: 'Typical: Half-day to multi-day', ctaText: 'Post Training Request', ctaHref: '/post-training-request' },
  { id: 'coach' as const, title: 'Find a Coach', description: 'Ongoing support for teams or individuals on specific challenges', duration: 'Typical: 3-6 month engagements', ctaText: 'Post Coaching Request', ctaHref: '/post-coaching-request' },
  { id: 'mentor' as const, title: 'Connect with a Mentor', description: 'Long-term strategic guidance and advisory relationships', duration: 'Typical: 6-12+ month advisory', ctaText: 'Post Mentor Request', ctaHref: '/post-mentor-request' },
]

export function ServicesSection() {
  return (
    <section className="px-6 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s) => (
          <ServiceCard key={s.id} {...s} />
        ))}
      </div>
    </section>
  )
}

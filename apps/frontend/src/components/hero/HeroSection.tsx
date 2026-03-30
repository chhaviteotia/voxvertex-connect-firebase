import { HeroBadge } from '../HeroBadge'

export function HeroSection() {
  return (
    <section className="max-w-3xl mx-auto py-16 px-6 text-center">
      <HeroBadge />
      <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight tracking-tight mb-4">
        Find the Right Expert for Your Learning & Event Needs
      </h1>
      <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-[560px] mx-auto">
        Speakers, trainers, coaches, and mentors — matched through structured requirements and intelligent scoring.
      </p>
      <div className="flex flex-wrap gap-4 justify-center mb-12">
        <a href="/business/create-requirement" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg bg-blue-600 text-white border-0 no-underline hover:bg-blue-700 transition-colors">
          Post Requirement
        </a>
        <a href="/join-expert" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg bg-white text-gray-800 border border-gray-200 no-underline hover:bg-gray-50 hover:border-gray-300 transition-colors">
          Join as Expert
        </a>
      </div>
      <div className="flex flex-wrap justify-center gap-12">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-gray-800">420+</span>
          <span className="text-sm text-gray-500 mt-1">Verified Experts</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-gray-800">89%</span>
          <span className="text-sm text-gray-500 mt-1">Match Rate</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-gray-800">18hr</span>
          <span className="text-sm text-gray-500 mt-1">Avg. Response</span>
        </div>
      </div>
    </section>
  )
}

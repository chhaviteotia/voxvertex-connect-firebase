import { Link } from 'react-router-dom'

import { MarketingFooter } from './MarketingFooter'
import { MarketingNav } from './MarketingNav'

export function Solutions() {
  return (
    <div className="min-h-screen bg-[#060A12] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur">
        <div className="flex h-18 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 text-xl font-semibold tracking-tight text-[#FFB15A] no-underline sm:text-2xl">
            Connect
          </Link>
          <MarketingNav />
          <div className="flex shrink-0 items-center gap-5">
            <Link to="/signin" className="text-sm text-white/70 no-underline hover:text-white">Login</Link>
            <Link
              to="/signup"
              className="rounded-lg bg-[#FFB15A] px-6 py-2.5 text-sm font-semibold text-[#25160A] no-underline hover:brightness-95"
            >
              Signup
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full">
        <section className="bg-black px-4 py-12 text-left sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="max-w-[1200px]">
            <h1 className="max-w-[640px] text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl sm:leading-[1.05] lg:text-5xl lg:leading-[0.98]">
              <span className="block text-white">The Intelligence</span>
              <span className="block text-[#E8D4BC]">Behind The Match.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#9CA3AF] sm:mt-6 sm:text-base">
              Our AI Engine doesn&apos;t just search keywords. It maps the neural architecture of expertise to solve
              complex enterprise objectives with mathematical precision.
            </p>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px]">
        <section className="grid grid-cols-1 gap-8 py-6 md:grid-cols-12 md:gap-6">
          <div className="space-y-8 md:col-span-5 md:space-y-7">
            <div>
              <h3 className="text-xl font-semibold text-[#FF7E45] sm:text-2xl">Outcome Analysis</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60 sm:text-base">
                We decode your project goals into high-dimensional vectors, ensuring the target outcome drives the
                expert selection, not just the title.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#FFBF4D] sm:text-2xl">Expertise Mapping</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60 sm:text-base">
                Cross-referencing 50M+ data points including proprietary project history, technical publications, and
                verified network feedback.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#FFBF4D] sm:text-2xl">Fit Scoring</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60 sm:text-base">
                A multi-layered confidence score representing logistical feasibility, commercial alignment, and
                cognitive depth.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e14] sm:rounded-3xl md:col-span-7">
            <div className="bg-[radial-gradient(ellipse_85%_65%_at_50%_32%,rgba(32,110,118,0.22),rgba(6,8,12,0.96)_52%)] px-4 py-8 sm:px-6 sm:py-10 md:py-12">
              <div className="mx-auto w-full max-w-[312px] sm:max-w-[352px]">
                <div className="flex overflow-hidden rounded-2xl bg-[#141920] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="w-[3px] shrink-0 self-stretch bg-[#FF7E45]" aria-hidden />
                  <div className="min-w-0 flex-1 space-y-2.5 p-3.5 sm:space-y-3 sm:p-4">
                    <div className="flex items-center gap-2.5">
                      <SolutionsInputVectorIcon className="h-6 w-6 shrink-0 sm:h-[26px] sm:w-[26px]" />
                      <span className="text-[11px] font-bold tracking-[0.16em] text-white sm:text-xs">
                        INPUT VECTOR
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-black/55">
                      <div className="h-2 w-[75%] rounded-full bg-[#FF7E45]" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center py-7 text-white/25 sm:py-9" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 sm:h-5 sm:w-5" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <MetricCard title="Contextual Fit" value="98.4%" />
                  <MetricCard title="Domain Depth" value="92.1%" />
                </div>

                <div className="mt-5 rounded-2xl border border-[#FF7E45]/40 bg-[#1a1f28] p-3.5 sm:mt-6 sm:p-4">
                  <div className="flex items-center justify-between gap-3 pr-0.5">
                    <div className="min-w-0 text-left">
                      <div className="text-[9px] font-semibold tracking-[0.12em] text-[#FF7E45] sm:text-[10px]">
                        RECOMMENDED MATCH
                      </div>
                      <div className="mt-1 text-base font-semibold text-white sm:text-lg">Expert Tier: Strategist</div>
                    </div>
                    <SolutionsVerifiedBadge className="aspect-square h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <div className="rounded-2xl border border-white/10 bg-[#121826] p-4 sm:rounded-3xl sm:p-6 md:p-7">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">Define Your Requirements</h2>
            <p className="mx-auto mt-1.5 max-w-lg text-center text-xs text-white/55 sm:mt-2 sm:max-w-xl sm:text-sm">
              Our engine processes five distinct layers of intent to ensure zero-waste expert engagement.
            </p>
            <div className="mx-auto mt-5 grid max-w-xl grid-cols-5 gap-1.5 text-center sm:mt-6 sm:max-w-2xl sm:gap-3 md:max-w-3xl">
              {['OBJECTIVE', 'AUDIENCE', 'DEPTH', 'LOGISTICS', 'COMMERCIAL'].map((s, i) => (
                <div key={s}>
                  <div className={`mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold sm:mb-1.5 sm:h-7 sm:w-7 sm:text-xs ${i === 0 ? 'bg-[#FF7E45] text-black' : 'bg-white/10 text-white/70'}`}>
                    {i + 1}
                  </div>
                  <div className="text-[8px] font-semibold tracking-[0.08em] text-white/45 sm:text-[10px] sm:tracking-[0.1em]">{s}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[#0E131E] p-3 sm:rounded-xl sm:p-4 md:rounded-2xl md:p-5">
                <div className="text-[11px] font-semibold tracking-[0.1em] text-[#FF7E45] sm:text-xs">CORE OBJECTIVE</div>
                <div className="mt-1.5 h-[4.5rem] rounded-md bg-black/60 p-2.5 text-xs text-white/30 sm:mt-2 sm:h-20 sm:rounded-lg sm:p-3 sm:text-sm md:h-24 md:rounded-xl md:p-4">Describe the outcome you are seeking...</div>
                <div className="mt-3 text-[10px] font-semibold tracking-[0.1em] text-white/45 sm:mt-4 sm:text-[11px]">QUICK SELECT</div>
                <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2 sm:gap-1.5">
                  {['Market Entry', 'Technical Audit', 'M&A Due Diligence', 'Strategic Pivot'].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80 sm:px-2.5 sm:py-1 sm:text-xs">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="w-full rounded-2xl bg-[#1E1F23] p-6 sm:rounded-[18px] sm:p-7 md:p-8">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-[11px] font-bold leading-none text-white sm:h-7 sm:w-7 sm:text-xs"
                    aria-hidden
                  >
                    i
                  </span>
                  <h3 className="text-lg font-bold text-white sm:text-xl">Engine Insight</h3>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-[#9CA3AF] sm:mt-6 sm:text-[15px]">
                  Based on your current input, the engine is prioritizing{' '}
                  <span className="font-bold text-[#F97316]">Strategic Level</span> experts with backgrounds in{' '}
                  <span className="font-bold text-[#F97316]">Emerging Markets</span>.
                </p>
                <div className="mt-6 flex items-center justify-between gap-3 sm:mt-7">
                  <span className="text-xs text-[#9CA3AF] sm:text-sm">Analysis Depth</span>
                  <span className="text-xs font-medium text-[#F97316] sm:text-sm">Processing...</span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black">
                  <div className="h-full w-1/2 rounded-full bg-[#F97316]" />
                </div>
                <button
                  type="button"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#374151] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#404956] sm:mt-7 sm:py-3.5 sm:text-base"
                >
                  Next: Define Audience
                  <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 pb-10 sm:gap-4 sm:pb-12 md:grid-cols-12">
          <div className="rounded-xl border border-white/10 bg-[#121824] p-4 sm:rounded-2xl sm:p-5 md:col-span-7 md:rounded-3xl md:p-6">
            <div className="mb-2 sm:mb-3">
              <NeuralMatchingIcon className="h-7 w-7 text-[#FF7E45] sm:h-8 sm:w-8" />
            </div>
            <h3 className="text-xl font-semibold sm:text-2xl">Neural Matching</h3>
            <p className="mt-1.5 text-xs text-white/65 sm:mt-2 sm:text-sm">
              Our proprietary algorithm goes beyond basic profiles to analyze the tacit knowledge of our network,
              matching based on actual lived experience in specific scenarios.
            </p>
            <div className="mt-3 flex gap-2 sm:mt-4">
              <div className="h-12 w-12 rounded bg-white/10 sm:h-14 sm:w-14 md:h-16 md:w-16" />
              <div className="h-12 w-12 rounded bg-white/10 sm:h-14 sm:w-14 md:h-16 md:w-16" />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#26222A] p-4 sm:rounded-2xl sm:p-5 md:col-span-5 md:rounded-3xl md:p-6">
            <div className="mb-2 sm:mb-3">
              <ComplianceShieldIcon className="h-7 w-7 text-[#FF7E45] sm:h-8 sm:w-8" />
            </div>
            <h3 className="text-xl font-semibold sm:text-2xl">Compliance Guard</h3>
            <p className="mt-1.5 text-xs text-white/65 sm:mt-2 sm:text-sm">
              Every match is vetted through an automated multi-step compliance framework to ensure data integrity and
              intellectual property protection.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#121824] p-4 sm:rounded-2xl sm:p-5 md:col-span-3 md:rounded-3xl md:p-6">
            <div className="mb-2 sm:mb-3">
              <FitScoringIcon className="h-7 w-7 text-[#FF7E45] sm:h-8 sm:w-8" />
            </div>
            <h3 className="text-xl font-semibold sm:text-2xl">Fit Scoring</h3>
            <p className="mt-1.5 text-xs text-white/65 sm:mt-2 sm:text-sm">
              Real-time adjustments to candidate ranking as you refine your project parameters throughout the intake
              process.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0C111A] p-4 sm:rounded-2xl sm:p-5 md:col-span-9 md:rounded-3xl md:p-6">
            <div className="flex h-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
              <div>
                <h3 className="text-xl font-semibold sm:text-2xl">Ready to explore?</h3>
                <p className="mt-1.5 text-xs text-white/65 sm:mt-2 sm:text-sm">
                  See how our AI Engine transforms vague needs into concrete expertise.
                </p>
              </div>
              <button type="button" className="shrink-0 rounded-md bg-[#FFB15A] px-5 py-2 text-xs font-semibold text-[#1F140A] sm:rounded-lg sm:px-6 sm:py-2.5 sm:text-sm">Request Demo</button>
            </div>
          </div>
        </section>
        </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

function NeuralMatchingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect
        x="5.5"
        y="15"
        width="11"
        height="11"
        rx="0.5"
        fill="currentColor"
        opacity="0.72"
        transform="rotate(45 11 20.5)"
      />
      <rect x="11" y="6" width="12" height="12" rx="0.5" fill="currentColor" transform="rotate(45 17 12)" />
    </svg>
  )
}

function ComplianceShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.25c-.35 0-.7.06-1.03.18L5.5 4.42c-.93.31-1.5 1.18-1.5 2.15v5.18c0 4.35 3.15 8.42 7.65 9.93.12.04.25.06.38.06s.26-.02.38-.06c4.5-1.5 7.65-5.58 7.65-9.93V6.57c0-.97-.57-1.84-1.5-2.15L13.03 2.43c-.33-.12-.68-.18-1.03-.18z"
      />
    </svg>
  )
}

function FitScoringIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.5" y="14" width="4" height="7.5" rx="1" fill="currentColor" />
      <rect x="8.5" y="10.5" width="4" height="11" rx="1" fill="currentColor" />
      <rect x="14.5" y="5.5" width="4" height="16" rx="1" fill="currentColor" />
      <path
        d="M2.5 16.5 6.5 13 10.5 11.5 14.5 8.5 18.5 5.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fill="currentColor"
        d="M17.8 4.2 21.8 3.5 20.2 7.1z"
      />
    </svg>
  )
}

function SolutionsInputVectorIcon({ className }: { className?: string }) {
  const orange = '#FF7E45'
  const cutout = '#141920'

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill={orange}
        d="M4.15 20.25c0-3.1 1.05-5.65 3.05-7.35 1.05-.85 2.4-1.45 3.85-1.7.45-2.15 2.3-3.75 4.65-3.75 2.55 0 4.6 2.05 4.6 4.6 0 1.15-.45 2.2-1.2 3-.7.75-1.65 1.3-2.75 1.55-1.85.45-3.45 1.2-4.45 2.35-.85.95-1.4 2.15-1.55 3.45H4.15v-1.15z"
      />
      <g transform="translate(13.55, 8.05) scale(0.305)">
        <path
          fill={cutout}
          d="M12 2.25a.75.75 0 01.656.386l1.005 1.723a8 8 0 013.546.018l1.036-1.695a.75.75 0 011.091-.21l2.299 1.68a.75.75 0 01.12 1.11l-1.02 1.728a8 8 0 013.4 3.4l1.729-1.02a.75.75 0 011.11.12l1.68 2.298a.75.75 0 01-.21 1.091l-1.696 1.037a8 8 0 01-.017 3.547l1.695 1.036a.75.75 0 01.21 1.091l-1.68 2.299a.75.75 0 01-1.11.12l-1.728-1.02a8 8 0 01-3.4 3.4l1.02 1.729a.75.75 0 01-.12 1.11l-2.298 1.68a.75.75 0 01-1.091-.21l-1.037-1.695a8 8 0 01-3.547.018l-1.036 1.695a.75.75 0 01-1.091.21l-2.299-1.68a.75.75 0 01-.12-1.11l1.02-1.728a8 8 0 01-3.4-3.4l-1.729 1.02a.75.75 0 01-1.11-.12l-1.68-2.298a.75.75 0 01.21-1.091l1.695-1.037a8 8 0 01-.018-3.547l-1.695-1.036a.75.75 0 01-.21-1.092l1.68-2.298a.75.75 0 011.091-.211l1.728 1.021a8 8 0 013.445-3.145l.023-.018.02-1.036a.75.75 0 01.388-.656l2.298-1.68zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
        />
      </g>
    </svg>
  )
}

function SolutionsVerifiedBadge({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        fill="#FF7E45"
        stroke="#D46230"
        strokeWidth="0.5"
        strokeLinejoin="round"
        d="M24,4 L30.31,8.76 L38.14,9.86 L39.24,17.69 L44,24 L39.24,30.31 L38.14,38.14 L30.31,39.24 L24,44 L17.69,39.24 L9.86,38.14 L8.76,30.31 L4,24 L8.76,17.69 L9.86,9.86 L17.69,8.76 Z"
      />
      <path
        d="M14.8 24.2 20.6 31 33.8 16.2"
        stroke="#1a1f28"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#1e232e] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-xl sm:p-2.5">
      <div className="text-[8px] capitalize leading-tight text-white/50 sm:text-[9px]">{title}</div>
      <div className="mt-0.5 text-base font-bold tabular-nums text-[#FF7E45] sm:mt-1 sm:text-lg">{value}</div>
    </div>
  )
}

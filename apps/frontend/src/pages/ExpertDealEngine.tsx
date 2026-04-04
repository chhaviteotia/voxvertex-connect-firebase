import { Link } from 'react-router-dom'

import { MarketingFooter } from './MarketingFooter'
import { MarketingNav } from './MarketingNav'

const BENEFITS = [
  {
    icon: <IconFilter />,
    title: 'Less competition',
    body: 'Exclusive deal flow accessed only by top-tier consultants. No bidding wars, just direct intelligence matching.',
    metric: '84%',
    caption: 'FEWER BIDDERS',
  },
  {
    icon: <IconNodes />,
    title: 'Better fit clients',
    body: 'AI-vetted briefs that match your technology stack, industry focus, and desired project complexity.',
    metric: '92%',
    caption: 'MATCH ACCURACY',
  },
  {
    icon: <IconArrow />,
    title: 'Higher conversion',
    body: 'Focus your time on closing pre-qualified leads that have already been vetted for budget and timeline.',
    metric: '3.5x',
    caption: 'ROI MULTIPLIER',
  },
]

export function ExpertDealEngine() {
  return (
    <div className="min-h-screen bg-[#060A12] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur">
        <div className="flex h-18 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 text-2xl font-semibold tracking-tight text-[#FFB15A] no-underline sm:text-[26px]">
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

      <main className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px]">
        <section className="py-10 sm:py-12">
          <div className="mb-4 inline-flex rounded-full border border-[#FF9B3D]/20 bg-[#2A1C15] px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#FF9B3D]">
            FOR ELITE EXPERTS
          </div>
          <h1 className="max-w-[640px] text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl sm:leading-[0.98]">
            <span className="block">Get matched to</span>
            <span className="block text-[#FF9B3D]">high-value</span>
            <span className="block">opportunities.</span>
          </h1>
          <p className="mt-5 max-w-[720px] text-left text-lg leading-relaxed text-slate-400 sm:text-xl">
            <span className="block">Bypass the noise. Voxvertex uses proprietary decision intelligence to</span>
            <span className="block">surface mandates that align with your specific architectural expertise</span>
            <span className="block">and commercial goals.</span>
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 py-8 md:grid-cols-3 md:py-10">
          {BENEFITS.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-[#171C27] p-6">
              <div className="mb-4 text-[#FF9B3D]">{item.icon}</div>
              <h3 className="text-2xl font-semibold leading-tight sm:text-[28px]">{item.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-white/60 sm:text-[17px]">{item.body}</p>
              <div className="mt-6 border-t border-white/10 pt-4">
                <span className="text-4xl font-semibold text-[#FF9B3D] sm:text-[2.75rem]">{item.metric}</span>
                <span className="ml-2 text-xs font-semibold tracking-[0.14em] text-white/35 sm:text-[13px]">{item.caption}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 items-center gap-8 py-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Inbound Deal Engine</h2>
            <p className="mt-3 text-base leading-relaxed text-white/60 sm:text-lg">
              Our real-time dashboard acts as your digital scout. While you focus on delivery, Voxvertex monitors global
              demand to bring you high-quality matches instantly.
            </p>
            <ul className="mt-6 space-y-3 text-base font-medium text-white/80 sm:text-lg">
              <li className="flex items-center gap-3"><IconCheck /> Verified Budget &amp; Authority</li>
              <li className="flex items-center gap-3"><IconBolt /> Real-time Matching Notifications</li>
              <li className="flex items-center gap-3"><IconBadge /> GDPR &amp; Expert Compliance Vetted</li>
            </ul>
          </div>
          <div className="md:col-span-7">
            <div className="rounded-2xl border border-white/[0.08] bg-black p-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:rounded-3xl sm:p-5">
              <div className="mb-4 flex items-center justify-between sm:mb-5">
                <div className="flex items-center gap-2" aria-hidden>
                  <span className="h-3 w-3 shrink-0 rounded-full bg-[#6B2F0F]" />
                  <span className="h-3 w-3 shrink-0 rounded-full bg-[#E85D04]" />
                  <span className="h-3 w-3 shrink-0 rounded-full bg-[#D4A574]" />
                </div>
                <div className="rounded-md bg-[#2C3038] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white sm:text-[11px]">
                  EXPERT DASHBOARD V4.2
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <ExpertOpportunityCard
                  emphasis="active"
                  matchScore="98%"
                  timeAgo="2 mins ago"
                  title="Cloud Infrastructure Audit • Fortune 500"
                  tags={['Terraform', 'AWS Security', 'Governance']}
                  value="$45k - $60k"
                />
                <ExpertOpportunityCard
                  emphasis="dim"
                  matchScore="94%"
                  timeAgo="15 mins ago"
                  title="AI Implementation Roadmap"
                  tags={['LLM Ops', 'Python']}
                  value="$20k - $30k"
                />
                <ExpertOpportunityCard
                  emphasis="ghost"
                  matchScore="87%"
                  timeAgo="1 hour ago"
                  title="System Scaling Advisory"
                  tags={['Architecture']}
                  value="$15k+"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#07080c] px-7 py-12 text-center sm:rounded-[28px] sm:px-10 sm:py-14 md:px-14 md:py-16">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_42%,rgba(255,170,120,0.22)_0%,rgba(255,140,90,0.1)_28%,transparent_58%)]"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,200,160,0.06)_0%,transparent_45%)]" aria-hidden />
            <div className="relative z-10 mx-auto max-w-4xl">
              <h2 className="text-balance text-2xl font-bold leading-[1.15] text-white [text-shadow:0_0_42px_rgba(255,140,80,0.28),0_0_80px_rgba(255,120,60,0.12)] sm:text-3xl md:text-4xl md:leading-[1.12] lg:text-[2.65rem]">
                <span className="block">Your next high-value contract is</span>
                <span className="block">one algorithm away.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-relaxed text-white/50 sm:mt-7 sm:text-lg">
                <span className="block">
                  Join the world&apos;s most sophisticated expert network. No generic job boards. No
                </span>
                <span className="block">low-quality leads.</span>
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
                <button
                  type="button"
                  className="rounded-md bg-gradient-to-b from-[#FFD4A8] via-[#FFB366] to-[#FF8C42] px-7 py-2.5 text-sm font-bold text-[#0c0a08] shadow-[0_0_20px_rgba(255,140,80,0.55),0_0_48px_rgba(255,120,70,0.28),0_4px_14px_rgba(0,0,0,0.35)] transition-[filter,transform] hover:brightness-[1.03] active:scale-[0.99] sm:px-9 sm:py-3 sm:text-base"
                >
                  Start Matching Now
                </button>
                <button
                  type="button"
                  className="rounded-md border border-zinc-600/80 bg-transparent px-7 py-2.5 text-sm font-bold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-white/[0.03] sm:px-9 sm:py-3 sm:text-base"
                >
                  View Sample Deals
                </button>
              </div>
              <div className="mt-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600 sm:mt-10 sm:text-[11px] sm:tracking-[0.24em]">
                APPLICATION VETTING TAKES APPROX. 48 HOURS
              </div>
            </div>
          </div>
        </section>
        </div>
      </main>

      <MarketingFooter className="mt-10" />
    </div>
  )
}

type CardEmphasis = 'active' | 'dim' | 'ghost'

function ExpertOpportunityCard({
  matchScore,
  timeAgo,
  title,
  tags,
  value,
  emphasis,
}: {
  matchScore: string
  timeAgo: string
  title: string
  tags: string[]
  value: string
  emphasis: CardEmphasis
}) {
  const tierClass =
    emphasis === 'active' ? 'opacity-100' : emphasis === 'dim' ? 'opacity-[0.88]' : 'opacity-[0.38]'

  return (
    <div
      className={`flex overflow-hidden rounded-xl border border-white/[0.06] bg-[#1A1D24] transition-opacity ${tierClass}`}
    >
      <div
        className={`w-[3px] shrink-0 self-stretch ${emphasis === 'active' ? 'bg-[#FF8C00]' : 'bg-transparent'}`}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 items-start justify-between gap-4 py-4 pl-3.5 pr-4 sm:pl-4 sm:pr-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs">
            <span className="font-bold text-[#FF8C00]">
              {matchScore} <span className="font-semibold tracking-[0.06em]">MATCH SCORE</span>
            </span>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <span className="text-white/45">{timeAgo}</span>
          </div>
          <h3 className="mt-2 text-base font-bold leading-snug text-white sm:text-lg">{title}</h3>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-[#2F343E] px-2 py-1 text-[11px] font-medium text-white/95 sm:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-bold tabular-nums text-white sm:text-xl">{value}</div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45 sm:text-[10px]">
            ESTIMATED VALUE
          </div>
        </div>
      </div>
    </div>
  )
}

function IconFilter() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path d="M4 6h16l-6 7v5l-4 2v-7z" />
    </svg>
  )
}

function IconNodes() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <circle cx="12" cy="4.5" r="2.2" />
      <circle cx="18.5" cy="9" r="2.2" />
      <circle cx="16" cy="16.5" r="2.2" />
      <circle cx="8" cy="16.5" r="2.2" />
      <circle cx="5.5" cy="9" r="2.2" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <path d="M4 16 16 4" />
      <path d="M10 4h6v6" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-[#FF9B3D]">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.3 2.2 2.2 4.8-4.8" />
    </svg>
  )
}

function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#FF9B3D]">
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  )
}

function IconBadge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-[#FF9B3D]">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="m9.5 12 1.8 1.8 3.2-3.2" />
    </svg>
  )
}

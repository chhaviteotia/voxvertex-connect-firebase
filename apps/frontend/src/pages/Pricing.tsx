import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { MarketingFooter } from './MarketingFooter'
import { MarketingNav } from './MarketingNav'

const PLANS = [
  {
    name: 'FREE',
    price: '₹0',
    suffix: '/month',
    features: ['3-5 AI-matched opportunities', 'Basic profile', 'Standard visibility', 'No analytics'],
    cta: 'Start for Free',
    mutedLast: true,
  },
  {
    name: 'STARTER',
    price: '₹999',
    suffix: '/month',
    features: ['15-20 AI-matched opportunities', 'Basic analytics', 'Standard ranking', 'Mid-tier access'],
    cta: 'Choose Starter',
  },
  {
    name: 'PRO',
    price: '₹1,999',
    suffix: '/month',
    features: ['Unlimited opportunities', 'Priority ranking', 'High-tier access', 'Advanced analytics', 'Early access'],
    cta: 'Get Pro Access',
    highlighted: true,
  },
]

export function Pricing() {
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

      <main className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px]">
        <section className="py-8 sm:py-10">
          <div className="mb-3 inline-flex rounded-full border border-[#FF9B3D]/20 bg-[#2A1C15] px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#FF9B3D] sm:mb-4 sm:px-3.5 sm:py-1.5 sm:text-xs">
            • FLEXIBLE SCALING
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Simple Pricing for <span className="text-[#FFB15A]">Experts</span> Who Want Better Opportunities
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:mt-5 sm:text-base lg:text-lg">
            Start for free. Upgrade when you want more high-quality matches and visibility. No hidden fees, just pure growth.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
            <button type="button" className="rounded-lg bg-[#FFB15A] px-5 py-2.5 text-sm font-semibold text-[#1F140A] sm:rounded-xl sm:px-6 sm:py-3 sm:text-base">
              Get Started Free
            </button>
            <button type="button" className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/85 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base">
              View Plans
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 py-8 sm:gap-5 sm:py-10 md:grid-cols-3 md:items-stretch">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex h-full flex-col rounded-xl border p-5 sm:rounded-2xl sm:p-6 ${plan.highlighted ? 'border-[#FFB15A]/40 bg-[#2A2730]' : 'border-white/10 bg-[#171C27]'}`}
            >
              {plan.highlighted && (
                <span className="absolute right-4 top-[-10px] rounded-full bg-[#FFB15A] px-2.5 py-0.5 text-[10px] font-semibold text-black sm:right-5 sm:px-3 sm:py-1 sm:text-xs">
                  MOST POPULAR
                </span>
              )}
              <div className="shrink-0">
                <div className="text-xs font-semibold tracking-[0.12em] text-white/60">{plan.name}</div>
                <div className="mt-2 sm:mt-3">
                  <span className="text-3xl font-semibold tabular-nums sm:text-4xl">{plan.price}</span>
                  <span className="ml-1 text-sm text-white/55 sm:text-base">{plan.suffix}</span>
                </div>
              </div>
              <ul className="mt-4 flex-1 space-y-2.5 text-sm text-white/80 sm:mt-5 sm:space-y-3 sm:text-base">
                {plan.features.map((f, idx) => (
                  <li key={f} className={`flex items-start gap-2.5 ${plan.mutedLast && idx === plan.features.length - 1 ? 'text-white/25' : ''}`}>
                    <span className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] sm:h-5 sm:w-5 sm:text-xs ${plan.mutedLast && idx === plan.features.length - 1 ? 'bg-white/12' : 'bg-[#FFB15A] text-[#1a140a]'}`}>
                      {plan.mutedLast && idx === plan.features.length - 1 ? '×' : '✓'}
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`mt-6 w-full shrink-0 rounded-lg py-2.5 text-sm font-semibold sm:mt-6 sm:rounded-xl sm:py-3 sm:text-base ${plan.highlighted ? 'bg-[#FFB15A] text-[#1F140A]' : 'bg-white/12 text-white/90'}`}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 bg-black py-8 sm:gap-8 sm:py-10 md:grid-cols-12 md:items-stretch">
          <div className="flex flex-col md:col-span-6">
            <h2 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">Why Experts Pay for Voxvertex Connect</h2>
            <p className="mt-3 text-sm text-white/55 sm:mt-4 sm:text-base">We filter out the noise so you can focus on high-impact work that actually pays.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:mt-8 sm:gap-5">
              <MiniReason
                icon={<PricingHighIntentIcon className="h-5 w-5 text-[#FF7E45]" />}
                title="High-intent only"
                text="Direct connections with decision-makers ready to sign contracts."
              />
              <MiniReason
                icon={<PricingNoColdIcon className="h-5 w-5 text-[#FF7E45]" />}
                title="No cold outreach"
                text="Stop chasing leads. Let our AI system bring the perfect roles to you."
              />
              <MiniReason
                icon={<PricingAiHeadIcon className="h-5 w-5 text-[#FF7E45]" />}
                title="AI-matched"
                text="Hyper-accurate matching based on your unique skill vector."
              />
              <MiniReason
                icon={<PricingClockIcon className="h-5 w-5 text-[#FF7E45]" />}
                title="Save time"
                text="Cut down searching time by 80% with curated opportunity feeds."
              />
            </div>
          </div>
          <div className="flex min-h-[260px] md:col-span-6 md:min-h-0 md:h-full">
            <div className="flex h-full w-full min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c10] p-2 sm:min-h-0 sm:rounded-3xl sm:p-3">
              <div
                className="h-full min-h-[240px] flex-1 rounded-xl sm:min-h-0 lg:rounded-2xl"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse 85% 55% at 50% 28%, rgba(255, 190, 120, 0.22), transparent 55%),
                    radial-gradient(ellipse 60% 40% at 50% 85%, rgba(255, 160, 70, 0.08), transparent 45%),
                    linear-gradient(165deg, rgba(255, 200, 140, 0.06) 0%, transparent 42%),
                    repeating-linear-gradient(
                      -18deg,
                      transparent,
                      transparent 11px,
                      rgba(255, 180, 100, 0.07) 11px,
                      rgba(255, 180, 100, 0.07) 12px
                    ),
                    repeating-linear-gradient(
                      72deg,
                      transparent,
                      transparent 14px,
                      rgba(255, 170, 90, 0.05) 14px,
                      rgba(255, 170, 90, 0.05) 15px
                    ),
                    linear-gradient(180deg, #050608 0%, #0c0e14 45%, #06080c 100%)
                  `,
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-6 sm:py-8">
          <div className="grid grid-cols-3 gap-3 text-center sm:gap-6">
            <div>
              <div className="text-3xl font-semibold text-[#FFB15A] sm:text-4xl">3x</div>
              <div className="mt-1 text-xs text-white/70 sm:text-sm">Better Relevance</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-[#FFB15A] sm:text-4xl">50%</div>
              <div className="mt-1 text-xs text-white/70 sm:text-sm">Higher Response</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-[#FFB15A] sm:text-4xl">24h</div>
              <div className="mt-1 text-xs text-white/70 sm:text-sm">Avg. Match Time</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-5 md:grid-cols-2">
            <Testimonial text="Voxvertex Connect transformed how I find projects. The Pro plan paid for itself within the first week of using the priority ranking feature." name="Sarah Jenkins" role="Strategic Consultant" />
            <Testimonial text="The AI matching is scary accurate. I stopped looking at other job boards entirely. If it’s high-tier, it’s on Voxvertex." name="David Chen" role="Technical Architect" />
          </div>
        </section>

        <section className="py-8 sm:py-10">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Frequently Asked Questions</h2>
          <div className="mx-auto mt-5 max-w-2xl space-y-3 sm:mt-6 sm:max-w-3xl sm:space-y-4">
            {['How do I get started with matches?', 'Can I cancel my subscription anytime?', 'What kind of opportunities are available?'].map((q) => (
              <div
                key={q}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#171C27] px-4 py-3 text-left text-sm sm:rounded-xl sm:px-5 sm:py-3.5 sm:text-base"
              >
                <span>{q}</span>
                <span className="shrink-0 text-white/45">⌄</span>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-10 sm:pb-12">
          <div className="rounded-2xl border border-white/10 bg-[#343540] px-5 py-10 text-center sm:rounded-[28px] sm:px-8 sm:py-12">
            <h2 className="text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">Ready to Get Better Opportunities?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/65 sm:mt-4 sm:max-w-2xl sm:text-base">
              Join over 10,000+ top-tier experts receiving curated, high-value opportunities daily.
            </p>
            <button type="button" className="mt-6 rounded-lg bg-[#FFB15A] px-6 py-2.5 text-sm font-semibold text-[#1F140A] sm:mt-8 sm:rounded-xl sm:px-8 sm:py-3 sm:text-base">
              Create Your Expert Profile
            </button>
          </div>
        </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}

function MiniReason({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div>
      <div className="mb-1.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.08] sm:mb-2 sm:h-10 sm:w-10 sm:rounded-xl">
        {icon}
      </div>
      <h4 className="text-base font-semibold sm:text-lg">{title}</h4>
      <p className="mt-1.5 text-xs leading-relaxed text-white/60 sm:mt-2 sm:text-sm">{text}</p>
    </div>
  )
}

function PricingHighIntentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.2 13.32 4.62 15.96 4.1 16.48 6.74 19.02 7.26 18.5 9.9 20.82 11.22 19.5 13.64 21.26 15.4 19.02 16.72 19.54 19.36 16.9 19.88 16.38 22.52 13.74 22 12.42 24.42 10.58 22 7.94 22.52 7.42 19.88 4.6 19.36 5.12 16.72 2.88 15.4 4.74 13.64 3.42 11.22 5.74 9.9 5.22 7.26 7.76 6.74 8.28 4.1 10.92 4.62 12.24 2.2z"
      />
    </svg>
  )
}

function PricingNoColdIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M7.5 12h9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function PricingAiHeadIcon({ className }: { className?: string }) {
  const orange = 'currentColor'
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

function PricingClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.65" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function Testimonial({ text, name, role }: { text: string; name: string; role: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1C202B] p-4 sm:rounded-2xl sm:p-5">
      <p className="text-sm italic leading-relaxed text-white/65 sm:text-base">“{text}”</p>
      <div className="mt-4 flex items-center gap-3 sm:mt-5">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-white/10 sm:h-11 sm:w-11 sm:rounded-xl" />
        <div>
          <div className="text-sm font-semibold sm:text-base">{name}</div>
          <div className="text-xs text-white/55 sm:text-sm">{role}</div>
        </div>
      </div>
    </div>
  )
}

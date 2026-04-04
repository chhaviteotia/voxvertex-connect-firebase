import { Link } from 'react-router-dom'

import { useAppSelector } from '../store/hooks'
import { selectUser } from '../store/selectors/authSelectors'
import { getUserDisplayName } from '../utils/userDisplayName'
import { MarketingFooter } from './MarketingFooter'
import { MarketingNav } from './MarketingNav'

const STATS = [
  { value: '3x', label: 'Faster hiring lifecycle than traditional agencies' },
  { value: '40%', label: 'Higher outcome success rate through AI matching' },
  { value: '98%', label: 'Enterprise retention rate after first matching' },
]

export function Landing() {
  const user = useAppSelector(selectUser)
  const displayName = getUserDisplayName(user)
  const isLoggedIn = Boolean(user && displayName)
  const userType = user?.type === 'expert' ? 'expert' : user?.type === 'business' ? 'business' : null
  const dashboardPath = userType === 'expert' ? '/expert/dashboard' : '/business/dashboard'

  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur">
        <div className="flex h-18 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 text-[32px] font-semibold tracking-tight text-[#FFB15A] no-underline">
            Connect
          </Link>
          <MarketingNav />
          <div className="flex shrink-0 items-center gap-5">
            {isLoggedIn ? (
              <Link
                to={dashboardPath}
                className="max-w-[160px] truncate text-sm font-medium text-white/90 no-underline hover:text-white"
                title={displayName}
              >
                {displayName}
              </Link>
            ) : (
              <Link to="/signin" className="text-sm text-white/70 no-underline hover:text-white">
                Login
              </Link>
            )}
            <Link
              to="/signup"
              className="rounded-lg bg-[#FFB15A] px-6 py-2.5 text-sm font-semibold text-[#25160A] no-underline hover:brightness-95"
            >
              Signup
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 px-6 py-20 lg:grid-cols-2">
          <div className="space-y-7">
            <h1 className="text-5xl font-semibold leading-tight tracking-tight">
              <span className="text-white">Stop Searching.</span>
              <br />
              <span className="text-[#FF9B3D]">Start Achieving.</span>
            </h1>
            <p className="max-w-xl text-[19px] leading-relaxed text-white/65">
              AI matches you with experts based on outcomes - not resumes. Experience the future of elite professional
              matching.
            </p>
            <div className="flex items-center gap-4">
              <button className="rounded-xl bg-[#FFB15A] px-8 py-3 text-base font-semibold text-[#1F140A]">Start Matching</button>
              <button className="rounded-xl border border-white/15 px-8 py-3 text-base font-semibold text-white/85">View Expert Network</button>
            </div>
          </div>
          <div className="relative h-[420px] rounded-3xl border border-[#2B2A2D] bg-[#17141A] p-8 shadow-[0_0_80px_rgba(255,132,27,0.1)]">
            <div className="pointer-events-none absolute inset-0">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="45" y1="46" x2="25" y2="25" stroke="#A66B35" strokeWidth="0.35" strokeDasharray="1.2 1.2" opacity="0.85" />
                <line x1="56" y1="46" x2="77" y2="34" stroke="#A66B35" strokeWidth="0.35" strokeDasharray="1.2 1.2" opacity="0.85" />
                <line x1="44" y1="58" x2="22" y2="70" stroke="#A66B35" strokeWidth="0.35" strokeDasharray="1.2 1.2" opacity="0.85" />
                <line x1="56" y1="58" x2="74" y2="82" stroke="#A66B35" strokeWidth="0.35" strokeDasharray="1.2 1.2" opacity="0.85" />
              </svg>
            </div>

            <div className="absolute left-[16%] top-[18%] h-[74px] w-[74px]">
              <MiniNode title="FinOps" icon={<IconCoin />} />
            </div>
            <div className="absolute right-[16%] top-[30%] h-[74px] w-[74px]">
              <MiniNode title="Strategy" icon={<IconChart />} />
            </div>
            <div className="absolute left-[8%] bottom-[18%] h-[74px] w-[80px]">
              <MiniNode title="Cloud Arch" icon={<IconWindow />} />
            </div>
            <div className="absolute right-[18%] bottom-[12%] h-[74px] w-[62px]">
              <MiniNode title="" icon={<IconShield />} />
            </div>

            <div className="absolute left-1/2 top-1/2 h-[132px] w-[132px] -translate-x-1/2 -translate-y-1/2">
              <CoreNode />
            </div>
          </div>
        </section>

        <section className="mt-7 border-y border-white/6 bg-[#080C15] py-8">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {STATS.map((item) => (
                <div key={item.value} className="rounded-2xl border border-white/10 bg-[#101623] px-6 py-5">
                  <div className="text-[40px] font-bold text-[#FFB15A]">{item.value}</div>
                  <p className="mt-2 text-[20px] text-white/75">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pipeline" className="mx-auto max-w-[1200px] px-6 py-16">
          <h2 className="text-center text-[44px] font-semibold">Precision Pipeline</h2>
          <p className="mt-3 text-center text-[16px] text-white/60">Our systematic approach to engineering success.</p>
          <div className="mt-12 grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <InfoStep
              title="Define Outcome"
              text="Stop detailing tasks. Start detailing the end-state you need to achieve."
              icon={<IconTarget />}
            />
            <div className="rounded-3xl border border-[#FFB15A]/25 bg-[#141A28] p-12 text-center shadow-[0_0_80px_rgba(255,132,27,0.12)]">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFB15A]/20 text-[#FFB15A]">
                <IconNodes />
              </div>
              <h3 className="text-[30px] font-semibold">AI Matches Experts</h3>
              <p className="mt-4 text-[16px] text-white/70">
                Our proprietary graph analysis connects your project needs to verifiable past performance.
              </p>
            </div>
            <InfoStep
              title="Select with Confidence"
              text="Choose from a curated shortlist of top experts ready to execute immediately."
              icon={<IconBadge />}
            />
          </div>
        </section>

        <section id="network" className="mx-auto max-w-[1200px] px-6 pb-16">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101722] p-7 md:col-span-8">
              <h3 className="text-[42px] font-semibold leading-tight">Global Intelligence Mesh</h3>
              <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-white/70">
                Access 50,000+ pre-vetted domain experts across 120 countries. Our platform analyzes 2.4 million
                performance data points to find your needle in the haystack.
              </p>
              <button className="mt-5 text-[18px] font-semibold text-[#FF9B3D]">Explore the Network →</button>
              <div className="pointer-events-none absolute bottom-0 right-0 h-[72%] w-[46%]">
                <GlobalMeshArtwork />
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#26222A] p-7 md:col-span-4">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E2A33] text-[#FFB15A]">
                <IconBadge />
              </div>
              <h3 className="text-[38px] font-semibold leading-tight">Compliance First</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-white/70">
                Integrated IP protection, automated NDAs, and global tax compliance built into every match.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[13px] font-semibold tracking-wide text-white/75">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF9B3D]" />
                SOC2 TYPE II CERTIFIED
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#101722] p-7 md:col-span-4">
              <div className="mb-4 flex w-full justify-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D2533] text-[#FF9B3D]">
                  <IconChart />
                </span>
              </div>
              <h3 className="text-center text-[36px] font-semibold leading-tight">Analytics Engine</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-white/70">
                Real-time tracking of project health, outcome probability, and ROI metrics through our intuitive
                dashboard.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#1B1F2A] p-7 md:col-span-8">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-8">
                <div className="md:col-span-5">
                  <h3 className="text-[38px] font-semibold leading-tight">Match Scoring</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-white/70">
                    Every expert profile is ranked by our "Outcome Probability Index" (OPI), reducing the risk of
                    project failure by 60%.
                  </p>
                  <div className="mt-5 rounded-lg bg-[#0D1018] p-3">
                    <div className="mb-2 flex items-center justify-between text-[12px] text-white/85">
                      <span>Matching Accuracy</span>
                      <span className="font-semibold text-[#FF9B3D]">94%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 w-[94%] rounded-full bg-[#FF9B3D]" />
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl bg-[#0E121B] md:col-span-3">
                  <MatchFaceArtwork />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 pb-16">
          <div className="rounded-[36px] border border-white/10 bg-[#121826] px-8 py-14 text-center">
            <h2 className="text-[38px] font-semibold">Ready to accelerate your outcomes?</h2>
            <p className="mx-auto mt-4 max-w-3xl text-[16px] text-white/65">
              Join 500+ enterprises using Voxvertex to build world-class teams in days, not months.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button className="rounded-xl bg-[#FFB15A] px-8 py-3 text-sm font-semibold text-[#1F140A]">Start Matching Now</button>
              <button className="rounded-xl border border-white/15 px-8 py-3 text-sm font-semibold text-white/85">Talk to an Advisor</button>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}

function MiniNode({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-white/10 bg-[#1A2130] text-[#FFB15A]/90">
      <span className="mb-1 inline-flex h-5 w-5 items-center justify-center text-[#FFB15A]">{icon}</span>
      {title ? <span className="text-[10px] text-white/55">{title}</span> : null}
    </div>
  )
}

function CoreNode() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-[#FFB15A]/35 bg-[#2A2D36] text-[#FFB15A] shadow-[0_0_40px_rgba(255,132,27,0.24)]">
      <svg viewBox="0 0 24 24" fill="currentColor" className="mb-2 h-7 w-7">
        <path d="M12 2.8 13.9 8l5.3 1.9-5.3 1.9L12 17l-1.9-5.2L4.8 9.9 10.1 8z" />
        <path d="m18.3 3.6 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
      </svg>
      <span className="text-[13px] font-semibold tracking-[0.14em]">OUTCOME</span>
    </div>
  )
}

function InfoStep({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#212B3A] text-[#FFB15A]">
        {icon}
      </div>
      <h3 className="text-[28px] font-semibold">{title}</h3>
      <p className="mt-3 text-[15px] text-white/70">{text}</p>
    </div>
  )
}

function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="12" cy="12" r="7" />
      <path d="M10 12h4M12 10v4" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 19h16" />
      <rect x="6" y="11" width="3" height="5" />
      <rect x="11" y="8" width="3" height="8" />
      <rect x="16" y="6" width="3" height="10" />
    </svg>
  )
}

function IconWindow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M4 10h16M8 14h4" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  )
}

function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconNodes() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <circle cx="12" cy="4.5" r="2" />
      <circle cx="18.5" cy="9" r="2" />
      <circle cx="16" cy="16.5" r="2" />
      <circle cx="8" cy="16.5" r="2" />
      <circle cx="5.5" cy="9" r="2" />
    </svg>
  )
}

function IconBadge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="m9.5 12 1.8 1.8 3.2-3.2" />
    </svg>
  )
}

function GlobalMeshArtwork() {
  return (
    <svg viewBox="0 0 420 260" className="h-full w-full">
      <defs>
        <radialGradient id="meshGlow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#2FD1FF" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#1B6A8C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0F1521" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="420" height="260" fill="url(#meshGlow)" />
      <g stroke="#59C6E7" strokeOpacity="0.25" fill="none">
        <ellipse cx="230" cy="145" rx="120" ry="68" />
        <ellipse cx="230" cy="145" rx="92" ry="52" />
        <ellipse cx="230" cy="145" rx="60" ry="34" />
        <path d="M110 145h240" />
        <path d="M132 123h196" />
        <path d="M132 167h196" />
      </g>
    </svg>
  )
}

function MatchFaceArtwork() {
  return (
    <svg viewBox="0 0 320 210" className="h-full w-full">
      <defs>
        <radialGradient id="faceBg" cx="55%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#8A939E" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0E121B" stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <rect width="320" height="210" fill="url(#faceBg)" />
      <path
        d="M194 34c23 5 44 24 48 48 4 24-9 46-31 59-10 6-16 11-19 22-2 9-9 16-20 16h-10"
        stroke="#CFD6DF"
        strokeOpacity="0.8"
        strokeWidth="2.2"
        fill="none"
      />
      <path d="M165 70c13 3 22 14 23 27 1 15-9 28-24 32" stroke="#CFD6DF" strokeOpacity="0.55" strokeWidth="1.6" fill="none" />
      <g fill="#CDD5DE" fillOpacity="0.5">
        <circle cx="150" cy="70" r="1.6" />
        <circle cx="182" cy="88" r="1.6" />
        <circle cx="171" cy="116" r="1.6" />
        <circle cx="203" cy="121" r="1.6" />
        <circle cx="188" cy="146" r="1.6" />
      </g>
    </svg>
  )
}

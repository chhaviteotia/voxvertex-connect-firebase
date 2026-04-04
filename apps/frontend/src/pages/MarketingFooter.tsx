import type { HTMLAttributes } from 'react'

export function MarketingFooter({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <footer
      className={['border-t border-white/8 bg-[#0A0F18]', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] pb-10 pt-10 md:pb-12 md:pt-12">
          <div className="grid grid-cols-1 gap-10 text-left md:grid-cols-4 md:gap-12">
            <div className="md:col-span-1">
              <h4 className="whitespace-nowrap text-xl font-bold text-white sm:text-2xl md:text-3xl">
                Voxvertex Connect
              </h4>
              <div className="mt-3 min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible">
                <p className="inline-block min-w-min text-left text-sm font-normal leading-snug text-[#888888] sm:text-base sm:leading-normal">
                  <span className="block whitespace-nowrap">AI-powered decision intelligence for</span>
                  <span className="block whitespace-nowrap">global enterprises and specialized</span>
                  <span className="block whitespace-nowrap">experts.</span>
                </p>
              </div>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">NETWORK</div>
              <ul className="mt-4 space-y-2.5 text-sm text-white/60 sm:text-[15px]">
                <li>Expert Compliance</li>
                <li>Global Network</li>
                <li>Enterprise Access</li>
              </ul>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">PLATFORM</div>
              <ul className="mt-4 space-y-2.5 text-sm text-white/60 sm:text-[15px]">
                <li>Deal Engine</li>
                <li>Matching AI</li>
                <li>Security</li>
              </ul>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">LEGAL</div>
              <ul className="mt-4 space-y-2.5 text-sm text-white/60 sm:text-[15px]">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-[1200px] items-center justify-between gap-6 py-5 text-left">
          <span className="text-sm text-white/40">© 2026 Voxvertex Connect. All rights reserved.</span>
          <div className="flex shrink-0 items-center gap-5 text-white/40">
            <FooterGlobeIcon />
            <FooterShieldIcon />
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterGlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function FooterShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer>
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 py-16 px-6 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-3 max-w-[600px] mx-auto">
          Ready to Find Your Perfect Expert Match?
        </h2>
        <p className="text-lg text-white/95 mb-8 max-w-[520px] mx-auto">
          Join hundreds of businesses using AI to connect with the right experts for their events
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/signup/business" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg bg-white text-blue-600 border-2 border-white no-underline hover:bg-gray-50 hover:text-blue-700 transition-colors">
            Get Started Now
          </Link>
          <Link to="/join-expert" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg bg-blue-900 text-white border-2 border-blue-900 no-underline hover:bg-blue-950 hover:border-blue-950 transition-colors">
            Join as Expert
          </Link>
        </div>
      </div>
      <div className="bg-slate-900 py-12 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-1">
            <Logo href="/" variant="footer" />
            <p className="text-sm leading-normal text-white/80 mt-3 max-w-[280px]">
              AI-powered expert matching for enterprise events and speaking engagements.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[15px] font-bold text-white mb-1">Company</h4>
            <a href="/about" className="text-[15px] text-white/85 no-underline hover:text-white">About</a>
            <a href="/contact" className="text-[15px] text-white/85 no-underline hover:text-white">Contact</a>
            <a href="/careers" className="text-[15px] text-white/85 no-underline hover:text-white">Careers</a>
            <a href="/blog" className="text-[15px] text-white/85 no-underline hover:text-white">Blog</a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[15px] font-bold text-white mb-1">For Users</h4>
            <a href="/businesses" className="text-[15px] text-white/85 no-underline hover:text-white">For Businesses</a>
            <a href="/experts" className="text-[15px] text-white/85 no-underline hover:text-white">For Experts</a>
            <a href="/pricing" className="text-[15px] text-white/85 no-underline hover:text-white">Pricing</a>
            <a href="/faq" className="text-[15px] text-white/85 no-underline hover:text-white">FAQ</a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-[15px] font-bold text-white mb-1">Legal</h4>
            <a href="/privacy" className="text-[15px] text-white/85 no-underline hover:text-white">Privacy Policy</a>
            <a href="/terms" className="text-[15px] text-white/85 no-underline hover:text-white">Terms of Service</a>
            <a href="/cookies" className="text-[15px] text-white/85 no-underline hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

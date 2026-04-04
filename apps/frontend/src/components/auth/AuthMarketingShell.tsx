import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  children: ReactNode
}

/** Matches marketing landing chrome: dark background + sticky header with Connect + Login/Signup. */
export function AuthMarketingShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#070A12] font-sans text-white">
      <header className="sticky top-0 z-20 shrink-0 border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="shrink-0 text-[28px] font-semibold tracking-tight text-[#FFB15A] no-underline sm:text-[32px]"
          >
            Connect
          </Link>
          <div className="flex shrink-0 items-center gap-5">
            <Link to="/signin" className="text-sm text-white/70 no-underline hover:text-white">
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-[#FFB15A] px-6 py-2.5 text-sm font-semibold text-[#25160A] no-underline hover:brightness-95"
            >
              Signup
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}

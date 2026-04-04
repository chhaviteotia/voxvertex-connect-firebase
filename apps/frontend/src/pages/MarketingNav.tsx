import { NavLink } from 'react-router-dom'

function navItemClass({ isActive }: { isActive: boolean }) {
  return [
    'inline-block border-b-2 pb-1 text-sm font-normal no-underline transition-colors duration-150',
    isActive
      ? 'border-[#FF8C00] text-[#FF8C00]'
      : 'border-transparent text-white/60 hover:border-[#FF8C00] hover:text-[#FF8C00]',
  ].join(' ')
}

export function MarketingNav() {
  return (
    <nav className="hidden items-center gap-12 text-sm md:flex lg:gap-16">
      <NavLink to="/expert-network" className={navItemClass}>
        Expert Network
      </NavLink>
      <NavLink to="/solutions" className={navItemClass}>
        Solutions
      </NavLink>
      <NavLink to="/pricing" className={navItemClass}>
        Pricing
      </NavLink>
      <span
        className={navItemClass({ isActive: false })}
        title="Coming soon"
        aria-disabled="true"
      >
        Resources
      </span>
    </nav>
  )
}

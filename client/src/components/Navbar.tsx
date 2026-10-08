import { Link, NavLink } from 'react-router-dom';
import { Activity } from 'lucide-react';

// Navigation links — active state uses orange accent in both themes
const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {

  return (
    <header className="sticky top-0 z-50 w-full border-b transition-colors duration-200"
      style={{
        backgroundColor: 'rgba(17, 17, 19, 0.7)',
        borderColor: 'var(--color-border)',
      }}>
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xl" />
      <div className="relative max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <span className="text-white font-bold text-lg leading-none">🦈</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-[var(--color-text)]">
            SharkTank Sim
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-[var(--color-accent)] shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side: status badge + theme toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderColor: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
            }}>
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Tank Online
          </div>

        </div>
      </div>
    </header>
  );
}

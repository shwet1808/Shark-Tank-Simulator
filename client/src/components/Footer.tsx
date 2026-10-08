import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="w-full border-t"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-base">🦈</span>
          <span className="text-xs font-semibold text-[var(--color-text)]">SharkTank Sim</span>
          <span className="text-xs text-[var(--color-text-muted)]">— AI Investor Panel</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 text-xs text-[var(--color-text-muted)]">
          <Link to="/" className="hover:text-[var(--color-accent)] transition-colors">Home</Link>
          <Link to="/pitch" className="hover:text-[var(--color-accent)] transition-colors">Pitch</Link>
          <Link to="/about" className="hover:text-[var(--color-accent)] transition-colors">About</Link>
          <Link to="/contact" className="hover:text-[var(--color-accent)] transition-colors">Contact</Link>
        </div>

        {/* Copyright */}
        <p className="text-[11px] text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} · Hackathon Build
        </p>
      </div>
    </footer>
  );
}

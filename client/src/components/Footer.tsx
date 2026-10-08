import { Link } from 'react-router-dom';

// Footer column data — each section groups related links
const footerSections = [
  {
    title: 'Product',
    links: [
      { to: '/', label: 'Home' },
      { to: '/pitch', label: 'Submit a Pitch' },
      { to: '/about', label: 'How It Works' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/contact', label: 'Terms of Service' },
      { to: '/contact', label: 'Privacy Policy' },
      { to: '/contact', label: 'Cookie Policy' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t mt-auto transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded border flex items-center justify-center"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-accent)',
                }}>
                <span className="font-bold text-sm">🦈</span>
              </div>
              <span className="font-bold text-sm text-[var(--color-text)]">
                SharkTank Sim
              </span>
            </Link>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-xs">
              AI-powered investor panel that subjects startup ideas to
              unfiltered, institutional-grade scrutiny — before you risk
              real capital.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-[var(--color-text-muted)]">
            © {year} SharkTank Simulator. All rights reserved.
          </p>
          <p className="text-[var(--color-text-muted)]">
            Hackathon Project — Built with AI
          </p>
        </div>
      </div>
    </footer>
  );
}

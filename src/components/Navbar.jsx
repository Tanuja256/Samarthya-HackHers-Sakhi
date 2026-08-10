import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext';

const navLinks = [
  { to: '/dashboard', key: 'nav_dashboard' },
  { to: '/tracker', key: 'nav_tracker' },
  { to: '/diet', key: 'nav_diet' },
  { to: '/education', key: 'nav_education' },
  { to: '/community', key: 'nav_community' },
  { to: '/settings', key: 'nav_settings' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLang = i18n.language;

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('sakhi-lang', lang);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const activeLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-accent border-b-2 border-accent pb-0.5'
        : 'text-text/60 hover:text-text'
    }`;

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-primary/15 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* ── Logo ── */}
          <Link to="/" className="font-heading text-xl font-bold text-accent hover:text-accent/80 transition-colors flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            {t('app_name')} <span className="text-primary/60 font-normal text-lg">सखी</span>
          </Link>

          {/* ── Center Nav Links (desktop) ── */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, key }) => (
              <NavLink key={to} to={to} className={activeLinkClass}>
                {t(key)}
              </NavLink>
            ))}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">
            {/* Language Toggle Pills */}
            <div className="flex items-center bg-text/5 rounded-full p-0.5 gap-0.5">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-text/50 hover:text-text/70'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  currentLang === 'mr'
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-text/50 hover:text-text/70'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Auth */}
            {user ? (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-block px-3 py-1.5 rounded-[var(--radius-button)] border border-text/15 text-text/60
                           text-xs font-medium hover:bg-text/5 hover:text-text transition-all cursor-pointer"
              >
                {t('nav_logout')}
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-[var(--radius-button)] bg-primary text-white text-xs font-medium
                           hover:bg-primary/85 transition-colors"
              >
                {t('nav_login')}
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-text/5 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 text-text/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile Nav ── */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-text/10 space-y-1">
            {navLinks.map(({ to, key }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-accent' : 'text-text/60 hover:bg-text/5'
                  }`
                }
              >
                {t(key)}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-text/60 hover:bg-text/5 cursor-pointer"
              >
                {t('nav_logout')}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

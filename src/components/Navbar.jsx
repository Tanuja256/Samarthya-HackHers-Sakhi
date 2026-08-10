import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('sakhi-lang', newLang);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-primary/15 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <Link to="/" className="font-heading text-2xl font-bold text-accent hover:text-accent/80 transition-colors">
            {t('app_name')}
          </Link>

          {/* ── Right side nav items ── */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="text-text/70 hover:text-primary transition-colors text-sm font-medium
                             hidden sm:inline-block"
                >
                  {t('nav_dashboard')}
                </Link>
                <Link
                  to="/settings"
                  className="text-text/70 hover:text-primary transition-colors text-sm font-medium
                             hidden sm:inline-block"
                >
                  {t('nav_settings')}
                </Link>
              </>
            )}

            {/* ── Language Toggle ── */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-[var(--radius-button)] bg-primary/10 text-primary text-sm font-medium
                         hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {t('language_toggle')}
            </button>

            {/* ── Auth Buttons ── */}
            {user ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-[var(--radius-button)] border border-text/15 text-text/60
                           text-sm font-medium hover:bg-text/5 hover:text-text transition-all cursor-pointer"
              >
                {t('nav_logout')}
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-[var(--radius-button)] bg-primary text-white text-sm font-medium
                           hover:bg-primary/85 transition-colors"
              >
                {t('nav_login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

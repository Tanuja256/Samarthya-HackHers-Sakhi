import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('sakhi-lang', newLang);
  };

  return (
    <nav className="bg-background border-b border-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-heading text-2xl font-bold text-accent">
            {t('app_name')}
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-text hover:text-primary transition-colors text-sm font-medium">
              {t('nav_dashboard')}
            </Link>
            <Link to="/screening" className="text-text hover:text-primary transition-colors text-sm font-medium">
              {t('nav_screening')}
            </Link>
            <Link to="/tracker" className="text-text hover:text-primary transition-colors text-sm font-medium">
              {t('nav_tracker')}
            </Link>
            <Link to="/settings" className="text-text hover:text-primary transition-colors text-sm font-medium">
              {t('nav_settings')}
            </Link>

            <button
              onClick={toggleLanguage}
              className="ml-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm font-medium
                         hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {t('language_toggle')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

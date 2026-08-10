import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-heading text-5xl font-bold text-accent mb-4">
        {t('app_name')}
      </h1>
      <p className="text-lg text-text/70 max-w-md mb-8">
        {t('tagline')}
      </p>
      <Link
        to="/screening"
        className="px-8 py-3 rounded-2xl bg-primary text-white font-medium text-lg
                   hover:bg-primary/90 transition-colors shadow-md"
      >
        {t('cta_take_screening')}
      </Link>
    </div>
  );
}

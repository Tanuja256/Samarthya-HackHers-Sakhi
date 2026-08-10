import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    { icon: '🩺', key: 'landing_feature_screen' },
    { icon: '📊', key: 'landing_feature_track' },
    { icon: '💡', key: 'landing_feature_insights' },
    { icon: '🎙️', key: 'landing_feature_voice' },
    { icon: '🍛', key: 'landing_feature_diet' },
    { icon: '🔒', key: 'landing_feature_private' },
  ];

  return (
    <div className="font-body">
      {/* ── Hero Section ── */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-accent leading-tight mb-6">
          {t('landing_hero_headline')}
        </h1>
        <p className="text-lg sm:text-xl text-text/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('landing_hero_subheadline')}
        </p>
        <Link
          to="/onboarding"
          className="inline-block px-10 py-4 rounded-2xl bg-primary text-white font-semibold text-lg
                     hover:bg-primary/85 active:scale-[0.97] transition-all duration-200 shadow-lg
                     hover:shadow-xl"
        >
          {t('cta_take_screening')}
        </Link>
      </section>

      {/* ── Stat Callout ── */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-8 sm:p-10 text-center shadow-sm">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            {t('landing_stat_title')}
          </p>
          <p className="font-heading text-5xl sm:text-6xl font-bold text-accent mb-4">
            {t('landing_stat_1_in_5')}
          </p>
          <p className="text-text/75 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-3">
            {t('landing_stat_body')}
          </p>
          <p className="text-xs text-text/40 italic">
            {t('landing_stat_source')}
          </p>
        </div>
      </section>

      {/* ── What is PCOS ── */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-accent mb-6 text-center">
          {t('landing_what_is_pcos_title')}
        </h2>
        <p className="text-text/75 text-base sm:text-lg leading-relaxed text-center max-w-2xl mx-auto">
          {t('landing_what_is_pcos_body')}
        </p>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-accent mb-8 text-center">
          {t('landing_features_title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, key }) => (
            <div
              key={key}
              className="bg-white/50 border border-secondary/20 rounded-[var(--radius-card)] p-6
                         hover:shadow-md hover:border-secondary/40 transition-all duration-200"
            >
              <span className="text-3xl mb-3 block">{icon}</span>
              <p className="text-text/80 text-sm leading-relaxed">{t(key)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Video Placeholder ── */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="font-heading text-2xl font-semibold text-accent mb-6 text-center">
          {t('landing_video_title')}
        </h2>
        <div className="bg-white/40 border-2 border-dashed border-primary/25 rounded-[var(--radius-card)]
                        aspect-video flex flex-col items-center justify-center text-text/40 gap-3">
          <svg className="w-14 h-14 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          <p className="text-sm px-4 text-center">{t('landing_video_placeholder')}</p>
        </div>
      </section>

      {/* ── Second CTA ── */}
      <section className="max-w-3xl mx-auto px-4 py-10 text-center">
        <Link
          to="/onboarding"
          className="inline-block px-10 py-4 rounded-2xl bg-accent text-white font-semibold text-lg
                     hover:bg-accent/85 active:scale-[0.97] transition-all duration-200 shadow-lg"
        >
          {t('cta_take_screening')}
        </Link>
      </section>

      {/* ── Disclaimer Footer ── */}
      <footer className="max-w-3xl mx-auto px-4 py-8 border-t border-text/10">
        <p className="text-xs text-text/40 text-center leading-relaxed">
          {t('landing_disclaimer')}
        </p>
      </footer>
    </div>
  );
}

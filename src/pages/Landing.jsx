import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="font-body">

      {/* ══════════════════════════════════════════════════════════
          HERO — Two-column: copy + stats
         ══════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12">
        {/* Audience tag */}
        <p className="text-xs text-text/45 font-medium mb-5 tracking-wide">
          {t('landing_audience_tag')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* ── Left: Copy ── */}
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-text leading-[1.15] mb-6">
              {t('landing_hero_line1')}{' '}
              <span className="text-primary">{t('landing_hero_line2')}</span>
            </h1>

            <p className="text-sm sm:text-base text-text/60 leading-relaxed mb-8 max-w-lg">
              {t('landing_hero_body')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Link
                to="/onboarding"
                className="px-6 py-3 rounded-[var(--radius-button)] bg-text text-white text-sm font-semibold
                           hover:bg-text/85 active:scale-[0.97] transition-all duration-200 shadow-md"
              >
                {t('landing_cta_screening')}
              </Link>
              <Link
                to="/family-explainer"
                className="px-6 py-3 rounded-[var(--radius-button)] border-2 border-text/15 text-text text-sm font-semibold
                           hover:border-text/30 hover:bg-text/3 active:scale-[0.97] transition-all duration-200"
              >
                {t('landing_cta_family')}
              </Link>
            </div>

            <p className="text-[11px] text-text/35 mt-2">
              {t('landing_cta_footnote')}
            </p>
          </div>

          {/* ── Right: Stats Cards ── */}
          <div className="space-y-4">
            {/* Main stat: 1 in 5 */}
            <div className="bg-white/60 backdrop-blur-sm border border-primary/12 rounded-[var(--radius-card)] p-6 sm:p-7">
              <p className="font-heading text-4xl sm:text-5xl font-bold text-primary mb-2">
                {t('landing_stat_1_in_5')}
              </p>
              <p className="text-sm text-text/60 leading-relaxed">
                {t('landing_stat_1_in_5_body')}
              </p>
            </div>

            {/* Two smaller stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/6 border border-primary/10 rounded-[var(--radius-card)] p-5">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-primary mb-1">
                  22.5%
                </p>
                <p className="text-xs text-text/50 leading-relaxed">
                  {t('landing_stat_prevalence')}
                </p>
              </div>
              <div className="bg-primary/6 border border-primary/10 rounded-[var(--radius-card)] p-5">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-primary mb-1">
                  4.5 yrs
                </p>
                <p className="text-xs text-text/50 leading-relaxed">
                  {t('landing_stat_delay')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHAT IS PCOS?
         ══════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-4">
          {t('landing_what_title')}
        </h2>
        <p className="text-sm sm:text-base text-text/60 leading-relaxed max-w-2xl mb-10">
          {t('landing_what_body')}
        </p>

        {/* Three explainer cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-6 hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4 text-accent text-lg">
              💜
            </div>
            <h3 className="font-heading text-sm font-semibold text-text mb-2">
              {t('landing_pcos_hormones_title')}
            </h3>
            <p className="text-xs text-text/55 leading-relaxed">
              {t('landing_pcos_hormones_body')}
            </p>
          </div>

          <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-6 hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary text-lg">
              💗
            </div>
            <h3 className="font-heading text-sm font-semibold text-text mb-2">
              {t('landing_pcos_signs_title')}
            </h3>
            <p className="text-xs text-text/55 leading-relaxed">
              {t('landing_pcos_signs_body')}
            </p>
          </div>

          <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-6 hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-secondary text-lg">
              ⚪
            </div>
            <h3 className="font-heading text-sm font-semibold text-text mb-2">
              {t('landing_pcos_manageable_title')}
            </h3>
            <p className="text-xs text-text/55 leading-relaxed">
              {t('landing_pcos_manageable_body')}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VIDEO SECTION
         ══════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-white/50 border border-text/8 rounded-[var(--radius-card)] p-6 sm:p-8">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-text/8 text-text/50 mb-3">
            {t('landing_video_badge')}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-text mb-2">
                {t('landing_video_title')}
              </h2>
              <p className="text-xs sm:text-sm text-text/50 leading-relaxed">
                {t('landing_video_subtitle')}
              </p>
            </div>

            {/* Video placeholder */}
            <div className="aspect-video bg-background rounded-xl border-2 border-dashed border-text/10
                            flex flex-col items-center justify-center text-text/30 gap-2">
              <div className="w-14 h-14 rounded-full bg-text/5 flex items-center justify-center">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-[11px]">{t('landing_video_placeholder')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BRANDED FOOTER
         ══════════════════════════════════════════════════════════ */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-text/8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-heading text-lg font-bold text-accent">
              {t('app_name')} <span className="text-primary/50 font-normal">सखी</span>
            </p>
            <p className="text-[11px] text-text/35 mt-1 max-w-md leading-relaxed">
              {t('landing_disclaimer')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs text-text/40 hover:text-text/60 transition-colors font-medium">
              {t('nav_login')}
            </Link>
            <Link to="/signup" className="text-xs text-text/40 hover:text-text/60 transition-colors font-medium">
              {t('nav_signup')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

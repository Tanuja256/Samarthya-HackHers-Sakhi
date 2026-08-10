import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // TODO: Fetch user profile name from Supabase users table
  const userName = null;
  const greeting = userName
    ? t('dashboard_greeting', { name: userName })
    : t('dashboard_greeting_default');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ── Greeting ── */}
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-accent mb-8">
        {greeting}
      </h1>

      {/* ── Main Card Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* ── Risk Tier Summary ── */}
        <div className="sm:col-span-2 bg-white/60 backdrop-blur-sm border border-primary/15
                        rounded-[var(--radius-card)] p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-text">
              {t('dashboard_risk_title')}
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-text/10 text-text/50 font-medium">
              {t('dashboard_risk_not_screened')}
            </span>
          </div>
          <p className="text-text/60 text-sm leading-relaxed">
            {t('dashboard_risk_placeholder')}
          </p>
          <Link
            to="/screening"
            className="inline-block mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t('dashboard_nav_screening')} →
          </Link>
        </div>

        {/* ── Streak Indicator ── */}
        <div className="bg-white/60 backdrop-blur-sm border border-secondary/20
                        rounded-[var(--radius-card)] p-6 shadow-sm text-center">
          <h2 className="font-heading text-sm font-semibold text-text/70 uppercase tracking-wider mb-3">
            {t('dashboard_streak_title')}
          </h2>
          <p className="font-heading text-4xl font-bold text-secondary mb-2">
            {/* Placeholder streak count */}
            0
          </p>
          <p className="text-xs text-text/50">{t('dashboard_streak_placeholder')}</p>
        </div>

        {/* ── Quick Voice Log ── */}
        <div className="bg-primary/5 border border-primary/15 rounded-[var(--radius-card)] p-6 shadow-sm
                        hover:shadow-md hover:border-primary/30 transition-all duration-200">
          <Link to="/voice-log" className="block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold text-text">
                  {t('dashboard_quick_log')}
                </h2>
                <p className="text-xs text-text/50 mt-0.5">{t('dashboard_quick_log_desc')}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Quick Navigation Cards ── */}
        {[
          { to: '/tracker', label: t('dashboard_nav_tracker'), emoji: '📊' },
          { to: '/diet', label: t('dashboard_nav_diet'), emoji: '🍛' },
          { to: '/education', label: t('dashboard_nav_education'), emoji: '📖' },
          { to: '/lab-report', label: t('dashboard_nav_lab'), emoji: '🔬' },
          { to: '/community', label: t('dashboard_nav_community'), emoji: '💬' },
        ].map(({ to, label, emoji }) => (
          <Link
            key={to}
            to={to}
            className="bg-white/50 border border-text/10 rounded-[var(--radius-card)] p-5
                       hover:shadow-md hover:border-secondary/30 transition-all duration-200
                       flex items-center gap-4"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm font-medium text-text">{label}</span>
          </Link>
        ))}

        {/* ────────────────────────────────────────────────────────────
            INSIGHTS SECTION
            P2: Symptom Detective cards will be inserted here.
            The Detective component should render its insight cards
            as children inside this grid area.
           ──────────────────────────────────────────────────────────── */}
        <div className="sm:col-span-2 lg:col-span-3 bg-white/40 border border-dashed border-secondary/25
                        rounded-[var(--radius-card)] p-6">
          <h2 className="font-heading text-lg font-semibold text-text mb-3">
            {t('dashboard_insights_title')}
          </h2>
          <p className="text-text/50 text-sm leading-relaxed">
            {t('dashboard_insights_placeholder')}
          </p>

          {/* ──────────────────────────────────────────────────────────
              P2 INSERT POINT: Symptom Detective Cards
              Replace the placeholder text above with:
              <DetectiveInsights userId={user?.id} />
              when the Symptom Detective feature is built.
             ────────────────────────────────────────────────────────── */}
        </div>

        {/* ────────────────────────────────────────────────────────────
            P3 INSERT POINT: Festival & Occasion Mode Card
            Add a Festival Mode card here when the feature is built.
            Example:
            <FestivalModeCard userId={user?.id} />
            This card should show upcoming Maharashtrian festivals
            and proactive dietary guidance.
           ──────────────────────────────────────────────────────────── */}

      </div>
    </div>
  );
}

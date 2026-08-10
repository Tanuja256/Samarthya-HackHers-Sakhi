import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

/* ── Icon components used throughout the dashboard ── */
function IconMic() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}

function IconStreak() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
    </svg>
  );
}

/* ── Insight card for Symptom Detective section ── */
function InsightCard({ icon, title, body, source }) {
  return (
    <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary text-sm">
        {icon}
      </div>
      <h3 className="font-heading text-sm font-semibold text-text mb-1.5">{title}</h3>
      <p className="text-xs text-text/55 leading-relaxed mb-3">{body}</p>
      {source && <p className="text-[11px] text-primary/60 italic">{source}</p>}
    </div>
  );
}

/* ── Quick-access card for "Everything else" section ── */
function QuickCard({ to, icon, title, subtitle }) {
  return (
    <Link
      to={to}
      className="bg-white/50 border border-text/8 rounded-[var(--radius-card)] p-5
                 hover:shadow-md hover:border-secondary/30 transition-all duration-200 group"
    >
      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center mb-3 text-lg
                      group-hover:bg-primary/15 transition-colors">
        {icon}
      </div>
      <h3 className="font-heading text-sm font-semibold text-text mb-0.5 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-xs text-text/50">{subtitle}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // TODO: Fetch user profile name from Supabase users table
  const userName = null;
  const greeting = userName
    ? `Namaskar, ${userName}`
    : t('dashboard_greeting_default');

  // Placeholder data — will be replaced with real Supabase queries
  const streakDays = 12;
  const riskTier = 'low'; // 'low' | 'moderate' | 'high' | null

  const riskConfig = {
    low: { label: t('dashboard_risk_low'), color: 'bg-secondary/15 text-secondary', border: 'border-secondary/20' },
    moderate: { label: t('dashboard_risk_moderate'), color: 'bg-warning/15 text-warning', border: 'border-warning/20' },
    high: { label: t('dashboard_risk_high'), color: 'bg-red-100 text-red-600', border: 'border-red-200' },
  };
  const risk = riskConfig[riskTier] || null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* ── Greeting ── */}
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-1">
        {greeting}
      </h1>
      <p className="text-sm text-text/50 mb-6">{t('dashboard_subtitle')}</p>

      {/* ══════════════════════════════════════════════════════════
          ROW 1 — Screening Card + Streak
         ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Screening / Risk Summary */}
        <div className={`lg:col-span-2 bg-white/60 backdrop-blur-sm border rounded-[var(--radius-card)] p-5 sm:p-6 shadow-sm ${risk ? risk.border : 'border-primary/15'}`}>
          {risk ? (
            <>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${risk.color}`}>
                {t('dashboard_risk_screening_label')}: {risk.label}
              </span>
              <p className="text-sm text-text/65 leading-relaxed mb-4">
                {t('dashboard_risk_low_body')}
              </p>
              <Link
                to="/screening"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-[var(--radius-button)] border border-text/15
                           text-sm font-medium text-text/70 hover:bg-text/5 hover:text-text transition-all"
              >
                {t('dashboard_retake_screening')}
              </Link>
            </>
          ) : (
            <>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-text/10 text-text/50">
                {t('dashboard_risk_not_screened')}
              </span>
              <p className="text-sm text-text/60 leading-relaxed mb-4">
                {t('dashboard_risk_placeholder')}
              </p>
              <Link
                to="/screening"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-[var(--radius-button)] bg-primary text-white
                           text-sm font-medium hover:bg-primary/85 transition-all"
              >
                {t('dashboard_nav_screening')} →
              </Link>
            </>
          )}
        </div>

        {/* Streak */}
        <div className="bg-white/60 backdrop-blur-sm border border-text/8 rounded-[var(--radius-card)] p-5 sm:p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <IconStreak />
          </div>
          <p className="font-heading text-3xl font-bold text-text mb-0.5">
            {streakDays} <span className="text-base font-semibold text-text/60">{t('dashboard_streak_unit')}</span>
          </p>
          <p className="text-xs text-text/45">{t('dashboard_streak_subtitle')}</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          ROW 2 — Quick Log + Festival Mode
         ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Quick Log */}
        <Link
          to="/voice-log"
          className="bg-primary/5 border border-primary/15 rounded-[var(--radius-card)] p-5 shadow-sm
                     hover:shadow-md hover:border-primary/30 transition-all duration-200 flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
            <IconMic />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-text">{t('dashboard_quick_log')}</h2>
            <p className="text-xs text-text/50 mt-0.5">{t('dashboard_quick_log_desc')}</p>
          </div>
        </Link>

        {/* Festival Mode Card */}
        <Link
          to="/festival"
          className="lg:col-span-2 bg-gradient-to-br from-orange-50/80 to-amber-50/60 border border-amber-200/40
                     rounded-[var(--radius-card)] p-5 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 mb-2">
            🎉 {t('dashboard_festival_badge')}
          </span>
          <h2 className="font-heading text-sm font-semibold text-text mb-1">
            {t('dashboard_festival_title')}
          </h2>
          <p className="text-xs text-text/50">{t('dashboard_festival_subtitle')}</p>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SYMPTOM DETECTIVE
         ══════════════════════════════════════════════════════════ */}
      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-text mb-1">{t('dashboard_detective_title')}</h2>
        <p className="text-xs text-text/50 mb-4">{t('dashboard_detective_subtitle')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InsightCard
            icon="💤"
            title={t('dashboard_insight_sleep_title')}
            body={t('dashboard_insight_sleep_body')}
            source={t('dashboard_insight_source_detective')}
          />
          <InsightCard
            icon="🔄"
            title={t('dashboard_insight_cycles_title')}
            body={t('dashboard_insight_cycles_body')}
            source={t('dashboard_insight_source_cycle')}
          />
          <InsightCard
            icon="⚡"
            title={t('dashboard_insight_energy_title')}
            body={t('dashboard_insight_energy_body')}
            source={t('dashboard_insight_source_detective')}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          EVERYTHING ELSE — Quick Navigation Grid
         ══════════════════════════════════════════════════════════ */}
      <section className="mb-6">
        <h2 className="font-heading text-lg font-bold text-text mb-4">{t('dashboard_everything_title')}</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickCard
            to="/tracker"
            icon="📊"
            title={t('dashboard_card_cycle_title')}
            subtitle={t('dashboard_card_cycle_sub')}
          />
          <QuickCard
            to="/diet"
            icon="🍛"
            title={t('dashboard_card_diet_title')}
            subtitle={t('dashboard_card_diet_sub')}
          />
          <QuickCard
            to="/lab-report"
            icon="🔬"
            title={t('dashboard_card_lab_title')}
            subtitle={t('dashboard_card_lab_sub')}
          />
          <QuickCard
            to="/timeline"
            icon="📷"
            title={t('dashboard_card_timeline_title')}
            subtitle={t('dashboard_card_timeline_sub')}
          />
          <QuickCard
            to="/community"
            icon="💬"
            title={t('dashboard_card_community_title')}
            subtitle={t('dashboard_card_community_sub')}
          />
          <QuickCard
            to="/education"
            icon="📖"
            title={t('dashboard_card_myth_title')}
            subtitle={t('dashboard_card_myth_sub')}
          />
          <QuickCard
            to="/festival"
            icon="🎊"
            title={t('dashboard_card_festival_title')}
            subtitle={t('dashboard_card_festival_sub')}
          />
          <QuickCard
            to="/family-explainer"
            icon="👨‍👩‍👧"
            title={t('dashboard_card_family_title')}
            subtitle={t('dashboard_card_family_sub')}
          />
        </div>
      </section>

      {/* ── Footer Disclaimer ── */}
      <footer className="border-t border-text/8 pt-4 pb-2">
        <p className="text-[11px] text-text/35 text-center">
          {t('dashboard_disclaimer')}
        </p>
      </footer>
    </div>
  );
}

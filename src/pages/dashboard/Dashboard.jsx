import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
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

function IconCalendarCheck() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 14 2 2 4-4" />
    </svg>
  );
}

function IconDiet() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9h18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12V8a5 5 0 0 1 10 0v4M12 12V3" />
    </svg>
  );
}

function IconFlask() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3h4.5m-3 0v7.5l-6 10.5h13.5l-6-10.5V3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18h12M12 10.5h.008" />
    </svg>
  );
}

function IconImages() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a2.25 2.25 0 0 0-1.551-1.551L15.15 6l1.04-.259a2.25 2.25 0 0 0 1.55-1.55L18 3.15l.259 1.04a2.25 2.25 0 0 0 1.55 1.55L20.85 6l-1.04.259a2.25 2.25 0 0 0-1.55 1.551zM19.759 20.715L19.5 21.75l-.259-1.035a2.25 2.25 0 0 0-1.551-1.551L16.65 18l1.04-.259a2.25 2.25 0 0 0 1.55-1.55L19.5 15.15l.259 1.04a2.25 2.25 0 0 0 1.55 1.55L22.35 18l-1.04.259a2.25 2.25 0 0 0-1.55 1.551z" />
    </svg>
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
  
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('users')
          .select('name, age')
          .eq('auth_id', user.id)
          .single();
        if (data) setProfile(data);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const userName = profile?.name;
  const greeting = userName
    ? t('dashboard_greeting', { name: userName })
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
      {/* ── Greeting & Profile ── */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text h-9 sm:h-10 flex items-center">
          {profileLoading ? (
            <span className="w-48 h-8 rounded-lg bg-text/5 animate-pulse inline-block"></span>
          ) : (
            greeting
          )}
        </h1>
        <Link 
          to="/settings" 
          className="flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-text/10 rounded-full hover:bg-white transition-colors shadow-sm shrink-0"
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
            {profileLoading ? '' : (profile?.name ? profile.name.charAt(0) : '👤')}
          </div>
          <div className="hidden sm:block text-left">
            {profileLoading ? (
              <div className="w-12 h-3 rounded bg-text/5 animate-pulse"></div>
            ) : (
              <>
                <p className="text-xs font-semibold text-text leading-tight">{profile?.name || 'Profile'}</p>
                {profile?.age && <p className="text-[10px] text-text/50 leading-tight">{profile.age} yrs</p>}
              </>
            )}
          </div>
          <svg className="w-4 h-4 text-text/40 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </Link>
      </div>
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
                to="/screening?retake=1"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-[var(--radius-button)] border border-text/15
                           text-sm font-medium text-text/70 hover:bg-text/5 hover:text-text transition-all"
              >
                {t('dashboard_retake_screening') || 'Retake screening'}
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
             {t('dashboard_festival_badge')}
          </span>
          <h2 className="font-heading text-sm font-semibold text-text mb-1">
            {t('dashboard_festival_title')}
          </h2>
          <p className="text-xs text-text/50">{t('dashboard_festival_subtitle')}</p>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════════
          EVERYTHING ELSE — Quick Navigation Grid
         ══════════════════════════════════════════════════════════ */}
      <section className="mb-6">
        <h2 className="font-heading text-lg font-bold text-text mb-4">{t('dashboard_everything_title')}</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickCard
            to="/tracker"
            icon={<IconCalendarCheck />}
            title={t('dashboard_card_cycle_title')}
            subtitle={t('dashboard_card_cycle_sub')}
          />
          <QuickCard
            to="/diet"
            icon={<IconDiet />}
            title={t('dashboard_card_diet_title')}
            subtitle={t('dashboard_card_diet_sub')}
          />
          <QuickCard
            to="/lab-report"
            icon={<IconFlask />}
            title={t('dashboard_card_lab_title')}
            subtitle={t('dashboard_card_lab_sub')}
          />
          <QuickCard
            to="/timeline"
            icon={<IconImages />}
            title={t('dashboard_card_timeline_title')}
            subtitle={t('dashboard_card_timeline_sub')}
          />
          <QuickCard
            to="/community"
            icon={<IconUsers />}
            title={t('dashboard_card_community_title')}
            subtitle={t('dashboard_card_community_sub')}
          />
          <QuickCard
            to="/education"
            icon={<IconBook />}
            title={t('dashboard_card_myth_title')}
            subtitle={t('dashboard_card_myth_sub')}
          />
          <QuickCard
            to="/festival"
            icon={<IconSparkles />}
            title={t('dashboard_card_festival_title')}
            subtitle={t('dashboard_card_festival_sub')}
          />
          <QuickCard
            to="/family-explainer"
            icon={<IconUsers />}
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

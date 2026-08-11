import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

/* ── Video sources served from public/video/ ── */
const VIDEOS = {
  en: '/video/pcos-explainer-en.mp4',
  mr: '/video/pcos-explainer-mr.mp4',
};

/* ══════════════════════════════════════════════════════════
   VIDEO EXPLAINER — bilingual player with local lang toggle
   Only touches the video card; does not affect global i18n.
══════════════════════════════════════════════════════════ */
function VideoExplainer({ t }) {
  const [lang, setLang] = useState('en');
  const videoRef = useRef(null);

  const switchLang = (next) => {
    if (next === lang) return;
    // Pause current video before swapping — prevents both playing at once
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setLang(next);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-6 sm:p-8 hover:shadow-md transition-all duration-200">

        {/* ── Top: Copy & Toggle ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-2">
              {t('landing_video_title')}
            </h2>
            <p className="text-xs sm:text-sm text-text/50 leading-relaxed">
              {t('landing_video_subtitle')}
            </p>
          </div>

          {/* Language toggle — compact pill, top-right */}
          <div
            role="group"
            aria-label="Video language"
            className="inline-flex rounded-full bg-text/6 p-0.5 gap-0.5 flex-shrink-0"
          >
            {[{ key: 'en', label: 'English' }, { key: 'mr', label: 'मराठी' }].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchLang(key)}
                aria-pressed={lang === key}
                className={[
                  'px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer leading-none',
                  lang === key
                    ? 'bg-white text-text shadow-sm'
                    : 'text-text/45 hover:text-text/70',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bottom: Real <video> player ── */}
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/5 border border-text/8">
          <video
            key={lang}
            ref={videoRef}
            src={VIDEOS[lang]}
            controls
            preload="metadata"
            playsInline
            className="w-full h-full object-contain rounded-xl"
            aria-label={lang === 'en' ? 'PCOS explainer video in English' : 'PCOS explainer video in Marathi'}
          />
        </div>

      </div>
    </section>
  );
}

function ScreeningModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-text/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 rounded-[var(--radius-card)] p-6 sm:p-8 max-w-sm w-full shadow-lg border border-primary/20 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-heading text-lg font-bold text-text mb-3">
          Already Screened
        </h3>
        <p className="text-sm text-text/70 mb-6 leading-relaxed">
          You've already completed your screening. Would you like to take it again?
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium text-text/60 hover:bg-text/5 transition-colors cursor-pointer"
          >
            No, cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded-[var(--radius-button)] bg-primary text-white text-sm font-medium hover:bg-primary/85 transition-colors shadow-sm cursor-pointer"
          >
            Yes, take again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScreeningClick = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (profile) {
        const { data: existingEntry } = await supabase
          .from('risk_scores')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();
        
        if (existingEntry) {
          setShowModal(true);
          setLoading(false);
          return;
        }
      }
      
      navigate('/screening');
    } catch (err) {
      console.error(err);
      navigate('/screening');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRetake = () => {
    setShowModal(false);
    navigate('/screening?retake=1');
  };

  return (
    <div className="font-body">

      {/* ══════════════════════════════════════════════════════════
          HERO — Two-column: copy + stats
         ══════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 sm:pb-10">
        {/* Audience tag */}
        <p className="text-xs text-text/45 font-medium mb-5 tracking-wide">
          {t('landing_audience_tag')}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* ── Left: Copy ── */}
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-text leading-[1.15] mb-6">
              {t('landing_hero_line1')}{' '}
              <span className="text-primary">{t('landing_hero_line2')}</span>
            </h1>

            <p className="text-sm sm:text-base text-text/60 leading-relaxed mb-8 max-w-lg">
              {t('landing_hero_body')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={handleScreeningClick}
                disabled={loading}
                className="px-6 py-3 rounded-[var(--radius-button)] bg-text text-white text-sm font-semibold
                           hover:bg-text/85 active:scale-[0.97] transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {t('landing_cta_screening')}
              </button>
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
          <div className="space-y-5">
            {/* Main stat: 1 in 5 */}
            <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-6 sm:p-8 hover:shadow-md transition-all duration-200">
              <p className="font-heading text-3xl sm:text-4xl font-bold text-primary mb-2">
                {t('landing_stat_1_in_5')}
              </p>
              <p className="text-sm text-text/60 leading-relaxed">
                {t('landing_stat_1_in_5_body')}
              </p>
            </div>

            {/* Two smaller stats */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-primary/5 border border-text/8 rounded-[var(--radius-card)] p-6 hover:shadow-md transition-all duration-200">
                <p className="font-heading text-2xl font-bold text-primary mb-1">
                  22.5%
                </p>
                <p className="text-xs text-text/50 leading-relaxed">
                  {t('landing_stat_prevalence')}
                </p>
              </div>
              <div className="bg-primary/5 border border-text/8 rounded-[var(--radius-card)] p-6 hover:shadow-md transition-all duration-200">
                <p className="font-heading text-2xl font-bold text-primary mb-1">
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
      <VideoExplainer t={t} />

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

      {/* Screening Modal */}
      <ScreeningModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmRetake}
      />
    </div>
  );
}


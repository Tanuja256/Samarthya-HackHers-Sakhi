import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t, i18n } = useTranslation();

  // ── Language ──
  const [language, setLanguage] = useState(i18n.language);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('sakhi-lang', lang);
  };

  // ── Location Type ──
  const [locationType, setLocationType] = useState('urban');

  // ── Notification Preferences (non-functional toggles) ──
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifWarning, setNotifWarning] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  const locationOptions = [
    { value: 'urban', label: t('onboarding_location_urban') },
    { value: 'semi-urban', label: t('onboarding_location_semi_urban') },
    { value: 'rural', label: t('onboarding_location_rural') },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-accent mb-8">
        {t('settings_title')}
      </h1>

      <div className="space-y-6">

        {/* ── Language Toggle ── */}
        <section className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-text mb-1">
            {t('settings_language_title')}
          </h2>
          <p className="text-sm text-text/50 mb-4">{t('settings_language_desc')}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 py-3 rounded-[var(--radius-button)] border-2 font-medium text-sm
                         transition-all duration-200 cursor-pointer
                         ${language === 'en'
                           ? 'border-primary bg-primary/10 text-primary'
                           : 'border-text/10 text-text/60 hover:border-primary/30'
                         }`}
            >
              {t('settings_language_english')}
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('mr')}
              className={`flex-1 py-3 rounded-[var(--radius-button)] border-2 font-medium text-sm
                         transition-all duration-200 cursor-pointer
                         ${language === 'mr'
                           ? 'border-primary bg-primary/10 text-primary'
                           : 'border-text/10 text-text/60 hover:border-primary/30'
                         }`}
            >
              {t('settings_language_marathi')}
            </button>
          </div>
        </section>

        {/* ── Location Type ── */}
        <section className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-text mb-1">
            {t('settings_location_title')}
          </h2>
          <p className="text-sm text-text/50 mb-4">{t('settings_location_desc')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {locationOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLocationType(value)}
                className={`flex-1 py-3 px-4 rounded-[var(--radius-button)] border-2 font-medium text-sm
                           transition-all duration-200 cursor-pointer
                           ${locationType === value
                             ? 'border-primary bg-primary/10 text-primary'
                             : 'border-text/10 text-text/60 hover:border-primary/30'
                           }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Notification Preferences ── */}
        <section className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-text mb-4">
            {t('settings_notifications_title')}
          </h2>
          <div className="space-y-4">
            <ToggleRow
              label={t('settings_notifications_daily')}
              checked={notifDaily}
              onChange={setNotifDaily}
            />
            <ToggleRow
              label={t('settings_notifications_warning')}
              checked={notifWarning}
              onChange={setNotifWarning}
            />
            <ToggleRow
              label={t('settings_notifications_community')}
              checked={notifCommunity}
              onChange={setNotifCommunity}
            />
            <div className="flex items-center justify-between pt-2 border-t border-text/10">
              <span className="text-sm text-text/70">{t('settings_notifications_time')}</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-3 py-1.5 rounded-[var(--radius-button)] border border-text/15 bg-background
                           text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </section>

        {/* ── Privacy & Data ── */}
        <section className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-text mb-3">
            {t('settings_privacy_title')}
          </h2>
          <p className="text-sm text-text/60 leading-relaxed">
            {t('settings_privacy_body')}
          </p>
        </section>

        {/* ── Data Export ── */}
        <section className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-text mb-1">
            {t('settings_export_title')}
          </h2>
          <p className="text-sm text-text/50 mb-4">{t('settings_export_desc')}</p>
          {/* TODO: Implement data export — query all user tables and create JSON download */}
          <button
            type="button"
            className="px-6 py-2.5 rounded-[var(--radius-button)] border-2 border-secondary text-secondary
                       font-medium text-sm hover:bg-secondary/10 transition-all cursor-pointer"
          >
            {t('settings_export_button')}
          </button>
        </section>

        {/* ── Account Deletion ── */}
        <section className="bg-white/60 backdrop-blur-sm border border-warning/20 rounded-[var(--radius-card)] p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-text mb-1">
            {t('settings_delete_title')}
          </h2>
          <p className="text-sm text-text/50 mb-4">{t('settings_delete_desc')}</p>
          {/* TODO: Implement account deletion — delete all user data, then supabase.auth.admin.deleteUser() */}
          <button
            type="button"
            className="px-6 py-2.5 rounded-[var(--radius-button)] border-2 border-warning text-warning
                       font-medium text-sm hover:bg-warning/10 transition-all cursor-pointer"
          >
            {t('settings_delete_button')}
          </button>
        </section>
      </div>
    </div>
  );
}

/* ── Reusable Toggle Row ── */
function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text/70">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
                   transition-colors duration-200 cursor-pointer
                   ${checked ? 'bg-primary' : 'bg-text/20'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
                     transform transition-transform duration-200
                     ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

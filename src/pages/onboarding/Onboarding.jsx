import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

const TOTAL_STEPS = 3;

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [locationType, setLocationType] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canAdvance = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return age !== '' && Number(age) > 0 && Number(age) < 120;
    if (step === 3) return locationType !== '';
    return false;
  };

  const handleFinish = async () => {
    setSaving(true);
    setError('');

    if (user) {
      const { error: dbError } = await supabase.from('users').upsert({
        auth_id: user.id,
        name: name.trim(),
        age: Number(age),
        location_type: locationType,
      }, { onConflict: 'auth_id' });

      if (dbError) {
        setError(dbError.message);
        setSaving(false);
        return;
      }
    } else {
      // Save locally if the user is testing the screening without an account
      localStorage.setItem('sakhi_onboarding', JSON.stringify({
        name: name.trim(),
        age: Number(age),
        location_type: locationType,
      }));
    }

    setSaving(false);
    navigate('/screening');
  };

  const locationOptions = [
    { value: 'urban', label: t('onboarding_location_urban'), emoji: '🏙️' },
    { value: 'semi-urban', label: t('onboarding_location_semi_urban'), emoji: '🏘️' },
    { value: 'rural', label: t('onboarding_location_rural'), emoji: '🌾' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* ── Progress Bar ── */}
        <div className="mb-8">
          <p className="text-xs text-text/50 text-center mb-3 font-medium">
            {t('onboarding_step', { current: step, total: TOTAL_STEPS })}
          </p>
          <div className="w-full h-2 bg-text/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-8 sm:p-10 shadow-sm">
          {/* ── Welcome Header (shown on step 1) ── */}
          {step === 1 && (
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-accent mb-8 text-center">
              {t('onboarding_welcome')}
            </h1>
          )}

          {/* ── Step 1: Name ── */}
          {step === 1 && (
            <div className="space-y-3">
              <label className="block text-lg font-medium text-text">
                {t('onboarding_name_label')}
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('onboarding_name_placeholder')}
                className="w-full px-4 py-3.5 rounded-[var(--radius-button)] border border-text/15 bg-background
                           focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                           transition-all text-base"
              />
              <p className="text-sm text-text/50">{t('onboarding_name_helper')}</p>
            </div>
          )}

          {/* ── Step 2: Age ── */}
          {step === 2 && (
            <div className="space-y-3">
              <label className="block text-lg font-medium text-text">
                {t('onboarding_age_label')}
              </label>
              <input
                type="number"
                autoFocus
                min="10"
                max="99"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={t('onboarding_age_placeholder')}
                className="w-full px-4 py-3.5 rounded-[var(--radius-button)] border border-text/15 bg-background
                           focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                           transition-all text-base"
              />
              <p className="text-sm text-text/50">{t('onboarding_age_helper')}</p>
            </div>
          )}

          {/* ── Step 3: Location Type ── */}
          {step === 3 && (
            <div className="space-y-3">
              <label className="block text-lg font-medium text-text">
                {t('onboarding_location_label')}
              </label>
              <div className="space-y-3 mt-4">
                {locationOptions.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLocationType(value)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-[var(--radius-button)] border-2
                               text-left transition-all duration-200 cursor-pointer
                               ${locationType === value
                                 ? 'border-primary bg-primary/10 shadow-sm'
                                 : 'border-text/10 bg-background hover:border-primary/30'
                               }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-base font-medium text-text">{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-text/50">{t('onboarding_location_helper')}</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <p className="mt-4 text-sm text-warning bg-warning/10 rounded-[var(--radius-button)] p-3">{error}</p>
          )}

          {/* ── Navigation Buttons ── */}
          <div className="flex items-center justify-between mt-8 gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-[var(--radius-button)] border border-text/15 text-text/70
                           hover:bg-text/5 transition-all text-sm font-medium cursor-pointer"
              >
                {t('onboarding_back')}
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                disabled={!canAdvance()}
                onClick={() => setStep(step + 1)}
                className="px-8 py-3 rounded-[var(--radius-button)] bg-primary text-white font-semibold
                           hover:bg-primary/85 active:scale-[0.98] transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {t('onboarding_next')}
              </button>
            ) : (
              <button
                type="button"
                disabled={!canAdvance() || saving}
                onClick={handleFinish}
                className="px-8 py-3 rounded-[var(--radius-button)] bg-accent text-white font-semibold
                           hover:bg-accent/85 active:scale-[0.98] transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? t('onboarding_saving') : t('onboarding_finish')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

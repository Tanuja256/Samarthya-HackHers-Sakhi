import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth_password_mismatch'));
      return;
    }

    setLoading(true);
    const { data, error: authError } = await signUp(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else if (data?.user?.identities?.length === 0) {
      // User already exists
      setError('An account with this email already exists.');
    } else if (data?.session) {
      // Auto-confirmed (e.g. in dev mode) — go straight to onboarding
      navigate('/onboarding');
    } else {
      // Email confirmation required
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-8 shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-accent mb-2 text-center">
            {t('auth_signup_title')}
          </h1>
          <p className="text-text/60 text-sm text-center mb-8">
            {t('auth_signup_subtitle')}
          </p>

          {success ? (
            <div className="text-center">
              <div className="bg-secondary/10 text-secondary rounded-[var(--radius-button)] p-4 mb-6 text-sm leading-relaxed">
                {t('auth_signup_success')}
              </div>
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors text-sm"
              >
                {t('auth_back_to_login')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text/70 mb-1.5">{t('auth_email')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-[var(--radius-button)] border border-text/15 bg-background
                             focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                             transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text/70 mb-1.5">{t('auth_password')}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-[var(--radius-button)] border border-text/15 bg-background
                             focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                             transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text/70 mb-1.5">{t('auth_confirm_password')}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-[var(--radius-button)] border border-text/15 bg-background
                             focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                             transition-all text-sm"
                />
              </div>

              {error && (
                <p className="text-sm text-warning bg-warning/10 rounded-[var(--radius-button)] p-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-[var(--radius-button)] bg-primary text-white font-semibold
                           hover:bg-primary/85 active:scale-[0.98] transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? '...' : t('auth_signup_button')}
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-5 text-center text-text/50 text-sm">
              {t('auth_has_account')}{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                {t('auth_login_button')}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

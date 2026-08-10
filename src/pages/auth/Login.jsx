import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await signIn(email, password);
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      navigate('/dashboard');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    const { error: resetError } = await resetPassword(forgotEmail);
    setForgotLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setForgotSent(true);
      setError('');
    }
  };

  // ── Forgot Password View ──
  if (showForgot) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-8 shadow-sm">
            <h1 className="font-heading text-2xl font-bold text-accent mb-2 text-center">
              {t('auth_forgot_title')}
            </h1>
            <p className="text-text/60 text-sm text-center mb-8">
              {t('auth_forgot_subtitle')}
            </p>

            {forgotSent ? (
              <div className="text-center">
                <div className="bg-secondary/10 text-secondary rounded-[var(--radius-button)] p-4 mb-6 text-sm">
                  {t('auth_forgot_success')}
                </div>
                <button
                  onClick={() => { setShowForgot(false); setForgotSent(false); }}
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors cursor-pointer"
                >
                  {t('auth_back_to_login')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text/70 mb-1.5">{t('auth_email')}</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
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
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-[var(--radius-button)] bg-primary text-white font-semibold
                             hover:bg-primary/85 active:scale-[0.98] transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {forgotLoading ? '...' : t('auth_forgot_button')}
                </button>

                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setError(''); }}
                  className="w-full text-center text-primary hover:text-primary/80 text-sm font-medium
                             transition-colors cursor-pointer"
                >
                  {t('auth_back_to_login')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Login View ──
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-8 shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-accent mb-2 text-center">
            {t('auth_login_title')}
          </h1>
          <p className="text-text/60 text-sm text-center mb-8">
            {t('auth_login_subtitle')}
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? '...' : t('auth_login_button')}
            </button>
          </form>

          <div className="mt-5 text-center space-y-3">
            <button
              onClick={() => setShowForgot(true)}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors cursor-pointer"
            >
              {t('auth_forgot_password')}
            </button>
            <p className="text-text/50 text-sm">
              {t('auth_no_account')}{' '}
              <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                {t('auth_signup_button')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

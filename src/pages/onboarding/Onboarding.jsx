import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    setSaving(true);
    setError('');

    try {
      if (user) {
        const { error: dbError } = await supabase.from('users').upsert({
          auth_id: user.id,
          // Carry forward name/age/location_type defaults so the row is valid
          name: user.user_metadata?.full_name || 'User',
          age: user.user_metadata?.age || 0,
          location_type: 'urban',
          city: trimmedCity,
        }, { onConflict: 'auth_id' });

        if (dbError) {
          setError(dbError.message);
          setSaving(false);
          return;
        }
      } else {
        localStorage.setItem('sakhi_onboarding', JSON.stringify({
          name: 'User',
          age: 0,
          location_type: 'urban',
          city: trimmedCity,
        }));
      }

      navigate('/screening', { replace: true });
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-8 sm:p-10 shadow-sm">

          {/* Header */}
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl mx-auto mb-5">
            📍
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-accent mb-2 text-center">
            One last thing
          </h1>
          <p className="text-sm text-text/55 text-center mb-8 leading-relaxed">
            Which city are you from? This helps us give you relevant local health tips.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text/70 mb-1.5">
                Your city
              </label>
              <input
                type="text"
                required
                autoFocus
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune, Mumbai, Nashik…"
                className="w-full px-4 py-3.5 rounded-[var(--radius-button)] border border-text/15 bg-background
                           focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                           transition-all text-base"
              />
            </div>

            {error && (
              <p className="text-sm text-warning bg-warning/10 rounded-[var(--radius-button)] p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!city.trim() || saving}
              className="w-full py-3.5 rounded-[var(--radius-button)] bg-primary text-white font-semibold
                         hover:bg-primary/85 active:scale-[0.98] transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? 'Saving…' : 'Continue to Screening'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

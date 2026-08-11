import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const bypassOnboarding = async () => {
      try {
        if (user) {
          // Provide dummy data so ProtectedRoute allows progression to /screening
          // name: 'Profile' matches the fallback in Dashboard
          // age: 0 ensures the age is not displayed (evaluates to falsy)
          await supabase.from('users').upsert({
            auth_id: user.id,
            name: 'Profile',
            age: 0,
            location_type: 'urban',
          }, { onConflict: 'auth_id' });
        } else {
          localStorage.setItem('sakhi_onboarding', JSON.stringify({
            name: 'Profile',
            age: 0,
            location_type: 'urban',
          }));
        }
      } catch (err) {
        console.error('Bypass onboarding error:', err);
      } finally {
        if (mounted) navigate('/screening', { replace: true });
      }
    };
    bypassOnboarding();
    return () => { mounted = false; };
  }, [user, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

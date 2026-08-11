import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

/**
 * ProtectedRoute
 * =============
 * Wraps any route that requires a logged-in session.
 *
 * Guard logic (in order):
 *  1. If auth is still loading → show spinner (no flash).
 *  2. If no session → redirect to /login.
 *  3. If session but no completed onboarding row in `users` →
 *       redirect to /onboarding (unless already there).
 *  4. If onboarding complete but no risk_scores row →
 *       redirect to /screening (unless already on /screening or /onboarding).
 *  5. Otherwise → render children.
 *
 * "Fully set up" is exposed as a boolean on the context so Navbar can
 * use it to decide which links to show.  Rather than adding a new context,
 * we store it in a React context created here and exported.
 */

import { createContext, useContext } from 'react';

export const SetupContext = createContext({ isFullySetUp: false });
export const useSetup = () => useContext(SetupContext);

export default function ProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [isFullySetUp, setIsFullySetUp] = useState(false);

  useEffect(() => {
    // Wait until auth has resolved
    if (authLoading) return;

    // Reset state when path changes in case component is not unmounted
    setChecking(true);

    // No session → send to login
    if (!user) {
      navigate('/login', { replace: true, state: { from: location } });
      setChecking(false);
      return;
    }

    async function runChecks() {
      try {
        // ── Check 1: onboarding row ──────────────────────────────
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id, name, age, location_type')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('ProtectedRoute: users query failed', profileError);
        }

        const onboardingComplete =
          profile &&
          profile.name?.trim() &&
          profile.age != null &&
          profile.location_type?.trim();

        if (!onboardingComplete) {
          // Allow /onboarding itself through to avoid a redirect loop
          if (location.pathname !== '/onboarding') {
            navigate('/onboarding', { replace: true });
          }
          setChecking(false);
          return;
        }

        // ── Check 2: risk_scores row ─────────────────────────────
        const { data: riskScore, error: riskError } = await supabase
          .from('risk_scores')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (riskError) {
          console.error('ProtectedRoute: risk_scores query failed', riskError);
        }

        const screeningComplete = !!riskScore;

        if (!screeningComplete) {
          // Allow /screening and /onboarding through
          const allowedPaths = ['/onboarding', '/screening'];
          if (!allowedPaths.includes(location.pathname)) {
            navigate('/screening', { replace: true });
          }
          setChecking(false);
          return;
        }

        // ── All good ─────────────────────────────────────────────
        setIsFullySetUp(true);

        const allowRetakeScreening =
          location.pathname === '/screening' &&
          (location.search.includes('retake=1') || location.state?.retake === true);

        // If a fully-set-up user lands on /onboarding, or /screening without
        // an explicit retake intent, push them straight to /dashboard.
        if (
          location.pathname === '/onboarding' ||
          (location.pathname === '/screening' && !allowRetakeScreening)
        ) {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('ProtectedRoute: unexpected error', err);
      } finally {
        setChecking(false);
      }
    }

    runChecks();
  }, [user, authLoading, location.pathname, navigate, location.search, location.state]);

  // ── Loading spinner ─────────────────────────────────────────────────
  if (authLoading || checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin block" />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <SetupContext.Provider value={{ isFullySetUp }}>
      {children}
    </SetupContext.Provider>
  );
}

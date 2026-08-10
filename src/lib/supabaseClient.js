import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gracefully handle missing env vars during development.
// The real Supabase client is created only when credentials are configured.
// Until then, a dummy client is provided so the app can render without crashing.
let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    '[Sakhi] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. ' +
    'Supabase features will not work until .env is configured.'
  );
  // Provide a stub that won't crash callers but will fail gracefully
  const notConfigured = () => ({
    data: null,
    error: { message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env' },
  });
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => notConfigured(),
      signInWithPassword: async () => notConfigured(),
      signOut: async () => notConfigured(),
      resetPasswordForEmail: async () => notConfigured(),
    },
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: async () => notConfigured(),
      upsert: async () => notConfigured(),
      update: async () => notConfigured(),
      delete: async () => notConfigured(),
    }),
  };
}

export { supabase };

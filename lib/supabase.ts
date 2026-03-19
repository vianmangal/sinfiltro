import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local',
  );
}

// The service-role key is a JWT (starts with "eyJ"). If it does not,
// the anon key was likely pasted by mistake and RLS will NOT be bypassed.
if (!supabaseServiceKey.startsWith('eyJ')) {
  console.warn(
    '⚠️  SUPABASE_SERVICE_ROLE_KEY does not look like a service-role JWT. ' +
      'Storage and table inserts will fail with RLS errors. ' +
      'Copy the correct key from Supabase Dashboard → Settings → API → service_role.',
  );
}

/**
 * Server-side Supabase client using the service-role key.
 * Only use this in API routes / server components — never expose to the browser.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

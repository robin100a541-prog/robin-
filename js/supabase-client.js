/* ============================================================
   CRJ Fastigheter AB — Supabase Client
   ============================================================
   Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY with
   your actual values from the Supabase project settings.
   ============================================================ */

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const ADMIN_EMAIL = 'crjfastighet@gmail.com';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Returns true if the given user is the admin.
 * @param {object|null} user - Supabase user object
 * @returns {boolean}
 */
function getAdminStatus(user) {
  if (!user) return false;
  return user.email === ADMIN_EMAIL;
}

/**
 * Returns true if Supabase has been configured with real credentials.
 */
function isSupabaseConfigured() {
  return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

import { createClient } from '@supabase/supabase-js';

// Service-role client. Every table has RLS enabled with no policies, so this
// key is the ONLY way to reach the data — it must never be exposed to the
// browser. Vercel keeps it server-side as long as the name has no VITE_ prefix.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('[db] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
}

export const db = createClient(url ?? '', key ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const PHOTO_BUCKET = process.env.SUPABASE_PHOTO_BUCKET ?? 'photos';

/** Throws on a Supabase error so withErrors() can turn it into a 500. */
export function unwrap({ data, error }) {
  if (error) throw new Error(`[supabase] ${error.message}`);
  return data;
}

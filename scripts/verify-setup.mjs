// Checks that Supabase is wired up correctly before you rely on it.
// Reads .env.local (gitignored) for credentials.
//
//   npm run verify
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env parser — avoids taking a dotenv dependency for one script.
let env = {};
try {
  for (const line of readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (m) env[m[1]] = m[2].trim();
  }
} catch {
  console.error('Could not read .env.local — run the setup steps first.');
  process.exit(1);
}

let fail = 0;
const ok = (m) => console.log(`  ok   ${m}`);
const bad = (m) => { fail++; console.log(`  FAIL ${m}`); };

console.log('\nEnvironment');
for (const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SESSION_SECRET','RP_ID','RP_ORIGIN','ADMIN_BOOTSTRAP_TOKEN']) {
  env[key] ? ok(key) : bad(`${key} is empty`);
}
if (env.SESSION_SECRET && env.SESSION_SECRET.length < 32) bad('SESSION_SECRET is under 32 characters');
if (fail) { console.log(`\n${fail} problem(s) — fill these in before continuing.\n`); process.exit(1); }

const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

console.log('\nDatabase');
const counts = {};
for (const table of ['projects','photos','reel_items','admin_credentials','admin_invites']) {
  const { count, error } = await db.from(table).select('*', { count: 'exact', head: true });
  if (error) bad(`table "${table}": ${error.message}`);
  else { counts[table] = count; ok(`table "${table}" exists (${count} rows)`); }
}

console.log('\nSeed data');
if (counts.projects >= 6) ok(`${counts.projects} projects`); else bad(`expected 6 projects, found ${counts.projects ?? 0} — run db/migrate.sql`);
if (counts.photos >= 30) ok(`${counts.photos} photos`); else bad(`expected 30 photos, found ${counts.photos ?? 0}`);
if (counts.reel_items >= 8) ok(`${counts.reel_items} reel items`); else bad(`expected 8 reel items, found ${counts.reel_items ?? 0}`);

console.log('\nStorage');
const bucketName = env.SUPABASE_PHOTO_BUCKET || 'photos';
const { data: buckets, error: bErr } = await db.storage.listBuckets();
if (bErr) bad(`cannot list buckets: ${bErr.message}`);
else {
  const bucket = buckets.find((b) => b.name === bucketName);
  if (!bucket) bad(`bucket "${bucketName}" does not exist — create it`);
  else {
    ok(`bucket "${bucketName}" exists`);
    bucket.public ? ok('bucket is public (images will load on the site)')
                  : bad('bucket is PRIVATE — set it to public or uploaded photos will not display');
  }
}

console.log('\nPasskey config');
try {
  const origin = new URL(env.RP_ORIGIN);
  origin.hostname === env.RP_ID
    ? ok(`RP_ID "${env.RP_ID}" matches RP_ORIGIN`)
    : bad(`RP_ID "${env.RP_ID}" does not match RP_ORIGIN host "${origin.hostname}" — passkeys will fail`);
  origin.protocol === 'https:' ? ok('RP_ORIGIN is https') : bad('RP_ORIGIN must be https');
} catch { bad('RP_ORIGIN is not a valid URL'); }

console.log(fail ? `\n${fail} problem(s) found.\n` : '\nAll checks passed — ready to deploy.\n');
process.exit(fail ? 1 : 0);

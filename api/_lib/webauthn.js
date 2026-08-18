import crypto from 'node:crypto';
import { db, unwrap } from './db.js';

// A single logical admin account; every passkey is another device on it.
export const ADMIN_USER_ID = new TextEncoder().encode('mari-admin');
export const ADMIN_USER_NAME = process.env.ADMIN_USERNAME ?? 'mari';

export const b64u = {
  encode: (buf) => Buffer.from(buf).toString('base64url'),
  decode: (str) => new Uint8Array(Buffer.from(str, 'base64url')),
};

export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export async function listCredentials() {
  return unwrap(
    await db
      .from('admin_credentials')
      .select('id, public_key, counter, transports, device_name, created_at, last_used_at')
      .order('created_at', { ascending: true })
  );
}

export async function countCredentials() {
  const { count, error } = await db
    .from('admin_credentials')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(`[supabase] ${error.message}`);
  return count ?? 0;
}

export async function getCredential(id) {
  const rows = unwrap(
    await db.from('admin_credentials').select('*').eq('id', id).limit(1)
  );
  return rows[0] ?? null;
}

/**
 * Decides whether a registration attempt is allowed, and how.
 *
 * - an active session  -> she is adding a device while already signed in
 * - a valid invite     -> a one-time link she generated from another device
 * - the bootstrap token-> only while zero credentials exist, for the very first key
 */
export async function authorizeRegistration({ session, invite, bootstrap }) {
  if (session) return { ok: true, via: 'session' };

  if (invite) {
    const rows = unwrap(
      await db.from('admin_invites').select('*').eq('token_hash', sha256(invite)).limit(1)
    );
    const row = rows[0];
    if (row && !row.used_at && new Date(row.expires_at) > new Date()) {
      return { ok: true, via: 'invite', inviteHash: row.token_hash };
    }
    return { ok: false };
  }

  if (bootstrap) {
    const expected = process.env.ADMIN_BOOTSTRAP_TOKEN;
    const count = await countCredentials();
    // Only usable before the first passkey exists, so a leaked token is inert
    // the moment setup is finished.
    if (count === 0 && expected && timingSafeEqual(bootstrap, expected)) {
      return { ok: true, via: 'bootstrap' };
    }
  }

  return { ok: false };
}

function timingSafeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

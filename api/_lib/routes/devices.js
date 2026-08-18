import crypto from 'node:crypto';
import { json, methodGuard, withErrors } from '../http.js';
import { requireSession } from '../session.js';
import { db, unwrap } from '../db.js';
import { sha256, countCredentials } from '../webauthn.js';

const INVITE_TTL_MINUTES = 30;

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['POST', 'DELETE'])) return;
  const session = await requireSession(req, res);
  if (!session) return;

  // Mint a one-time link that lets a NEW device enrol its own passkey.
  if (req.method === 'POST') {
    const label = (req.body?.label ?? '').toString().slice(0, 60);
    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + INVITE_TTL_MINUTES * 60_000);

    // Only the hash is stored, so a database leak cannot yield a usable link.
    const { error } = await db.from('admin_invites').insert({
      token_hash: sha256(token),
      label,
      expires_at: expiresAt.toISOString(),
    });
    if (error) throw new Error(`[supabase] ${error.message}`);

    return json(res, 200, {
      token,
      expiresAt: expiresAt.toISOString(),
      expiresInMinutes: INVITE_TTL_MINUTES,
    });
  }

  // Remove a passkey.
  const id = req.body?.id;
  if (!id) return json(res, 400, { error: 'id required' });

  if ((await countCredentials()) <= 1) {
    return json(res, 400, {
      error: 'This is the only passkey left — add another device before removing it.',
    });
  }

  unwrap(await db.from('admin_credentials').delete().eq('id', id).select());
  json(res, 200, { ok: true });
});

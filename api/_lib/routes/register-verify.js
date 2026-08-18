import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { json, methodGuard, withErrors } from '../http.js';
import { rp, takeChallenge, issueSession } from '../session.js';
import { db } from '../db.js';
import { b64u } from '../webauthn.js';

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['POST'])) return;

  const stashed = await takeChallenge(req, res);
  if (!stashed || stashed.kind !== 'reg') {
    return json(res, 400, { error: 'Challenge expired — try again' });
  }

  const { id, origin } = rp();
  const { verified, registrationInfo } = await verifyRegistrationResponse({
    response: req.body,
    expectedChallenge: stashed.challenge,
    expectedOrigin: origin,
    expectedRPID: id,
  });

  if (!verified) return json(res, 400, { error: 'Verification failed' });

  const { credential } = registrationInfo;
  const deviceName = stashed.deviceName || 'Unnamed device';

  const { error } = await db.from('admin_credentials').insert({
    id: credential.id,
    public_key: b64u.encode(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports ?? [],
    device_name: deviceName,
  });
  if (error) throw new Error(`[supabase] ${error.message}`);

  // Burn the invite only once the credential is safely stored, so a failed
  // registration can be retried with the same link.
  if (stashed.inviteHash) {
    await db
      .from('admin_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('token_hash', stashed.inviteHash);
  }

  await issueSession(res, { credentialId: credential.id, deviceName });
  json(res, 200, { ok: true, device: deviceName });
});

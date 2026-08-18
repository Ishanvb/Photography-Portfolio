import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { json, methodGuard, withErrors } from '../http.js';
import { rp, takeChallenge, issueSession } from '../session.js';
import { db } from '../db.js';
import { getCredential, b64u } from '../webauthn.js';

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['POST'])) return;

  const stashed = await takeChallenge(req, res);
  if (!stashed || stashed.kind !== 'auth') {
    return json(res, 400, { error: 'Challenge expired — try again' });
  }

  const response = req.body;
  if (!response?.id) return json(res, 400, { error: 'Malformed response' });

  const stored = await getCredential(response.id);
  if (!stored) return json(res, 401, { error: 'Unrecognised device' });

  const { id, origin } = rp();
  const { verified, authenticationInfo } = await verifyAuthenticationResponse({
    response,
    expectedChallenge: stashed.challenge,
    expectedOrigin: origin,
    expectedRPID: id,
    credential: {
      id: stored.id,
      publicKey: b64u.decode(stored.public_key),
      counter: Number(stored.counter),
      transports: stored.transports ?? [],
    },
  });

  if (!verified) return json(res, 401, { error: 'Verification failed' });

  await db
    .from('admin_credentials')
    .update({
      counter: authenticationInfo.newCounter,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', stored.id);

  await issueSession(res, { credentialId: stored.id, deviceName: stored.device_name });
  json(res, 200, { ok: true, device: stored.device_name });
});

import { generateRegistrationOptions } from '@simplewebauthn/server';
import { json, methodGuard, withErrors } from '../http.js';
import { rp, stashChallenge, getSession } from '../session.js';
import {
  listCredentials, authorizeRegistration, ADMIN_USER_ID, ADMIN_USER_NAME,
} from '../webauthn.js';

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['POST'])) return;

  const { invite, bootstrap, deviceName } = req.body ?? {};
  const session = await getSession(req);
  const auth = await authorizeRegistration({ session, invite, bootstrap });

  // 404, not 403: an unauthorised probe should not learn this endpoint is real.
  if (!auth.ok) return json(res, 404, { error: 'Not found' });

  const existing = await listCredentials();
  const { id, name } = rp();

  const options = await generateRegistrationOptions({
    rpName: name,
    rpID: id,
    userID: ADMIN_USER_ID,
    userName: ADMIN_USER_NAME,
    userDisplayName: ADMIN_USER_NAME,
    attestationType: 'none',
    // Stops the same authenticator being enrolled twice.
    excludeCredentials: existing.map((c) => ({ id: c.id, transports: c.transports ?? [] })),
    authenticatorSelection: {
      residentKey: 'required',    // discoverable, so login needs no username
      userVerification: 'required', // Touch ID / Face ID / PIN
    },
  });

  await stashChallenge(res, options.challenge, {
    kind: 'reg',
    via: auth.via,
    inviteHash: auth.inviteHash ?? null,
    deviceName: deviceName || 'Unnamed device',
  });

  json(res, 200, options);
});

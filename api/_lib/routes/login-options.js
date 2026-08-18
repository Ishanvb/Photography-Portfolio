import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { json, methodGuard, withErrors } from '../http.js';
import { rp, stashChallenge } from '../session.js';

// Passkeys are registered as discoverable credentials, so we deliberately send
// no allowCredentials list — the authenticator picks. That also means this
// endpoint leaks nothing about which (or how many) credentials exist.
export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['POST'])) return;

  const options = await generateAuthenticationOptions({
    rpID: rp().id,
    userVerification: 'required',
  });

  await stashChallenge(res, options.challenge, { kind: 'auth' });
  json(res, 200, options);
});

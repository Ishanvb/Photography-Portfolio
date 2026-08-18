import { SignJWT, jwtVerify } from 'jose';
import { parseCookies, setCookie, clearCookie, json } from './http.js';

export const SESSION_COOKIE = 'mp_session';
export const CHALLENGE_COOKIE = 'mp_challenge';

const SESSION_DAYS = 30;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error('SESSION_SECRET must be set to a random string of 32+ characters');
  }
  return new TextEncoder().encode(s);
}

export async function signSession(payload, ttlSeconds = SESSION_DAYS * 86400) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export async function issueSession(res, { credentialId, deviceName }) {
  const token = await signSession({ sub: 'admin', cid: credentialId, dev: deviceName });
  setCookie(res, SESSION_COOKIE, token, { maxAge: SESSION_DAYS * 86400 });
}

export function endSession(res) {
  clearCookie(res, SESSION_COOKIE);
}

export async function getSession(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  return token ? verifyToken(token) : null;
}

/**
 * Gate for every /api/admin route. Returns the session, or writes a 404 and
 * returns null. 404 rather than 401 so an unauthenticated probe cannot even
 * confirm that these endpoints exist.
 */
export async function requireSession(req, res) {
  const session = await getSession(req);
  if (!session) {
    json(res, 404, { error: 'Not found' });
    return null;
  }
  return session;
}

// --- WebAuthn challenge round-trip -----------------------------------------
// The challenge is issued in one request and verified in the next. Rather than
// persist it, we hand it back as a short-lived signed cookie.

export async function stashChallenge(res, challenge, extra = {}) {
  const token = await signSession({ challenge, ...extra }, 300);
  setCookie(res, CHALLENGE_COOKIE, token, { maxAge: 300 });
}

export async function takeChallenge(req, res) {
  const token = parseCookies(req)[CHALLENGE_COOKIE];
  clearCookie(res, CHALLENGE_COOKIE);
  return token ? verifyToken(token) : null;
}

// --- Relying party ----------------------------------------------------------

export function rp() {
  const id = process.env.RP_ID;
  const origin = process.env.RP_ORIGIN;
  if (!id || !origin) throw new Error('RP_ID and RP_ORIGIN must be set');
  return { id, origin, name: process.env.RP_NAME ?? 'Portfolio Admin' };
}

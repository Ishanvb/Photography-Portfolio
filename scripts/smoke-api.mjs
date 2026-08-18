// Offline smoke test for the API layer: verifies every handler imports, that
// the auth gate rejects anonymous callers with 404 (never 401), that sessions
// sign and verify, and that middleware conceals /admin.
//
// Uses a stub Supabase URL, so calls that get PAST the gate fail at the network
// layer — that failure is the proof the gate let them through.
//
//   npm run smoke
//
process.env.SESSION_SECRET = 'x'.repeat(48);
process.env.RP_ID = 'example.com';
process.env.RP_ORIGIN = 'https://example.com';
process.env.SUPABASE_URL = 'https://stub.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'stub-key';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const base = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function mockRes() {
  const res = {
    statusCode: 200, headers: {}, body: null, headersSent: false,
    status(c) { this.statusCode = c; return this; },
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
    getHeader(k) { return this.headers[k.toLowerCase()]; },
    send(b) { this.body = b; this.headersSent = true; return this; },
  };
  return res;
}
const mockReq = (over = {}) => ({ method: 'POST', url: '/x', headers: {}, query: {}, body: {}, ...over });

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
};

// 1. Every route module imports cleanly.
const routes = ['login-options','login-verify','register-options','register-verify','me','logout',
                'devices','upload-url','derive','projects','photos','reel'];
for (const r of routes) {
  const m = await import(`${base}/api/_lib/routes/${r}.js`);
  check(`import ${r}`, typeof m.default === 'function');
}
const auth = await import(`${base}/api/auth/[action].js`);
const admin = await import(`${base}/api/admin/[action].js`);
const content = await import(`${base}/api/content.js`);
check('import auth dispatcher', typeof auth.default === 'function');
check('import admin dispatcher', typeof admin.default === 'function');
check('import content', typeof content.default === 'function');

// 2. Unknown action -> 404 from both dispatchers.
for (const [name, h] of [['auth', auth.default], ['admin', admin.default]]) {
  const res = mockRes();
  await h(mockReq({ query: { action: 'nope' } }), res);
  check(`${name} unknown action 404`, res.statusCode === 404, `got ${res.statusCode}`);
}

// 3. Session round-trip.
const session = await import(`${base}/api/_lib/session.js`);
const token = await session.signSession({ sub: 'admin', cid: 'abc' });
const payload = await session.verifyToken(token);
check('session signs and verifies', payload?.cid === 'abc');
check('tampered token rejected', (await session.verifyToken(token.slice(0, -3) + 'aaa')) === null);

// 4. Unauthenticated admin routes 404 (never 401 - the surface must stay hidden).
for (const r of ['projects','photos','reel','devices','upload-url','derive']) {
  const m = await import(`${base}/api/_lib/routes/${r}.js`);
  const res = mockRes();
  await m.default(mockReq({ headers: {} }), res);
  check(`${r} rejects anonymous with 404`, res.statusCode === 404, `got ${res.statusCode}`);
}

// 5. A valid session cookie gets past the gate (reaches DB code, which then fails on the stub).
const withCookie = mockReq({ method: 'GET', query: {}, headers: { cookie: `mp_session=${token}` } });
const projectsRoute = (await import(`${base}/api/_lib/routes/projects.js`)).default;
const res5 = mockRes();
await projectsRoute(withCookie, res5);
check('valid session passes the gate', res5.statusCode !== 404, `got ${res5.statusCode}`);

// 6. Method guard.
const logout = (await import(`${base}/api/_lib/routes/logout.js`)).default;
const res6 = mockRes();
await logout(mockReq({ method: 'GET' }), res6);
check('logout rejects GET with 405', res6.statusCode === 405, `got ${res6.statusCode}`);

// 7. Middleware 404s an unauthenticated /admin request.
const mw = (await import(`${base}/middleware.js`)).default;
const r7 = await mw(new Request('https://example.com/admin', { headers: {} }));
check('middleware 404s anonymous /admin', r7?.status === 404, `got ${r7?.status}`);
const r7b = await mw(new Request('https://example.com/admin', { headers: { cookie: `mp_session=${token}` } }));
check('middleware allows valid session', r7b === undefined, `got ${r7b?.status}`);
const r7c = await mw(new Request('https://example.com/admin/login'));
check('middleware always allows /admin/login', r7c === undefined);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

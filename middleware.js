import { jwtVerify } from 'jose';

// Runs before routing on every matched request.
//
// This is the "nobody can even see it" layer: without a valid session cookie,
// /admin and the admin JS chunk return a plain 404, so the admin UI is not
// discoverable by guessing URLs or by reading the built asset manifest.
//
// It is NOT the security boundary. Every /api/admin handler independently
// verifies the same session server-side; if this middleware ever fails to run,
// the data stays protected and only the concealment is lost.
export const config = {
  matcher: ['/admin', '/admin/:path*', '/admin-assets/:path*'],
};

const SESSION_COOKIE = 'mp_session';

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

const notFound = () =>
  new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
  });

export default async function middleware(request) {
  const url = new URL(request.url);

  // The login page must stay reachable while signed out — it is the one door in.
  // It carries no admin markup itself; it only talks to /api/auth.
  if (url.pathname === '/admin/login') return;

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.error('[middleware] SESSION_SECRET is not set');
    return notFound();
  }

  const token = readCookie(request.headers.get('cookie'), SESSION_COOKIE);
  if (!token) return notFound();

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
  } catch {
    return notFound();
  }
  // Valid session — fall through to normal routing (the SPA shell).
}

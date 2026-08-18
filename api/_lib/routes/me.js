import { json, methodGuard, withErrors } from '../http.js';
import { getSession } from '../session.js';
import { listCredentials } from '../webauthn.js';

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['GET'])) return;
  res.setHeader('Cache-Control', 'no-store');

  const session = await getSession(req);
  if (!session) return json(res, 200, { authenticated: false });

  const devices = (await listCredentials()).map((c) => ({
    id: c.id,
    name: c.device_name,
    createdAt: c.created_at,
    lastUsedAt: c.last_used_at,
    current: c.id === session.cid,
  }));

  json(res, 200, { authenticated: true, device: session.dev ?? null, devices });
});

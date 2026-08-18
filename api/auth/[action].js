// Single function fronting every auth action, so the whole auth surface costs
// one of Vercel's 12 Hobby-plan function slots instead of six.
import { json } from '../_lib/http.js';

import loginOptions from '../_lib/routes/login-options.js';
import loginVerify from '../_lib/routes/login-verify.js';
import registerOptions from '../_lib/routes/register-options.js';
import registerVerify from '../_lib/routes/register-verify.js';
import me from '../_lib/routes/me.js';
import logout from '../_lib/routes/logout.js';

const ROUTES = {
  'login-options': loginOptions,
  'login-verify': loginVerify,
  'register-options': registerOptions,
  'register-verify': registerVerify,
  me,
  logout,
};

export default async function handler(req, res) {
  const handle = ROUTES[req.query?.action];
  if (!handle) return json(res, 404, { error: 'Not found' });
  return handle(req, res);
}

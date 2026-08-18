import { json, methodGuard, withErrors } from '../http.js';
import { endSession } from '../session.js';

export default withErrors(async (req, res) => {
  if (!methodGuard(req, res, ['POST'])) return;
  endSession(res);
  json(res, 200, { ok: true });
});

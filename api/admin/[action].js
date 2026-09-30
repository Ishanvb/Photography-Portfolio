// Every admin action behind one function. Each handler independently calls
// requireSession(), so adding a route here cannot accidentally skip the gate.
import { json } from '../_lib/http.js';

import devices from '../_lib/routes/devices.js';
import uploadUrl from '../_lib/routes/upload-url.js';
import derive from '../_lib/routes/derive.js';
import projects from '../_lib/routes/projects.js';
import photos from '../_lib/routes/photos.js';
import reel from '../_lib/routes/reel.js';
import about from '../_lib/routes/about.js';

const ROUTES = {
  devices,
  'upload-url': uploadUrl,
  derive,
  projects,
  photos,
  reel,
  about,
};

export default async function handler(req, res) {
  const handle = ROUTES[req.query?.action];
  if (!handle) return json(res, 404, { error: 'Not found' });
  return handle(req, res);
}
